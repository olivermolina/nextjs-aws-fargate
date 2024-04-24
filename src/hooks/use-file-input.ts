import React from 'react';
import { FileInput } from 'src/utils/zod-schemas/file-upload';

export const useFileInput = () => {
  const [fileInput, setFileInput] = React.useState<(FileInput & { isEdited: boolean }) | null>(
    null
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, callback?: any) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      if (reader.result) {
        setFileInput({
          name: file.name,
          size: file.size,
          type: file.type,
          base64: reader.result as string,
          isEdited: true,
        });
        callback?.({
          name: file.name,
          size: file.size,
          type: file.type,
          base64: reader.result as string,
        });
      }
    };
  };

  return { fileInput, handleFileInput, setFileInput };
};
