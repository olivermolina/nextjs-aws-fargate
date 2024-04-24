import React, { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { File, FileDropzone } from 'src/components/file-dropzone';
import { trpc } from 'src/app/_trpc/client';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { FileInput } from 'src/utils/zod-schemas/file-upload';
import attachFiles from '../../../server/routers/chat/attach-files';

interface FileUploaderProps {
  onClose?: () => void;
  open?: boolean;
  submitFileUpload: any;
  setFileInputs: React.Dispatch<React.SetStateAction<FileInput[]>>;
  isLoading: boolean;
}

export const FileUploader: FC<FileUploaderProps> = (props) => {
  const { onClose, open = false, submitFileUpload, setFileInputs, isLoading } = props;
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    setFiles([]);
  }, [open]);

  const handleDrop = useCallback((newFiles: File[]): void => {
    setFiles((prevFiles) => {
      return [...prevFiles, ...newFiles];
    });
  }, []);

  const handleRemove = useCallback((file: File): void => {
    setFiles((prevFiles) => {
      return prevFiles.filter((_file) => _file.path !== file.path);
    });
    setFileInputs([]);
  }, []);

  const handleRemoveAll = useCallback((): void => {
    setFiles([]);
  }, []);

  useEffect(() => {
    if (files.length === 0) setFileInputs([]);

    const getBase64 = (file: File, cb: any) => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function() {
        cb(reader.result);
      };
      reader.onerror = function(error) {
        console.log('Error: ', error);
      };
    };

    for (let file of files) {
      getBase64(file, (result: string) => {
        setFileInputs((prevBase64Files) => {
          return [
            ...prevBase64Files,
            {
              name: file.name,
              size: file.size,
              type: file.type,
              base64: result,
            },
          ];
        });
      });
    }
  }, [files]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={3}
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h6">Upload Files</Typography>
        <IconButton
          color="inherit"
          onClick={onClose}
        >
          <SvgIcon>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <DialogContent>
        <FileDropzone
          accept={{ '*/*': [] }}
          files={files}
          onDrop={handleDrop}
          onRemove={handleRemove}
          onRemoveAll={handleRemoveAll}
          onUpload={submitFileUpload}
          isLoading={isLoading}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

FileUploader.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
