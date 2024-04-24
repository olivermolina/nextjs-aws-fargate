import { isAuthenticated } from '../middleware/isAuthenticated';
import { UploadFileSchema } from 'src/utils/zod-schemas/file-upload';
import { UserType } from '@prisma/client';
import { uploadFileBuffer } from './uploadFileBuffer';

const uploadFile = isAuthenticated.input(UploadFileSchema).mutation(async ({ input, ctx }) => {
  const result = await Promise.all(
    input.files.map(async (file) => {
      const buffer = Buffer.from(file.base64.replace(/^data:.+;base64,/, ''), 'base64');
      const extension = file.name.split('.').pop() || '';

      return await uploadFileBuffer({
        userId: input.userId,
        buffer,
        fileName: file.name,
        type: file.type,
        rootFolder: input.folderId
          ? `${ctx.user.organization_id}/${input.userId}/Documents`
          : `${ctx.user.organization_id}/${input.userId}`,
        folderId: input.folderId,
        extension: extension,
        share: ctx.user.type === UserType.PATIENT || !!input.folderId,
        userType: ctx.user.type,
        createdByUserId: ctx.user.id,
      });
    })
  );

  return result;
});

export default uploadFile;
