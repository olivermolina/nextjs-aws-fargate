import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Fade, Skeleton, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import { ChartItemType, LogAction } from '@prisma/client';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import { Controller, useForm } from 'react-hook-form';
import {
  CreateChartItemInput,
  UpdateChartInput,
  UpdateChartSchema,
} from '../../../utils/zod-schemas/chart';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from '@mui/material/Select';
import { trpc } from '../../../app/_trpc/client';
import { useStaffsStore } from '../../../hooks/use-staffs-store';
import { getUserFullName } from '../../../utils/get-user-full-name';
import toast from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import Menu from '@mui/material/Menu';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDialog } from '../../../hooks/use-dialog';
import CustomerProfileConfirmationDeleteChartDialog from './customer-profile-delete-chart-dialog';
import { paths } from '../../../paths';
import { useRouter } from '../../../hooks/use-router';
import Grid from '@mui/material/Grid';
import { usePopover } from '../../../hooks/use-popover';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import { useCreateLog } from '../../../hooks/use-create-log';
import CustomItem from '../../../icons/untitled-ui/duocolor/custom-item';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { useCreateChartingNote } from '../../../hooks/use-create-charting-note';
import ChartingNoteModal from '../../components/charting-note/charting-note-modal';
import { chartItemMap } from '../../components/charting-note/chart-items-list';
import CustomerProfileChartItemDnd from './customer-profile-chart-item-dnd';
import BackdropLoading from '../account/account-billing-reactivate-backdrop';
import { useGenerateChartPdf } from '../../../hooks/use-generate-chart-pdf';
import FaxEditor from '../fax/fax-editor';
import { useFaxCompose } from '../../../hooks/use-fax-compose';
import CustomerProfileChartHistoryCard from './customer-profile-chart-history-card';
import CustomerProfileChartRenderAppointmentItem from './customer-profile-chart-appointment-item';
import { useChartTemplate } from '../../../hooks/useChartTemplate';
import ChartTemplateShareModal from '../../components/charting-note/chart-template-share-modal';
import ArticleIcon from '@mui/icons-material/Article';

type CustomerProfileFileCardProps = {
  id: string;
  userId: string;
};

