import React, { FC, useMemo } from 'react';
import Expand01Icon from '@untitled-ui/icons-react/build/esm/Expand01';
import Minimize01Icon from '@untitled-ui/icons-react/build/esm/Minimize01';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Portal from '@mui/material/Portal';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { Controller, useForm, useWatch } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FaxInput, FaxSchema } from '../../../utils/zod-schemas/fax';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Grid';
import FormHelperText from '@mui/material/FormHelperText';
import UserAvatar from '../../../components/user-avatar';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';
import { useFileInput } from '../../../hooks/use-file-input';
import { FileInput } from '../../../utils/zod-schemas/file-upload';
import { newObjectId } from '../../../utils/new-object-id';
import { zodResolver } from '@hookform/resolvers/zod';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Scrollbar } from '../../../components/scrollbar';
import FaxIcon from '@mui/icons-material/Fax';

type DefaultAttachment = {
  userId?: string;
  id: string;
  type: 'chart' | 'file';
  name: string;
  created_at: Date;
};

interface FaxEditorProps {
  maximize?: boolean;
  onClose?: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
  open?: boolean;
  onSubmit: (data: FaxInput) => void;
  defaultAttachments: DefaultAttachment[];
}

const FaxEditor: FC<FaxEditorProps> = (props) => {
  const {
    maximize = false,
    onClose,
    onMaximize,
    onMinimize,
    open = false,
    onSubmit,
    defaultAttachments,
  } = props;

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    getValues,
    control,
  } = useForm<FaxInput>({
    resolver: zodResolver(FaxSchema),
    mode: 'onChange',
    shouldUnregister: true,
  });
  const parentRef = React.useRef<HTMLDivElement>(null);

  const attachments = useWatch({
    name: 'attachments',
    defaultValue: useMemo(
      () =>
        defaultAttachments.map((attachment) => ({
          id: attachment.id,
          user_id: attachment.userId,
          name: attachment.name,
          size: 0,
          type: 'application/pdf',
          date: attachment.created_at,
          base64: '',
        })),
      [defaultAttachments],
    ),
    control,
  });

  const includeCoverSheet = useWatch({
    name: 'include_cover_sheet',
    defaultValue: true,
    control,
  });

  const chartId = useWatch({
    name: 'chart_id',
    defaultValue: useMemo(
      () => defaultAttachments.find((attachment) => attachment.type === 'chart')?.id || undefined,
      [defaultAttachments],
    ),
    control,
  });

  const fileId = useWatch({
    name: 'chart_id',
    defaultValue: useMemo(
      () => defaultAttachments.find((attachment) => attachment.type === 'file')?.id || undefined,
      [defaultAttachments],
    ),
    control,
  });

  const inputFileRef = React.useRef<HTMLInputElement>(null);

  const { handleFileInput } = useFileInput();

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileInput(e, async (file: FileInput) => {
      if (file.base64) {
        setValue('attachments', [
          ...(attachments || []),
          {
            id: newObjectId(),
            name: file.name,
            type: file.type,
            base64: file.base64,
            date: new Date(),
            size: file.size,
          },
        ]);
      }
    });
  };

  const handleRemoveAttachment = (id: string) => {
    const attachments = getValues('attachments') || [];
    setValue('attachments', attachments?.filter((attachment) => attachment.id !== id));
  };

  const [accordionState, setAccordionState] = React.useState({
    information: true,
    attachments: true,
    coverSheet: true,
  });

  const handleOnSubmit = async (data: FaxInput) => {
    await onSubmit({
      ...data,
      attachments,
      chart_id: chartId,
      file_id: fileId,
    });
  };

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setAccordionState({
        information: true,
        attachments: true,
        coverSheet: true,
      });
    }
  }, [errors]);

  if (!open) {
    return null;
  }

  return (
    <Portal ref={parentRef}>
      <Backdrop open={maximize} />
      <form
        onSubmit={handleSubmit(handleOnSubmit)}
        id={'send-fax-module'}
      >
        <Paper
          sx={{
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            margin: 3,
            maxHeight: (theme) => `calc(100% - ${theme.spacing(6)})`,
            maxWidth: (theme) => `calc(100% - ${theme.spacing(6)})`,
            outline: 'none',
            position: 'fixed',
            right: 0,
            width: 600,
            zIndex: 1400,
            overflow: 'hidden',
            ...(maximize && {
              borderRadius: 0,
              height: '100%',
              margin: 0,
              maxHeight: '100%',
              maxWidth: '100%',
              width: '100%',
            }),
          }}
          elevation={12}
        >
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              px: 2,
              py: 1,
              backgroundColor: 'primary',
            }}
          >
            <Stack
              spacing={1}
              direction={'row'}
              alignItems={'center'}
            >
              <SvgIcon>
                <FaxIcon />
              </SvgIcon>
              <Typography variant="h6">Send Fax</Typography>
            </Stack>
            <Box sx={{ flexGrow: 1 }} />
            {maximize ? (
              <IconButton onClick={onMinimize}>
                <SvgIcon>
                  <Minimize01Icon />
                </SvgIcon>
              </IconButton>
            ) : (
              <IconButton onClick={onMaximize}>
                <SvgIcon>
                  <Expand01Icon />
                </SvgIcon>
              </IconButton>
            )}
            <IconButton onClick={onClose}>
              <SvgIcon>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Box>
          <Divider />
          <Scrollbar
            sx={{
              maxHeight: !parentRef.current ? 600 : Number(parentRef.current?.clientHeight) - 150,
              ...(maximize && {
                height: (theme) => `calc(100% - ${theme.spacing(15)})`,
              }),
            }}
          >
            <Box
              sx={{
                p: 2,
                minHeight: 600,
              }}
            >
              {/*Recipient Information*/}
              <Accordion
                expanded={accordionState.information}
                onChange={() =>
                  setAccordionState((state) => ({
                    ...state,
                    information: !state.information,
                  }))
                }
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="information-content"
                  id="information-header"
                  sx={{
                    backgroundColor: 'neutral.100',
                  }}
                >
                  Recipient Information
                </AccordionSummary>
                <AccordionDetails>
                  <Grid
                    container
                    spacing={{ xs: 1, lg: 2 }}
                  >
                    <Grid
                      item
                      xs={12}
                      lg={6}
                    >
                      <FormControl
                        fullWidth
                        error={!!errors.recipient_first_name}
                      >
                        <FormLabel
                          sx={{
                            color: 'text.primary',
                            mb: 1,
                          }}
                        >
                          First Name
                        </FormLabel>

                        <OutlinedInput
                          fullWidth
                          {...register('recipient_first_name')}
                        />
                        <FormHelperText>{errors?.recipient_first_name?.message}</FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      lg={6}
                    >
                      <FormControl
                        fullWidth
                        error={!!errors.recipient_last_name}
                      >
                        <FormLabel
                          sx={{
                            color: 'text.primary',
                            mb: 1,
                          }}
                        >
                          Last Name *
                        </FormLabel>

                        <OutlinedInput
                          fullWidth
                          {...register('recipient_last_name')}
                        />

                        <FormHelperText>{errors?.recipient_last_name?.message}</FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      lg={6}
                    >
                      <FormControl
                        fullWidth
                        error={!!errors.to_number}
                      >
                        <FormLabel
                          sx={{
                            color: 'text.primary',
                            mb: 1,
                          }}
                        >
                          Fax Number*
                        </FormLabel>
                        <OutlinedInput
                          type={'number'}
                          fullWidth
                          {...register('to_number')}
                        />
                        <FormHelperText>{errors?.to_number?.message}</FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      lg={6}
                    >
                      <FormControl fullWidth>
                        <FormLabel
                          sx={{
                            color: 'text.primary',
                            mb: 1,
                          }}
                        >
                          Business Name
                        </FormLabel>
                        <OutlinedInput
                          fullWidth
                          {...register('recipient_business_name')}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/*Attachments*/}
              <Accordion
                expanded={accordionState.attachments}
                onChange={() =>
                  setAccordionState((state) => ({
                    ...state,
                    attachments: !state.attachments,
                  }))
                }
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="attachment-content"
                  id="attachment-header"
                  sx={{
                    backgroundColor: 'neutral.100',
                  }}
                >
                  Attachments
                </AccordionSummary>
                <AccordionDetails>
                  <Stack
                    direction={'column'}
                    spacing={1}
                    sx={{
                      width: '100%',
                    }}
                  >
                    {attachments?.map((attachment) => (
                      <Stack
                        direction={'row'}
                        key={attachment.id}
                        justifyContent={'space-between'}
                      >
                        <Stack
                          spacing={1}
                          direction={'row'}
                          alignItems={'center'}
                        >
                          {attachment.user_id && (
                            <UserAvatar
                              userId={attachment.user_id}
                              height={24}
                              width={24}
                              includeFullName
                              spacing={1}
                            />
                          )}
                          <Typography variant={'body2'}>
                            {attachment.name} - {dayjs(attachment.date).format('MMM DD, YYYY')}
                          </Typography>
                        </Stack>
                        <IconButton onClick={() => handleRemoveAttachment(attachment.id)}>
                          <SvgIcon fontSize={'small'}>
                            <CloseIcon fontSize={'inherit'} />
                          </SvgIcon>
                        </IconButton>
                      </Stack>
                    ))}
                    <Divider />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <input
                        ref={inputFileRef}
                        type={'file'}
                        name={'fax-input-file'}
                        id="fax-input-file-id"
                        value={''}
                        onChange={handleAttachFile}
                        style={{
                          display: 'none',
                        }}
                        accept="application/pdf"
                      />
                      <label htmlFor="fax-input-file-id">
                        <Button
                          variant={'outlined'}
                          size={'small'}
                          startIcon={
                            <SvgIcon>
                              <AddIcon />
                            </SvgIcon>
                          }
                          onClick={() => inputFileRef.current?.click()}
                          fullWidth
                        >
                          Add Document
                        </Button>
                      </label>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/*Cover Sheet*/}
              <Accordion expanded={accordionState.coverSheet}>
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      onClick={() =>
                        setAccordionState((state) => ({
                          ...state,
                          coverSheet: !state.coverSheet,
                        }))
                      }
                    />
                  }
                  aria-controls="attachment-content"
                  id="attachment-header"
                  sx={{
                    backgroundColor: 'neutral.100',
                  }}
                >
                  <Stack
                    alignItems={'center'}
                    spacing={2}
                    direction={'row'}
                  >
                    <Typography>Cover Sheet</Typography>
                    <Controller
                      name="include_cover_sheet"
                      control={control}
                      defaultValue={true}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              defaultChecked
                              size={'small'}
                            />
                          }
                          disableTypography
                          label={'Include cover sheet'}
                        />
                      )}
                    />
                  </Stack>
                </AccordionSummary>
                {includeCoverSheet && (
                  <AccordionDetails>
                    <FormControl
                      fullWidth
                      error={!!errors.subject}
                    >
                      <FormLabel
                        sx={{
                          color: 'text.primary',
                          mb: 1,
                        }}
                      >
                        Subject
                      </FormLabel>
                      <OutlinedInput
                        fullWidth
                        {...register('subject')}
                      />
                      <FormHelperText>{errors?.subject?.message}</FormHelperText>
                    </FormControl>
                    <FormControl fullWidth>
                      <FormLabel
                        sx={{
                          color: 'text.primary',
                          my: 2,
                        }}
                      >
                        Remarks
                      </FormLabel>

                      <OutlinedInput
                        fullWidth
                        {...register('remarks')}
                        multiline
                        rows={4}
                      />
                    </FormControl>
                    <Controller
                      name="include_header_per_page"
                      control={control}
                      defaultValue={true}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              defaultChecked
                              size={'small'}
                            />
                          }
                          disableTypography
                          label={'Include header on every page'}
                        />
                      )}
                    />
                  </AccordionDetails>
                )}
              </Accordion>
            </Box>
          </Scrollbar>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              position: 'sticky',
              bottom: 0,
              py: 2,
              backgroundColor: 'background.paper',
            }}
          >
            <Button
              type={'submit'}
              variant="contained"
              disabled={isSubmitting}
            >
              Send Fax
              {isSubmitting && (
                <CircularProgress
                  sx={{ ml: 1 }}
                  size={20}
                />
              )}
            </Button>
          </Box>
        </Paper>
      </form>
    </Portal>
  );
};

export default FaxEditor;
