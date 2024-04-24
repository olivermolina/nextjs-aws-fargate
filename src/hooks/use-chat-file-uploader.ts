import { trpc } from '../app/_trpc/client';
import { useCallback, useState } from 'react';
import { FileInput } from '../utils/zod-schemas/file-upload';
import toast from 'react-hot-toast';

export const useChatFileUploader = (toUserId: string, threadId?: string) => {
  const chatMutation = trpc.chat.attachFiles.useMutation();
  const [fileInputs, setFileInputs] = useState<FileInput[]>([]);

  const submitFileUpload = useCallback(async () => {
    if (!toUserId) {
      toast.error('User not found');
      return;
    }
    try {
      const response = await chatMutation.mutateAsync({
        toUserId,
        files: fileInputs,
        threadId,
      });
      toast.success('File uploaded successfully');
      return response;
    } catch (e) {
      toast.error(e.message);
    }
  }, [fileInputs, threadId, toUserId]);

  return {
    submitFileUpload,
    setFileInputs,
    isLoading: chatMutation.isLoading,
  };
};