const CustomerProfileChartingNote = ({ id, userId }: CustomerProfileFileCardProps) => {
  const popover = usePopover<HTMLButtonElement>();
  const [custom, setCustom] = React.useState<string | null>(null);
  const router = useRouter();
  const [editName, setEditName] = React.useState(false);
  const deleteDialog = useDialog();
  const [alertVisibility, setAlertVisibility] = useState(false);
  const movedItemRef = useRef<number | null>(null);
  const { data: chartTemplates } = trpc.chart.templateList.useQuery();
  const handleCustom = (event: React.MouseEvent<HTMLElement>, newCustom: string | null) => {
    setCustom(newCustom);
    if (newCustom === 'modal') {
      createChartingNote.dialog.handleOpen(chart?.items.length || 0);
    } else {
      popover.handleOpen();
    }
  };

  const morePopover = usePopover<HTMLButtonElement>();

  const staffStore = useStaffsStore();
  const {
    data: chart,
    isLoading: chartLoading,
    refetch,
    error: chartError,
  } = trpc.chart.get.useQuery(
    {
      id,
    },
    {
      refetchOnWindowFocus: false,
      retry: 0,
    }
  );

  const scrollToNewItemIndex = (index: number) => {
    movedItemRef.current = index;
  };

  const createChartingNote = useCreateChartingNote(id, scrollToNewItemIndex);

  const mutation = trpc.chart.update.useMutation();
  const deleteMutation = trpc.chart.delete.useMutation();

  const { data: appointments, isLoading: appointmentLoading } = trpc.consultation.list.useQuery(
    {
      rowsPerPage: 1000,
      page: 0,
      userId: userId,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const signMutation = trpc.chart.sign.useMutation();
  const handleSign = async () => {
    morePopover.handleClose();
    try {
      await signMutation.mutateAsync({
        id,
      });
      setAlertVisibility(true);
      await refetch();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const {
    formState: { errors },
    register,
    handleSubmit,
    control,
    reset,
    resetField,
  } = useForm<UpdateChartInput>({
    resolver: zodResolver(UpdateChartSchema),
  });
  const toggleEdit = () => {
    setEditName((prev) => {
      if (prev) {
        resetField('name');
      }
      return !prev;
    });
  };

  const onSubmit = async (data: UpdateChartInput) => {
    try {
      const response = await mutation.mutateAsync(data);
      reset({
        ...response,
        consultation_id: response.consultation_id || '',
        assigned_to_id: response.assigned_to_id || '',
      });
      setEditName(false);
      setAlertVisibility(true);
    } catch (e) {
      toast.error(e.message);
    }
  };
  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        id,
      });
      deleteDialog.handleClose();
      toast.success('Charting note deleted');
      router.push(paths.dashboard.customers.index + `/${userId}?tab=profile`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const createLog = useCreateLog();

  const handleNew = (order: number) => {
    createChartingNote.dialog.handleOpen(order);
  };

  const { generateChartPdf, isLoading } = useGenerateChartPdf(id);

  const faxCompose = useFaxCompose();

  const chartTemplate = useChartTemplate(id);

  const backdropLoading = useMemo(() => {
    if (isLoading) {
      return {
        message: 'Generating Chart PDF...',
        open: true,
      };
    }

    if (faxCompose.isLoading) {
      return {
        message: 'Sending Fax...',
        open: true,
      };
    }

    if (chartTemplate.isLoading) {
      return {
        message: 'Saving chart as template...',
        open: true,
      };
    }

    return {
      message: '',
      open: false,
    };
  }, [faxCompose.isLoading, isLoading, chartTemplate.isLoading]);

  useEffect(() => {
    if (chart) {
      createLog.save({
        user_id: userId,
        text: 'the charting note',
        action: LogAction.VIEW,
        chart_id: chart.id,
      });

      reset({
        ...chart,
        consultation_id: chart.consultation_id || '',
        assigned_to_id: chart.assigned_to_id || '',
      });
    }
  }, [chart?.id]);

  if (chartLoading) {
    return (
      <Paper
        elevation={12}
        sx={{
          height: '100%',
          width: '100%',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            height: '100%',
            width: '100%',
          }}
        >
          <Stack
            direction={'row'}
            justifyContent={'space-between'}
            sx={{ p: 2, width: '100%' }}
          >
            <Skeleton
              width={100}
              height={50}
            />
            <Stack
              direction={'row'}
              justifyContent={'space-between'}
              spacing={2}
            >
              <Skeleton
                width={50}
                height={50}
              />
              <Skeleton
                width={50}
                height={50}
              />
            </Stack>
          </Stack>
          <Divider />
          <Grid
            spacing={1}
            container
            justifyContent={'flex-start'}
          >
            <Grid
              item
              xs={6}
            >
              <Skeleton
                height={50}
                sx={{
                  mx: 4,
                }}
              />
            </Grid>

            <Grid
              item
              xs={6}
            >
              <Skeleton
                height={50}
                sx={{
                  mx: 4,
                }}
              />
            </Grid>

            <Grid
              item
              xs={6}
            >
              <Skeleton
                height={50}
                sx={{
                  mx: 4,
                }}
              />
            </Grid>
          </Grid>

          <Divider />

          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Skeleton
              variant={'rectangular'}
              sx={{
                mx: 4,
                mb: 2,
                p: 2,
                flexGrow: 1,
              }}
            />
          </Box>
        </Stack>
      </Paper>
    );
  }

  if (chartError?.data?.code === 'FORBIDDEN') {
    return (
      <Typography
        variant={'caption'}
        color={'text.secondary'}
      >
        You are not allowed to access this chart.
      </Typography>
    );
  }

  if (!chart && !chartLoading) {
    return (
      <Typography
        variant={'caption'}
        color={'text.secondary'}
      >
        No charting note found
      </Typography>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ height: '100%' }}
        id={'charting-note-form'}
      >
        <Paper
          elevation={24}
          sx={{
            height: '100%',
            borderRadius: 1,
          }}
        >
          <Stack
            sx={{
              height: '100%',
            }}
            justifyContent={'flex-start'}
          >
            {/* Header */}
            <Stack
              direction={'row'}
              justifyContent={'space-between'}
              sx={{
                p: 2,
              }}
            >
              <Stack
                direction={'row'}
                spacing={1}
                justifyContent={'center'}
                alignItems={'center'}
              >
                {editName ? (
                  <TextField
                    variant={'standard'}
                    size={'small'}
                    {...register('name')}
                  />
                ) : (
                  <Typography variant={'h6'}>{chart?.name}</Typography>
                )}
                <IconButton
                  onClick={toggleEdit}
                  size={'small'}
                >
                  {editName ? (
                    <SvgIcon>
                      <XIcon />
                    </SvgIcon>
                  ) : (
                    <SvgIcon>
                      <Edit02Icon />
                    </SvgIcon>
                  )}
                </IconButton>
              </Stack>
              <Stack
                direction={'row'}
                spacing={2}
              >
                <Fade
                  in={alertVisibility}
                  timeout={{ enter: 1000, exit: 1000 }}
                  addEndListener={() => {
                    setTimeout(() => {
                      setAlertVisibility(false);
                    }, 3000);
                  }}
                >
                  <Alert
                    icon={<CheckIcon fontSize="inherit" />}
                    severity="success"
                  >
                    Saved
                  </Alert>
                </Fade>

                <Button
                  variant={'contained'}
                  type={'submit'}
                  disabled={mutation.isLoading}
                >
                  Save
                  {mutation.isLoading && (
                    <CircularProgress
                      sx={{ ml: 1 }}
                      size={20}
                    />
                  )}
                </Button>
                <Button
                  variant={'outlined'}
                  endIcon={
                    <SvgIcon>
                      <ChevronDownIcon />
                    </SvgIcon>
                  }
                  onClick={morePopover.handleOpen}
                  ref={morePopover.anchorRef}
                >
                  More
                </Button>
                <Menu
                  id="actions-menu"
                  anchorEl={morePopover.anchorRef.current}
                  open={morePopover.open}
                  onClose={morePopover.handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'actions-button',
                  }}
                >
                  {!chart.signed_by_id && <MenuItem onClick={handleSign}>Sign</MenuItem>}

                  {chart && (
                    <MenuItem
                      onClick={() => {
                        morePopover.handleClose();
                        generateChartPdf();
                      }}
                    >
                      Generate PDF
                    </MenuItem>
                  )}

                  <MenuItem
                    onClick={() => {
                      morePopover.handleClose();
                      faxCompose.handleOpen();
                    }}
                  >
                    Send Fax
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      chartTemplate.handleSaveAsTemplate();
                      morePopover.handleClose();
                    }}
                  >
                    Save as Template
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    sx={{
                      color: 'red',
                    }}
                    onClick={deleteDialog.handleOpen}
                  >
                    Delete
                    <DeleteIcon
                      fontSize="small"
                      color={'error'}
                    />
                  </MenuItem>
                </Menu>
              </Stack>
            </Stack>
            <Divider />
            {/* Body */}
            <Stack
              spacing={2}
              sx={{
                height: '100%',
              }}
              justifyContent={'flex-start'}
            >
              <Grid
                container
                sx={{
                  p: 2,
                }}
              >
                <Grid
                  item
                  xs={12}
                  lg={6}
                  sx={{
                    pr: { xs: 0, lg: 2 },
                  }}
                >
                  <FormControl
                    fullWidth
                    error={!!errors.type}
                  >
                    <FormLabel
                      sx={{
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      Assigned To
                    </FormLabel>

                    <Controller
                      control={control}
                      name={'assigned_to_id'}
                      defaultValue={''}
                      render={({ field }) => {
                        return (
                          <Select
                            onChange={field.onChange}
                            input={<OutlinedInput id="select-assigned_to_id" />}
                            value={field.value}
                            placeholder={'Select staff'}
                          >
                            <MenuItem
                              disabled
                              value={''}
                            >
                              <em>Select staff</em>
                            </MenuItem>
                            {staffStore.staffs.map((staff) => (
                              <MenuItem
                                key={staff.id}
                                value={staff.id}
                              >
                                {getUserFullName(staff)}
                              </MenuItem>
                            ))}
                          </Select>
                        );
                      }}
                    />
                    {!!errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid
                  item
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    fullWidth
                    error={!!errors.type}
                  >
                    <FormLabel
                      sx={{
                        color: 'text.primary',
                        mb: 1,
                        mt: { xs: 2, lg: 0 },
                      }}
                    >
                      Appointment
                    </FormLabel>

                    <Controller
                      control={control}
                      name={'consultation_id'}
                      defaultValue={''}
                      render={({ field }) => {
                        return (
                          <Select
                            onChange={field.onChange}
                            input={<OutlinedInput id="select-appointment" />}
                            value={field.value}
                            renderValue={(selected) => {
                              const appointment = appointments?.items.find(
                                (item) => item.id === selected,
                              );
                              if (!appointment) {
                                return null;
                              }

                              return (
                                <CustomerProfileChartRenderAppointmentItem
                                  appointment={appointment}
                                  direction={'row'}
                                  alignItems={'center'}
                                />
                              );
                            }}
                            placeholder={'Select appointment'}
                          >
                            {appointmentLoading ? (
                              <MenuItem
                                disabled
                                value={''}
                              >
                                <CircularProgress
                                  sx={{
                                    mr: 1,
                                  }}
                                  size={20}
                                />
                                <em>Loading...</em>
                              </MenuItem>
                            ) : (
                              <MenuItem
                                disabled
                                value={''}
                              >
                                <em>Select appointment</em>
                              </MenuItem>
                            )}

                            {appointments?.items.map((appointment) => (
                              <MenuItem
                                key={appointment.id}
                                value={appointment.id}
                              >
                                <CustomerProfileChartRenderAppointmentItem
                                  appointment={appointment}
                                  direction={'column'}
                                />
                              </MenuItem>
                            ))}
                          </Select>
                        );
                      }}
                    />
                    {!!errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid
                  item
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    fullWidth
                    error={!!errors.type}
                    sx={{
                      pt: 2,
                      pr: 2,
                    }}
                  >
                    <FormLabel
                      sx={{
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      Customize Note
                    </FormLabel>

                    <ToggleButtonGroup
                      value={custom}
                      exclusive
                      onChange={handleCustom}
                    >
                      <ToggleButton value="modal">
                        <SvgIcon color={'primary'}>
                          <CustomItem />
                        </SvgIcon>
                      </ToggleButton>
                      <ToggleButton
                        value={'select'}
                        ref={popover.anchorRef}
                      >
                        <Stack
                          direction={'row'}
                          justifyContent={'space-between'}
                          sx={{
                            width: '100%',
                          }}
                        >
                          <Typography sx={{ textTransform: 'none', color: 'black' }}>
                            Add Elements or Template
                          </Typography>
                          <SvgIcon>
                            <ChevronDownIcon />
                          </SvgIcon>
                        </Stack>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </FormControl>
                </Grid>
              </Grid>
              <Divider sx={{ borderBottomWidth: '2px' }} />

              <CustomerProfileChartItemDnd
                items={chart.items}
                handleNew={handleNew}
                movedItemRef={movedItemRef}
              />

              <Box
                sx={{
                  p: 2,
                }}
              >
                <CustomerProfileChartHistoryCard chart={chart} />
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </form>

      <CustomerProfileConfirmationDeleteChartDialog
        isLoading={deleteMutation.isLoading}
        open={deleteDialog.open}
        handleClose={deleteDialog.handleClose}
        handleDelete={handleDelete}
      />

      <ChartingNoteModal
        open={createChartingNote.dialog.open}
        handleClose={() => {
          createChartingNote.dialog.handleClose();
          setCustom(null);
        }}
        onSelectItem={(input: CreateChartItemInput) => {
          createChartingNote.handleNewChartItem(input, scrollToNewItemIndex);
          scrollToNewItemIndex(input.order || chart.items.length);
        }}
        onSelectTemplateItem={createChartingNote.handleApplyTemplate}
        patientId={chart.user_id}
        chartId={chart.id}
        type={'items'}
        order={createChartingNote.dialog.data}
      />

      <Menu
        id="chart-custom-menu"
        anchorEl={popover.anchorRef.current}
        open={popover.open}
        onClose={popover.handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
      >
        {Object.entries(chartItemMap)
          .filter(([, { isClinicalProfile, disabled }]) => !isClinicalProfile && !disabled)
          .map(([key, { icon: Icon, label }]) => (
            <MenuItem
              sx={{
                width: popover.anchorRef.current?.clientWidth,
              }}
              key={key}
              onClick={() => {
                popover.handleClose();
                createChartingNote.handleNewChartItem(
                  {
                    userId: userId,
                    itemType: key as ChartItemType,
                    order: chart.items.length,
                    service_datetime: new Date(),
                    chartId: chart.id,
                  },
                  scrollToNewItemIndex,
                );
                scrollToNewItemIndex(chart.items.length);
              }}
            >
              <Stack
                direction={'row'}
                spacing={2}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'neutral.100',
                  },
                }}
              >
                <SvgIcon
                  sx={{
                    color: 'primary.main',
                  }}
                  fontSize={'medium'}
                >
                  <Icon />
                </SvgIcon>
                <Typography variant={'subtitle1'}>{label}</Typography>
              </Stack>
            </MenuItem>
          ))}

        <Divider />

        <MenuItem
          disabled
          sx={{
            '&.Mui-disabled': {
              opacity: 1,
            },
          }}
        >
          <Typography
            variant={'caption'}
            color={'text.secondary'}
          >
            Clinical Profile
          </Typography>
        </MenuItem>
        {Object.entries(chartItemMap)
          .filter(([, { isClinicalProfile, disabled }]) => isClinicalProfile && !disabled)
          .map(([key, { icon: Icon, label }]) => (
            <MenuItem
              sx={{
                width: popover.anchorRef.current?.clientWidth,
              }}
              key={key}
              onClick={() => {
                popover.handleClose();
                createChartingNote.handleNewChartItem(
                  {
                    userId: userId,
                    itemType: key as ChartItemType,
                    order: chart.items.length,
                    service_datetime: new Date(),
                    chartId: chart.id,
                  },
                  scrollToNewItemIndex,
                );
              }}
            >
              <Stack
                direction={'row'}
                spacing={2}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'neutral.100',
                  },
                }}
              >
                <SvgIcon
                  sx={{
                    color: 'primary.main',
                  }}
                  fontSize={'medium'}
                >
                  <Icon />
                </SvgIcon>
                <Typography variant={'subtitle1'}>{label}</Typography>
              </Stack>
            </MenuItem>
          ))}

        {Array.isArray(chartTemplates) && chartTemplates.length > 0 && (
          <>
            <Divider />
            <MenuItem
              disabled
              sx={{
                '&.Mui-disabled': {
                  opacity: 1,
                },
              }}
            >
              <Typography
                variant={'caption'}
                color={'text.secondary'}
              >
                Templates
              </Typography>
            </MenuItem>
            {chartTemplates.map((template) => (
              <MenuItem
                key={template.id}
                onClick={() => {
                  createChartingNote.handleApplyTemplate(template);
                  popover.handleClose();
                }}
              >
                <Stack
                  direction={'row'}
                  spacing={2}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'neutral.100',
                    },
                  }}
                >
                  <SvgIcon
                    sx={{
                      color: 'primary.main',
                    }}
                    fontSize={'medium'}
                  >
                    <ArticleIcon />
                  </SvgIcon>
                  <Typography variant={'subtitle1'}>{template.title}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </>
        )}
      </Menu>

      <BackdropLoading
        open={backdropLoading.open}
        message={backdropLoading.message}
      />

      {faxCompose.state.isOpen && (
        <FaxEditor
          open={faxCompose.state.isOpen}
          maximize={faxCompose.state.isFullScreen}
          onClose={faxCompose.handleClose}
          onMaximize={faxCompose.handleMaximize}
          onMinimize={faxCompose.handleMinimize}
          onSubmit={faxCompose.handleSave}
          defaultAttachments={[
            {
              id: chart.id,
              type: 'chart',
              userId: chart.user_id,
              name: chart.name,
              created_at: chart.created_at,
            },
          ]}
        />
      )}

      {chartTemplate.dialog.data && (
        <ChartTemplateShareModal
          templateId={chartTemplate.dialog.data}
          open={chartTemplate.dialog.open}
          handleClose={chartTemplate.dialog.handleClose}
          handleShare={chartTemplate.handleShare}
        />
      )}
    </>
  );
};

export default React.memo(CustomerProfileChartingNote);
