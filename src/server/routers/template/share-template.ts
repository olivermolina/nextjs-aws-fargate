import prisma from '../../../libs/prisma';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import renderPdfTemplateToBuffer from '../../../utils/render-pdf-template-to-buffer';
import { uploadFileBuffer } from '../user/uploadFileBuffer';
import { UserType } from '@prisma/client';

const shareTemplate = isAuthenticated
  .input(
    z.object({
      patientIds: z.array(z.string()),
      templateId: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { patientIds, templateId } = input;
    const template = await prisma.template.findUnique({
      where: {
        id: templateId,
      },
    });

    if (!template) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Template not found',
      });
    }

    const buffer = await renderPdfTemplateToBuffer(template);

    await Promise.all(
      patientIds.map(async (patientId) => {
        const documentsFolder = await prisma.file.findFirst({
          where: {
            user_id: patientId,
            name: 'Documents',
            type: 'folder',
          },
        });

        const folderId =
          documentsFolder?.id ||
          (
            await prisma.file.create({
              data: {
                user_id: patientId,
                name: 'Documents',
                type: 'folder',
                size: 0,
                s3_key: '',
                s3_bucket: '',
                shared_with_patient: true,
              },
            })
          ).id;

        const fileName = `${template.title.replace(/\s/g, '_')}.pdf`;
        const fileExist = await prisma.subFile.findFirst({
          where: {
            name: fileName,
            file_id: folderId,
          },
        });

        // If template file exist, skip
        if (fileExist) {
          return;
        }

        await uploadFileBuffer({
          userId: patientId,
          buffer,
          fileName,
          type: 'application/pdf',
          rootFolder: `${ctx.user.organization_id}/${patientId}/Documents`,
          folderId: folderId,
          extension: 'pdf',
          signedDocument: false,
          userType: UserType.STAFF,
          createdByUserId: ctx.user.id,
          share: true,
        });
      }),
    );

    return 'Success!';
  });

export default shareTemplate;
