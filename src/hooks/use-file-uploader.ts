import { useParams } from 'next/navigation';
import { trpc } from '../app/_trpc/client';
import { useCallback, useState } from 'react';
import { FileInput } from '../utils/zod-schemas/file-upload';
import toast from 'react-hot-toast';
import { useSearchParams } from './use-search-params';

export const useFileUploader = (refetch: any, userIdProp?: string) => {
  const searchParams = useSearchParams();
  const selectedFolderId = searchParams.get('folderId');
  const params = useParams();
  const mutation = trpc.user.uploadFile.useMutation();
  const [fileInputs, setFileInputs] = useState<FileInput[]>([]);

  const submitFileUpload = useCallback(async () => {
    const userId = userIdProp || (params.customerId as string);

    if (!userId) {
      toast.error('User not found');
      return;
    }
    try {
      const response = await mutation.mutateAsync({
        userId,
        files: fileInputs,
        folderId: selectedFolderId || undefined,
      });
      refetch();
      toast.success('File uploaded successfully');
      return response;
    } catch (e) {
      toast.error(e.message);
    }
  }, [fileInputs, refetch, selectedFolderId]);

  return {
    submitFileUpload,
    setFileInputs,
    isLoading: mutation.isLoading,
  };
};
