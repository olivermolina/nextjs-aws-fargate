import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { FaxAttachment, FaxSchema } from '../../../utils/zod-schemas/fax';
import { FileInput } from '../../../utils/zod-schemas/file-upload';
import { Upload } from '@aws-sdk/lib-storage';
import s3Client from '../../../libs/aws-s3';
import { getBaseUrl } from '../../../utils/get-base-url';
import { getChartPdf } from '../pdf';
import dayjs from 'dayjs';
import { QueueFaxRequestBuilder } from 'srfax-node';
import { TRPCError } from '@trpc/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { urlToBase64 } from '../user/getSignedUrlFile';
import crypto from 'crypto';
import { decode } from '../../../utils/jwt';
import { SrFaxInput } from '../../../utils/zod-schemas/srfax';
import { getCountryFaxCode } from '../../../utils/get-country-code';

export const faxUploadS3File = async (file: FileInput, organizationId: string) => {
  try {
    const buffer = Buffer.from(file.base64.replace(/^data:.+;base64,/, ''), 'base64');

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${organizationId}/fax-attachments/${file.name}`,
      Body: buffer,
      ContentType: file.type,
    };
    const result = await new Upload({
      client: s3Client,
      params,
    }).done();
    return result.Key || '';
  } catch (error) {
    console.error(error);

    return '';
  }
};
const createFax = isAuthenticated.input(FaxSchema).mutation(async ({ input, ctx }) => {
  const srFaxSettings = await prisma.sRFaxSettings.findUnique({
    where: {
      organization_id: ctx.user.organization_id,
    },
    include: {
      organization: {
        select: {
          billing_address: true,
          address: true,
        },
      },
    },
  });

  if (!srFaxSettings) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'SRFax service is not configured. Please contact support.',
    });
  }

  const { include_header_per_page, attachments, ...inputs } = input;

  let faxAttachments: FaxAttachment[] = [];
  if (attachments) {
    faxAttachments = await Promise.all(
      attachments
        ?.filter((attachment) => attachment.base64 !== '')
        .map(async (attachment) => {
          const s3Key = await faxUploadS3File(attachment, ctx.user.organization_id);
          return {
            id: attachment.id,
            file_name: attachment.name,
            file_type: attachment.type,
            file_s3_key: s3Key,
            base64: attachment.base64,
            date: attachment.date,
          };
        })
    );
  }

  if (input.chart_id) {
    const attachment = attachments?.find((attachment) => attachment.id === input.chart_id);
    if (attachment) {
      const chart = await prisma.chart.findUnique({
        where: {
          id: input.chart_id,
        },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });
      const url = getBaseUrl() + `/chart/${input.chart_id}`;
      const base64 = await getChartPdf(url, ctx);
      const filename = `${chart?.user.first_name} ${chart?.user
        .last_name} - ${chart?.name} - ${dayjs(chart?.created_at).format('MMM DD, YYYY')}.pdf`;
      const s3Key = await faxUploadS3File(
        {
          ...attachment,
          base64,
          name: filename,
        },
        ctx.user.organization_id,
      );
      faxAttachments.push({
        id: attachment.id,
        file_name: filename,
        file_type: attachment.type,
        file_s3_key: s3Key,
        date: attachment.date,
        base64,
      });
    }
  }

  if (input.file_id) {
    const attachment = attachments?.find((attachment) => attachment.id === input.file_id);
    if (attachment) {
      const file = await prisma.file.findUnique({
        where: {
          id: input.file_id,
        },
      });
      if (file) {
        const command = new GetObjectCommand({
          Bucket: file.s3_bucket || process.env.AWS_S3_BUCKET_NAME,
          Key: file.s3_key,
        });
        // @ts-ignore
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        const base64 = await urlToBase64(signedUrl);
        faxAttachments.push({
          id: attachment.id,
          file_name: attachment.name,
          file_type: attachment.type,
          file_s3_key: file?.s3_key || '',
          date: attachment.date,
          base64: base64,
        });
      }
    }
  }

  const accountCode = crypto.randomBytes(10).toString('hex');
  const fax = await prisma.fax.create({
    data: {
      ...inputs,
      staff_id: ctx.user.id,
      action: 'sent',
      status: '',
      status_message: '',
      attachments: faxAttachments.map(({ base64, ...others }) => others),
      account_code: accountCode,
    },
  });
  const countryFaxCode = getCountryFaxCode(
    srFaxSettings.organization.address?.country ||
    srFaxSettings.organization.billing_address?.country ||
    'US',
  );

  const { account_number, access_password } = decode(srFaxSettings.access_token) as Pick<
    SrFaxInput,
    'account_number' | 'access_password'
  >;
  const accessId = Number(account_number);
  const builder = new QueueFaxRequestBuilder(accessId, access_password);
  builder
    .setCallerId(Number(srFaxSettings.fax_number))
    .setSenderEmail(ctx.user.email)
    .setFaxType('single')
    .setToFaxNumber(`${countryFaxCode}${input.to_number}`)
    .setFaxFromHeader(`${ctx.user.organization.name}`)
    .setResponseFormat('json')
    .setAccountCode(accountCode)
    .setRetries(2);

  if (input.include_cover_sheet) {
    builder
      .setCoverPage('Standard')
      .setCoverPageFromName(`${ctx.user.first_name} ${ctx.user.last_name}`)
      .setCoverPageToName(`${input.recipient_first_name} ${input.recipient_last_name}`)
      .setCoverPageOrg(input.recipient_business_name || '')
      .setCoverPageSubject(input.include_header_per_page ? input.subject || '' : '')
      .setCoverPageComments(input.include_header_per_page ? input.remarks || '' : '');
  }

  faxAttachments.forEach((attachment) => {
    builder.addFile(attachment.file_name, attachment.base64);
  });
  const result = await builder.build().submit();

  await prisma.fax.update({
    where: {
      id: fax.id,
    },
    data: {
      status: result.Status,
      status_message: result.Status === 'Failed' ? result.Result : null,
      fax_details_id: result.Status === 'Success' ? result.Result?.toString() : null,
    },
  });

  if (result.Status === 'Failed') {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: result.Result,
    });
  }

  return fax;
});
export default createFax;
