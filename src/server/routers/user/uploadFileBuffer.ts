import prisma from '../../../libs/prisma';
import { Upload } from '@aws-sdk/lib-storage';
import s3Client from '../../../libs/aws-s3';
import { addNotification } from '../notification/addNotification';
import { LogAction, UserType } from '@prisma/client';
import {
  sendPatientDocumentNotification,
  sendStaffDocumentNotification,
} from '../../../utils/send-mail';

type UploadFileBufferType = {
  userId: string;
  buffer: Buffer;
  fileName: string;
  type: string;
  extension: string;
  rootFolder: string;
  folderId?: string;
  share?: boolean;
  signedDocument?: boolean;
  userType: UserType;
  createdByUserId: string;
};

export const uploadFileBuffer = async ({
                                         userId,
                                         buffer,
                                         fileName,
                                         type,
                                         rootFolder,
                                         folderId,
                                         extension,
                                         share,
                                         signedDocument,
                                         userType,
                                         createdByUserId,
                                       }: UploadFileBufferType) => {
  let fileId: string = '';
  if (folderId) {
    const subFile = await prisma.subFile.create({
      data: {
        name: fileName,
        type: type,
        size: buffer.length,
        s3_key: '',
        s3_bucket: '',
        file_id: folderId,
      },
    });
    fileId = subFile.id;
  } else {
    const file = await prisma.file.create({
      data: {
        user_id: userId,
        name: fileName,
        type: type,
        size: buffer.length,
        s3_key: '',
        s3_bucket: '',
        shared_with_patient: share || false,
      },
    });
    fileId = file.id;
  }

  if (!fileId) return;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${rootFolder}/${fileId}.${extension}`,
    Body: buffer,
    ContentType: type,
  };
  const upload = await new Upload({
    client: s3Client,
    params,
  }).done();

  const userDetails = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      staffs: {
        include: {
          staff: true,
        },
      },
      organization: true,
    },
  });

  const assignedStaffsIds = userDetails.staffs.map((staff) => staff.staffId);

  // Notify users by email
  if (userType === UserType.PATIENT) {
    userDetails.staffs.forEach((row) =>
      sendStaffDocumentNotification({
        fileId: fileId,
        patient: userDetails,
        staff: row.staff,
        folderId: folderId || '',
      }),
    );
  } else {
    const result = userDetails.staffs.find((row) => row.staffId === createdByUserId);
    if (result && share) {
      sendPatientDocumentNotification({
        fileId,
        patient: userDetails,
        staff: result.staff,
        folderId: folderId || '',
        clinicName: userDetails.organization.name,
      });
    }
  }

  if (folderId) {
    let description = signedDocument ? 'signed document' : 'uploaded a file';
    if (userType === UserType.STAFF && share) {
      description = 'shared a document.';
    }

    await addNotification({
      organizationId: userDetails.organization_id,
      toUserIds: userType === UserType.STAFF ? [userId] : assignedStaffsIds,
      notificationsCreateManyInput: {
        from_user_id: createdByUserId,
        sub_file_id: fileId,
        description,
      },
    });

    const subFile = await prisma.subFile.update({
      where: {
        id: fileId,
      },
      data: {
        s3_key: upload.Key,
        s3_bucket: upload.Bucket,
      },
    });

    if (userType === UserType.STAFF) {
      await prisma.log.create({
        data: {
          user_id: userId,
          text: `the file`,
          staff_id: createdByUserId,
          action: LogAction.CREATE,
          sub_file_id: subFile.id,
        },
      });
    }

    return subFile;
  }

  await addNotification({
    organizationId: userDetails.organization_id,
    toUserIds: userType === UserType.STAFF ? [userId] : assignedStaffsIds,
    notificationsCreateManyInput: {
      from_user_id: createdByUserId,
      file_id: fileId,
      description: 'uploaded file',
    },
    // Do not show notification to patient if file is not shared with patient
    deleted: userType === UserType.STAFF && !share,
  });

  const file = await prisma.file.update({
    where: {
      id: fileId,
    },
    data: {
      s3_key: upload.Key,
      s3_bucket: upload.Bucket,
    },
  });

  if (userType === UserType.STAFF) {
    await prisma.log.create({
      data: {
        user_id: userId,
        text: `the file`,
        staff_id: createdByUserId,
        action: LogAction.CREATE,
        file_id: file.id,
      },
    });
  }


  return file;
};
