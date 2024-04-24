import { ChartFile } from '@prisma/client';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useDialog } from '../../../hooks/use-dialog';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import OutlinedInput from '@mui/material/OutlinedInput';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import {
  ChartWithProfileChartItemType,
} from '../../dashboard/customer/customer-profile-chart-item';
import ChartCardItemContainer from './chart-card-item-container';
import ChartCardItemTitle from './chart-card-item-title';
import { DraggableProvided } from 'react-beautiful-dnd';
import { File, FileDropzone } from '../../../components/file-dropzone';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ImageIcon from '@mui/icons-material/Image';
import { useFileInput } from '../../../hooks/use-file-input';
import { FileInput } from '../../../utils/zod-schemas/file-upload';
import Tooltip from '@mui/material/Tooltip';
import { Scrollbar } from '../../../components/scrollbar';

type Props = {
  chartId: string;
  itemId: string;
  file: ChartFile & {
    signedUrl?: string | null;
  };
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  removeMoveItemRef?: () => void;
  provided?: DraggableProvided;
  readOnly?: boolean;
};

export default function FileUploadItem({
                                         file,
                                         chartId,
                                         itemId,
                                         removeMoveItemRef,
                                         readOnly,
                                         ...otherProps
                                       }: Props) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(
    trpc.chart.get,
    {
      id: chartId,
    },
    'query',
  );
  const imageDialogInputFileRef = React.useRef<HTMLInputElement>(null);
  const imageInputFileRef = React.useRef<HTMLInputElement>(null);
  const { handleFileInput, setFileInput } = useFileInput();
  const [alertVisibility, setAlertVisibility] = useState(false);
  const dialog = useDialog<{
    file?: (FileInput & { isEdited?: boolean }) | null;
    description?: string | null;
  }>();
  const mutation = trpc.chart.saveFile.useMutation({
    // When mutate is called:
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      // Snapshot the previous value
      const previousChartData = queryClient.getQueryData(queryKey, {
        exact: true,
      }) as ChartWithProfileChartItemType;
      const newChartData = {
        ...previousChartData,
        items: previousChartData.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              ChartFile: {
                ...item.ChartFile,
                ...newData,
                ...(newData.file && {
                  signedUrl: newData.file.name === '' ? '' : newData.file.base64,
                  file_name: newData.file.name === '' ? 'Upload' : newData.file.name,
                  file_type: newData.file.type,
                }),
                file_description: newData.file_description,
              },
            };
          }
          return item;
        }),
      };

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newChartData);

      // // Return a context object with the snapshotted value
      return { previousChartData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousChartData);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
  const fileDescriptionRef = React.useRef<HTMLInputElement>(null);
  const deleteMutation = trpc.chart.deleteFile.useMutation({
    // When mutate is called:
    onMutate: async () => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      // Snapshot the previous value
      const previousChartData = queryClient.getQueryData(queryKey, {
        exact: true,
      }) as ChartWithProfileChartItemType;
      const newChartData = {
        ...previousChartData,
        items: previousChartData.items.filter((item) => item.id !== itemId),
      };
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newChartData);
      // // Return a context object with the snapshotted value
      return { previousChartData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousChartData);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const onSaveDescription = async (value: string) => {
    removeMoveItemRef?.();
    try {
      await mutation.mutateAsync({
        id: file.id,
        file_description: value,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };

  const handleSaveDialogFile = async () => {
    removeMoveItemRef?.();
    dialog.handleClose();
    try {
      if (fileDescriptionRef.current) {
        fileDescriptionRef.current.defaultValue = dialog.data?.description || '';
        fileDescriptionRef.current.value = dialog.data?.description || '';
      }
      await mutation.mutateAsync({
        id: file.id,
        file_description: dialog.data?.description,
        ...(dialog.data?.file &&
          dialog.data.file.isEdited && {
            file: dialog.data?.file,
          }),
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };
  const handleDelete = async () => {
    removeMoveItemRef?.();
    try {
      await deleteMutation.mutateAsync({
        id: file.id,
      });

      toast.success('File/Image deleted successfully');
    } catch (e) {
      toast.error('Unable to delete File/Image. Please try again later.');
    }
  };
  const handleInputChange = debounce((value: string) => {
    onSaveDescription(value);
  }, 1000);

  const handleDrop = useCallback((newFiles: File[]): void => {
    if (newFiles.length === 0) {
      setFileInput(null);
      return;
    }

    const newFile = newFiles[0];
    if (!newFile) {
      setFileInput(null);
      return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(newFile);
    reader.onload = async function() {
      setFileInput({
        name: newFile.name,
        size: newFile.size,
        type: newFile.type,
        base64: reader.result as string,
        isEdited: true,
      });

      try {
        await mutation.mutateAsync({
          id: file.id,
          file: {
            name: newFile.name,
            size: newFile.size,
            type: newFile.type,
            base64: reader.result as string,
          },
        });
        setAlertVisibility(true);
      } catch (e) {
        toast.error('Unable to upload file/image. Please try again later.');
      }
    };

    reader.onerror = function(error) {
      console.log('Error: ', error);
    };
  }, []);

  const handleDialogDrop = useCallback((newFiles: File[]): void => {
    if (newFiles.length === 0) {
      return;
    }

    const newFile = newFiles[0];
    if (!newFile) {
      return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(newFile);
    reader.onload = async function() {
      dialog.handleOpen({
        ...dialog.data,
        file: {
          name: newFile.name,
          size: newFile.size,
          type: newFile.type,
          base64: reader.result as string,
          isEdited: true,
        },
      });
    };

    reader.onerror = function(error) {
      console.log('Error: ', error);
    };
  }, []);

  const handlefileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileInput(e, async (newFile: FileInput) => {
      try {
        await mutation.mutateAsync({
          id: file.id,
          file: newFile,
        });
        setAlertVisibility(true);
      } catch (e) {
        toast.error('Unable to upload file/image. Please try again later.');
      }
    });
  };

  const isImageFileType = useMemo(() => {
    return file?.file_type?.includes('image');
  }, [file]);

  const dialogImageFileType = useMemo(() => {
    return dialog.data?.file?.type.includes('image');
  }, [dialog.data]);

  const handleDialogFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileInput(e, async (newFile: FileInput) => {
      if (newFile.base64) {
        dialog.handleOpen({
          ...dialog.data,
          file: newFile,
        });
      }
    });
  };

  const clearFile = () => {
    setFileInput(null);
    dialog.handleOpen({
      ...dialog.data,
      file: {
        name: '',
        size: 0,
        type: '',
        base64: '',
        isEdited: true,
      },
    });
  };

  const handleOpenEditModal = useCallback(() => {
    dialog.handleOpen({
      file: {
        name: file.file_name || '',
        size: 0,
        base64: file.signedUrl || '',
        type: file.file_type || '',
      },
      description: file.file_description,
    });
  }, [file]);

  return (
    <ChartCardItemContainer
      {...otherProps}
      readOnly={readOnly}
      title={
        <ChartCardItemTitle
          label={file.label || 'Upload'}
          isLoading={mutation.isLoading}
          alertVisibility={alertVisibility}
          setAlertVisibility={setAlertVisibility}
          handleOpen={readOnly ? undefined : handleOpenEditModal}
        />
      }
      sectionLabel={'File/Image'}
      handleDelete={handleDelete}
      handleEdit={readOnly ? undefined : handleOpenEditModal}
    >
      <Stack
        spacing={1}
        sx={{
          px: readOnly ? 1 : 0,
        }}
      >
        <Box
          sx={{
            borderRadius: '0.25rem',
            border: readOnly ? 'none' : `2px dotted ${theme.palette.neutral[400]}`,
            position: 'relative',
            width: '100%',
            maxHeight: '600px',
          }}
        >
          <Scrollbar
            sx={{
              maxHeight: '590px',
              width: '100%',
            }}
          >
            {file.signedUrl || readOnly ? (
              <Box>
                {isImageFileType ? (
                  <img
                    src={file.signedUrl || ''}
                    alt={'File / Image'}
                    style={{
                      maxWidth: '600px',
                      maxHeight: '800px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <iframe
                    src={file.signedUrl || ''}
                    width="600px"
                    height="800px"
                  />
                )}
              </Box>
            ) : (
              <FileDropzone
                accept={{ 'image/*': [], 'application/pdf': [] }}
                files={[]}
                onDrop={handleDrop}
                onUpload={async () => console.log('onUpload')}
                maxFiles={1}
              />
            )}
          </Scrollbar>
        </Box>

        {!readOnly && (
          <div>
            <input
              ref={imageInputFileRef}
              type={'file'}
              name={'sketch-image'}
              id="image-file-button"
              value={''}
              onChange={handlefileUpload}
              style={{
                display: 'none',
              }}
              accept="image/*,application/pdf"
            />
            <label htmlFor="image-file-button">
              <Button
                variant={'outlined'}
                startIcon={<ImageIcon />}
                sx={{
                  borderColor: theme.palette.neutral[200],
                  color: 'inherit',
                  '&:hover': {
                    borderColor: theme.palette.neutral[400],
                  },
                }}
                onClick={() => imageInputFileRef.current?.click()}
              >
                Choose File
              </Button>
            </label>
          </div>
        )}

        {readOnly ? (
          <Box
            component={'div'}
            dangerouslySetInnerHTML={{ __html: file.file_description || '' }}
          />
        ) : (
          <FormControl>
            <FormLabel
              sx={{
                color: 'text.primary',
                mb: 1,
              }}
            >
              File Description
            </FormLabel>
            <OutlinedInput
              inputRef={fileDescriptionRef}
              onChange={(event) => handleInputChange(event.target.value)}
              sx={{
                flexGrow: 1,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
              defaultValue={file.file_description}
              multiline
              rows={4}
              placeholder={'Description'}
            />
          </FormControl>
        )}
      </Stack>

      {!readOnly && (
        <Dialog
          fullWidth
          maxWidth="sm"
          open={dialog.open}
        >
          <DialogTitle>
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              spacing={3}
            >
              <Typography variant="h6">Edit File/Image</Typography>
              <IconButton
                color="inherit"
                onClick={dialog.handleClose}
              >
                <SvgIcon>
                  <XIcon />
                </SvgIcon>
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Default Image
              </FormLabel>

              <Box
                sx={{
                  width: '100%',
                  maxHeight: '650px',
                  borderRadius: '0.25rem',
                  border: `2px dotted ${theme.palette.neutral[400]}`,
                  p: 1,
                }}
              >
                <Scrollbar
                  sx={{
                    maxHeight: '640px',
                    width: '100%',
                  }}
                >
                  {!dialog.data?.file?.base64 ? (
                    <FileDropzone
                      accept={{ 'image/*': [], 'application/pdf': [] }}
                      files={[]}
                      onDrop={handleDialogDrop}
                      onUpload={async () => console.log('onUpload')}
                      maxFiles={1}
                    />
                  ) : (
                    <>
                      {dialogImageFileType ? (
                        <img
                          src={dialog.data?.file?.base64 || ''}
                          alt={'File/Image'}
                          style={{
                            maxWidth: '800px',
                            maxHeight: '600px',
                          }}
                        />
                      ) : (
                        <iframe
                          src={dialog.data?.file?.base64 || ''}
                          width="800px"
                          height="600px"
                        />
                      )}
                    </>
                  )}
                </Scrollbar>
              </Box>

              <Box
                sx={{
                  pt: 1,
                }}
              >
                <input
                  ref={imageDialogInputFileRef}
                  type={'file'}
                  name={'sketch-image'}
                  id="image-file-button-dialog"
                  value={''}
                  onChange={handleDialogFileChange}
                  style={{
                    display: 'none',
                  }}
                  accept="image/*,application/pdf"
                />
                <label htmlFor="image-file-button-dialog">
                  <Button
                    variant={'outlined'}
                    startIcon={<ImageIcon />}
                    sx={{
                      borderColor: theme.palette.neutral[200],
                      color: 'inherit',
                      '&:hover': {
                        borderColor: theme.palette.neutral[400],
                      },
                    }}
                    onClick={() => imageDialogInputFileRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </label>
                <Tooltip title={'Remove File'}>
                  <IconButton
                    onClick={clearFile}
                    size={'small'}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize={'inherit'} />
                  </IconButton>
                </Tooltip>
              </Box>
            </FormControl>

            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                  mt: 1,
                }}
              >
                File Description
              </FormLabel>
              <OutlinedInput
                value={dialog.data?.description}
                onChange={(e) =>
                  dialog.handleOpen({
                    ...dialog.data,
                    description: e.target.value || '',
                  })
                }
                sx={{
                  flexGrow: 1,
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                }}
                defaultValue={dialog.data?.description || ''}
                multiline
                rows={4}
                placeholder={'Description'}
              />
            </FormControl>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: 'space-between',
              display: 'flex',
              alignItems: 'center',
              mx: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={handleDelete}
            >
              <DeleteIcon color={'error'} />
            </IconButton>
            <Stack
              direction={'row'}
              spacing={1}
              alignItems={'center'}
            >
              {mutation.isLoading && (
                <CircularProgress
                  sx={{ ml: 1 }}
                  size={20}
                />
              )}
              <Button
                autoFocus
                onClick={dialog.handleClose}
                variant={'outlined'}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveDialogFile}
                variant={'contained'}
                disabled={mutation.isLoading}
              >
                Save
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>
      )}
    </ChartCardItemContainer>
  );
}
