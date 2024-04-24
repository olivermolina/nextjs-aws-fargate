'use client';

import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { customersApi } from 'src/api/customers';

import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { CustomerBasicDetails } from 'src/sections/dashboard/customer/customer-basic-details';

import { CustomerInvoices } from 'src/sections/dashboard/customer/customer-invoices';
//import { CustomerProfile } from 'src/sections/dashboard/customer/customer-profile';
import CustomerProfile from 'src/sections/dashboard/customer/customer-profile';

import { CustomerLogs } from 'src/sections/dashboard/customer/customer-logs';
import { CustomerFiles } from 'src/sections/dashboard/customer/customer-files';
import { CustomerLog } from 'src/types/customer';
import { Patient, PatientWithInvoices } from 'src/types/patient';
import { trpc } from 'src/app/_trpc/client';
import { useParams, useRouter } from 'next/navigation';

import { LogAction, RolePermissionLevel, User } from '@prisma/client';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomerConfirmationDeleteDialog
  from 'src/sections/dashboard/customer/customer-confirmation-delete-dialog';
import toast from 'react-hot-toast';
import { InvoiceCreateDialog } from 'src/sections/dashboard/invoice/invoice-create-dialog';
import { useStaffsStore } from 'src/hooks/use-staffs-store';
import { useCreateInvoice } from 'src/hooks/use-create-invoice';
import { CalendarEventDialog } from 'src/sections/dashboard/calendar/calendar-event-dialog';
import { useDialog } from 'src/hooks/use-dialog';
import { CreateDialogData } from '../../calendar/page';
import { useAuth } from 'src/hooks/use-auth';
import {
  CustomerWelcomeEmailDialog,
} from 'src/sections/dashboard/customer/customer-welcome-email-dialog';
import { useInvite } from 'src/hooks/use-invite-patient';
import { CustomerAddressDetails } from 'src/sections/dashboard/customer/customer-address-details';
import moment from 'moment-timezone';
import { useServiceStore } from 'src/hooks/use-services-store';
import { useGetPermissionByResource } from '../../../../hooks/use-get-permission-by-resource';
import { PermissionResourceEnum } from '../../../../hooks/use-role-permissions';
import CustomerChatHistory from '../../../../sections/dashboard/customer/customer-chat-history';
import {
  CustomerAssignStaffModal,
} from '../../../../sections/dashboard/customer/customer-assign-staff-modal';
import { useAssignStaff } from '../../../../hooks/use-assign-staff';
import { useTheme } from '@mui/material/styles';
import { useSearchParams } from '../../../../hooks/use-search-params';
import { useCreateChartingNote } from '../../../../hooks/use-create-charting-note';
import { alpha } from '@mui/system/colorManipulator';
import Camera01Icon from '@untitled-ui/icons-react/build/esm/Camera01';
import { useBasicDetails } from '../../../../hooks/use-basic-details';
import CustomerProfileLoading
  from '../../../../sections/dashboard/customer/customer-profile-loading';
import UserAvatar from '../../../../components/user-avatar';
import CustomerProfileVideoIFrame
  from '../../../../sections/dashboard/customer/customer-profile-video-iframe';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { useVideoConsultation } from '../../../../hooks/use-video-consultation';
import { useOrganizationStore } from '../../../../hooks/use-organization';
import { useCreateLog } from '../../../../hooks/use-create-log';
import ChartingNoteModal from '../../../../sections/components/charting-note/charting-note-modal';

const tabs = [
  { label: 'Profile', value: 'profile' },
  { label: 'Details', value: 'details' },
  { label: 'Invoices', value: 'invoices' },
  //  { label: 'Indicators', value: 'logs' },
  { label: 'Files', value: 'files' },
  { label: 'Appointments', value: 'consultations' },
  { label: 'Chat History', value: 'chat' },
];

const useDeletePatient = (patientId: string) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const mutation = trpc.user.delete.useMutation();

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const handleDeletePatient = async () => {
    if (!patientId) return toast.error('Patient not found');
    try {
      await mutation.mutateAsync({ id: patientId });
      toast.success('Patient deleted successfully');
      handleClose();
      router.push(paths.dashboard.customers.index);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return {
    handleDeletePatient,
    mutation,
    handleClose,
    handleOpen,
    open,
  };
};

const PatientDetails = ({ customer }: { customer: Patient }) => {
  const { birthdate } = customer;
  const age = birthdate ? dayjs().diff(dayjs(birthdate), 'year') : null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
      {birthdate && (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {dayjs(birthdate).format('YYYY-MM-DD')} {/* Use the actual birthDate property */}
        </Typography>
      )}
      {age && (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {age} years {/* Calculate and display age if date of birth is available */}
        </Typography>
      )}
      {customer.gender && (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {customer.gender} {/* Use the actual gender property */}
        </Typography>
      )}
    </Box>
  );
};

const useCustomer = () => {
  const params = useParams();
  const { user } = useAuth();
  const { data, refetch, isLoading } = trpc.user.get.useQuery(
    {
      id: params.customerId as string,
      organization_id: user?.organization_id,
    },
    {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  return {
    data: data ? (data as unknown as PatientWithInvoices) : undefined,
    isLoading,
    refetch,
  };
};

const useLogs = (): CustomerLog[] => {
  const isMounted = useMounted();
  const [logs, setLogs] = useState<CustomerLog[]>([]);

  const handleLogsGet = useCallback(async () => {
    try {
      const response = await customersApi.getLogs();

      if (isMounted()) {
        setLogs(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      handleLogsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return logs;
};

const Page = () => {
  const organizationStore = useOrganizationStore();
  const searchParams = useSearchParams();
  const [view, setView] = useState<'minimize' | 'split' | 'default'>('default');
  const tab = searchParams.get('tab');
  const video_url = searchParams.get('video_url');
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState<string>('profile');
  const { data: customer, refetch, isLoading } = useCustomer();
  const logs = useLogs();
  const staffStore = useStaffsStore();
  const createInvoice = useCreateInvoice();
  const createDialog = useDialog<CreateDialogData>();
  const videoConsultation = useVideoConsultation();
  const createChartingNote = useCreateChartingNote();
  const [openUpload, setOpenUpload] = useState(false);
  const { user } = useAuth();
  const inviteToPortal = useInvite();
  const serviceStore = useServiceStore();
  const permission = useGetPermissionByResource(PermissionResourceEnum.PATIENT_INFORMATION);
  const hasEditAccess = useMemo(() => {
    if (!permission) {
      return false;
    }
    return permission.editAccessLevel !== RolePermissionLevel.NONE;
  }, [permission]);
  const deletePatient = useDeletePatient(customer?.id!);
  const basicDetails = useBasicDetails(customer?.id || '');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const assignStaff = useAssignStaff(
    refetch,
    customer ? [customer?.id] : [],
    customer?.staffs.map((assignedStaff) => assignedStaff.staff.id) || [],
    undefined,
    'update',
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleMenuUpload = () => {
    setOpenUpload(!openUpload);
  };

  const handleUploadFile = () => {
    setCurrentTab('files');
    toggleMenuUpload();
    handleClose();
  };

  const { data: locations } = trpc.location.list.useQuery(undefined, {
    keepPreviousData: true,
  });
  usePageView();

  const handleTabsChange = useCallback(
    (event: ChangeEvent<any>, value: string): void => {
      setOpenUpload(false);
      setCurrentTab(value);
      if (video_url) {
        setView((prevState) => (prevState === 'default' ? 'split' : prevState));
      }
    },
    [video_url],
  );
  const createLog = useCreateLog();

  useEffect(() => {
    if (customer) {
      createLog.save({
        user_id: customer?.id || '',
        text: 'the patient profile',
        action: LogAction.VIEW,
      });
    }
  }, [customer]);

  useEffect(() => {
    // If video_url is present, set the current tab to profile
    if (video_url) {
      setCurrentTab('profile');
      return;
    }

    if (tab) {
      setCurrentTab(tab);
    }
    setView('default');
  }, [tab, video_url]);

  const handleCreateChart = () => {
    setCurrentTab('profile');
    createChartingNote.dialog.handleOpen();
    handleClose();
  };

  if (isLoading || !customer) {
    return <CustomerProfileLoading />;
  }

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          paddingTop: 0,
          pt: 0, // Reduced top padding
          pb: 1,
        }}
      >
        <Container
          maxWidth={false}
          sx={{ padding: 0, height: '100%' }}
        >
          <Stack
            spacing={4}
            sx={{ mt: 0, height: '100%' }}
          >
            <Stack
              spacing={2}
              sx={{ mt: 0, height: '100%' }}
            >
              <Stack
                alignItems="flex-start"
                direction={{
                  xs: 'column',
                  md: 'row',
                }}
                justifyContent="space-between"
                spacing={4}
                sx={{
                  maxHeight: 200,
                  px: { xs: 2, lg: 0 },
                }}
              >
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  {hasEditAccess ? (
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={2}
                    >
                      <label htmlFor="contained-profile-file">
                        <Box
                          sx={{
                            borderColor: 'neutral.300',
                            borderRadius: '50%',
                            borderStyle: 'dashed',
                            borderWidth: 1,
                            p: '4px',
                          }}
                        >
                          <Box
                            sx={{
                              borderRadius: '50%',
                              height: '100%',
                              width: '100%',
                              position: 'relative',
                            }}
                          >
                            <Box
                              sx={{
                                alignItems: 'center',
                                backgroundColor: (theme) => alpha(theme.palette.neutral[700], 0.5),
                                borderRadius: '50%',
                                color: 'common.white',
                                cursor: 'pointer',
                                display: 'flex',
                                height: '100%',
                                justifyContent: 'center',
                                left: 0,
                                opacity: 0,
                                position: 'absolute',
                                top: 0,
                                width: '100%',
                                zIndex: 1,
                                '&:hover': {
                                  opacity: 1,
                                },
                              }}
                            >
                              <Stack
                                alignItems="center"
                                direction="column"
                              >
                                <SvgIcon
                                  color="inherit"
                                  fontSize={'small'}
                                >
                                  <Camera01Icon />
                                </SvgIcon>
                                <Typography
                                  color="inherit"
                                  variant="caption"
                                  sx={{ fontWeight: 700 }}
                                >
                                  Select
                                </Typography>
                              </Stack>
                            </Box>
                            <UserAvatar
                              userId={customer.id}
                              height={64}
                              width={64}
                              defaultSrc={basicDetails.fileInput?.base64}
                            />
                          </Box>
                        </Box>
                      </label>
                      <input
                        type={'file'}
                        name={'image'}
                        id="contained-profile-file"
                        value={''}
                        onChange={basicDetails.handleFileInput}
                        style={{
                          display: 'none',
                        }}
                        accept="image/*"
                      />
                    </Stack>
                  ) : (
                    <UserAvatar
                      userId={customer.id}
                      height={64}
                      width={64}
                    />
                  )}

                  <Stack spacing={1}>
                    <Typography variant="h4">{`${customer.first_name || ''} ${
                      customer.last_name || ''
                    }`}</Typography>

                    <PatientDetails customer={customer} />
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    ></Stack>
                  </Stack>
                </Stack>
                {permission && permission.editAccessLevel !== RolePermissionLevel.NONE && (
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                  >
                    <Button
                      endIcon={
                        <SvgIcon>
                          <ChevronDownIcon />
                        </SvgIcon>
                      }
                      variant="contained"
                      onClick={handleClick}
                    >
                      Actions
                    </Button>

                    <Menu
                      id="actions-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      MenuListProps={{
                        'aria-labelledby': 'actions-button',
                      }}
                    >
                      <MenuItem onClick={handleUploadFile}>Upload File</MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleClose();
                          createDialog.handleOpen({
                            range: {
                              start: new Date().getTime(),
                              end: new Date().getTime(),
                            },
                          });
                        }}
                      >
                        Make Appointment
                      </MenuItem>
                      <MenuItem onClick={createInvoice.handleOpen}>Send Invoice</MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleClose();
                          inviteToPortal.handleOpenInvite();
                        }}
                      >
                        Invite to Portal
                      </MenuItem>
                      <MenuItem onClick={assignStaff.dialog.handleOpen}>
                        Edit assigned staff
                      </MenuItem>
                      <MenuItem onClick={handleCreateChart}>Create Charting Note</MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleClose();
                          deletePatient.handleOpen();
                        }}
                        sx={{
                          color: 'red',
                        }}
                      >
                        Delete
                        <DeleteIcon
                          fontSize="small"
                          color={'error'}
                        />
                      </MenuItem>
                    </Menu>
                  </Stack>
                )}
              </Stack>
              <div>
                <Stack
                  direction={{ xs: 'column', lg: 'row' }}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                  spacing={2}
                >
                  <Tabs
                    indicatorColor="primary"
                    onChange={handleTabsChange}
                    scrollButtons="auto"
                    sx={{ mt: 1 }}
                    textColor="primary"
                    value={currentTab}
                    variant="scrollable"
                  >
                    {tabs.map((tab) => (
                      <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                      />
                    ))}
                  </Tabs>
                  {video_url && (
                    <Grid
                      item
                      xs={12}
                    >
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="flex-start"
                        spacing={4}
                      >
                        <Stack>
                          <Typography
                            color={'text.secondary'}
                            variant={'h6'}
                          >
                            Call Duration
                          </Typography>
                          <Typography
                            color={'text.secondary'}
                            variant={'subtitle1'}
                          >
                            {videoConsultation.data?.service?.duration
                              ? `${videoConsultation.data?.service?.duration} mins`
                              : '--'}
                          </Typography>
                        </Stack>
                        <Button
                          variant={
                            videoConsultation.selectedView === 'info' &&
                            view === 'split' &&
                            currentTab === 'profile'
                              ? 'contained'
                              : 'outlined'
                          }
                          onClick={() => {
                            videoConsultation.setSelectedView('info');
                            setCurrentTab('profile');
                            if (view === 'default') {
                              setView('split');
                            }
                          }}
                        >
                          View Info
                        </Button>
                        <Button
                          variant={
                            videoConsultation.selectedView === 'chart' &&
                            view === 'split' &&
                            currentTab === 'profile'
                              ? 'contained'
                              : 'outlined'
                          }
                          onClick={() => {
                            setCurrentTab('profile');
                            videoConsultation.setSelectedView('chart');
                            if (view === 'default') {
                              setView('split');
                            }
                          }}
                        >
                          View Chart
                        </Button>
                        <IconButton
                          onClick={videoConsultation.popover.handleOpen}
                          ref={videoConsultation.popover.anchorRef}
                        >
                          <SettingsIcon />
                        </IconButton>
                      </Stack>
                      <Menu
                        anchorEl={videoConsultation.popover.anchorRef.current}
                        anchorOrigin={{
                          horizontal: 'right',
                          vertical: 'bottom',
                        }}
                        onClose={videoConsultation.popover.handleClose}
                        open={videoConsultation.popover.open}
                        PaperProps={{
                          sx: {
                            maxWidth: '100%',
                            width: 200,
                          },
                        }}
                        transformOrigin={{
                          horizontal: 'right',
                          vertical: 'top',
                        }}
                      >
                        <MenuItem onClick={videoConsultation.handleCopyLink}>
                          Copy Video Link
                        </MenuItem>
                        <MenuItem onClick={videoConsultation.handleManualRecording}>
                          {videoConsultation.recording ? 'Stop ' : 'Start '} Recording
                        </MenuItem>
                      </Menu>
                    </Grid>
                  )}
                </Stack>

                <Divider />
              </div>

              <Grid
                container
                direction={'row'}
                justifyContent="space-between"
                alignItems="stretch"
                sx={{
                  height: '100%',
                  px: { xs: 1, lg: 0 },
                }}
              >
                {video_url && videoConsultation.id && (
                  <Grid
                    item
                    xs={12}
                    lg={view === 'split' ? 5 : 12}
                    sx={{
                      height: view === 'minimize' ? 0 : '100%',
                      zIndex: 1201,
                      p: 0,
                    }}
                  >
                    <CustomerProfileVideoIFrame
                      url={video_url}
                      setView={setView}
                      view={view}
                      consultationId={videoConsultation.id}
                      setRecording={videoConsultation.setRecording}
                      recording={videoConsultation.recording}
                      callFrame={videoConsultation.callFrame}
                      setCallFrame={videoConsultation.setCallFrame}
                      token={videoConsultation.staffRoomToken?.token}
                      autoRecording={organizationStore.data?.telemedicine_auto_recording}
                    />
                  </Grid>
                )}
                {((video_url && view !== 'default') || !video_url) && (
                  <Grid
                    item
                    xs={12}
                    lg={view === 'split' ? 7 : 12}
                    sx={{
                      height: '100%',
                      p: 0,
                    }}
                  >
                    <Box
                      sx={{
                        pl: { xs: 0, lg: view === 'split' ? 2 : 0 },
                        height: '100%',
                        flexGrow: 1,
                      }}
                    >
                      {currentTab === 'details' && (
                        <Grid
                          container
                          spacing={2}
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Grid
                            item
                            xs={12}
                            lg={6}
                          >
                            <CustomerBasicDetails
                              customerId={customer.id}
                              title={'Basic Details'}
                              hasEditAccess={hasEditAccess}
                              basicDetails={basicDetails}
                            />
                          </Grid>

                          <Grid
                            item
                            xs={12}
                            lg={6}
                          >
                            <CustomerAddressDetails
                              title={'Address Details'}
                              customer={customer}
                              hasEditAccess={hasEditAccess}
                            />
                          </Grid>
                        </Grid>
                      )}
                      {currentTab === 'invoices' && (
                        <CustomerInvoices
                          customer={customer}
                          hasEditAccess={hasEditAccess}
                        />
                      )}

                      {currentTab === 'profile' && (
                        <CustomerProfile
                          customer={customer}
                          hasEditAccess={hasEditAccess}
                          handleEditAssignedStaff={assignStaff.dialog.handleOpen}
                          refetch={refetch}
                          view={view === 'minimize' ? 'all' : videoConsultation.selectedView}
                        />
                      )}

                      {currentTab === 'logs' && <CustomerLogs logs={logs} />}
                      {currentTab === 'files' && (
                        <CustomerFiles
                          openUpload={openUpload}
                          toggleMenuUpload={toggleMenuUpload}
                          hasEditAccess={hasEditAccess}
                          patient={customer as User}
                        />
                      )}
                      {currentTab === 'chat' && <CustomerChatHistory customerId={customer.id} />}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <CustomerConfirmationDeleteDialog
        open={deletePatient.open}
        handleDeletePatient={deletePatient.handleDeletePatient}
        isLoading={deletePatient.mutation.isLoading}
        handleClose={deletePatient.handleClose}
      />
      <InvoiceCreateDialog
        open={createInvoice.open}
        handleClose={createInvoice.handleClose}
        isLoading={false}
        onSubmit={createInvoice.onSubmit}
        staffOptions={staffStore.staffs}
        patientOptions={[customer]}
        patient={customer}
        invoiceNumber={createInvoice.invoiceNumber}
      />
      <CalendarEventDialog
        action="create"
        onAddComplete={() => {
          createDialog.handleClose();
        }}
        onClose={createDialog.handleClose}
        open={createDialog.open}
        range={createDialog.data?.range}
        staffs={staffStore.staffs}
        patients={[customer]}
        defaultPatient={customer}
        defaultStaff={staffStore.staffs.find((staff) => staff.id === user?.id)}
        timezone={moment.tz.guess()}
        services={serviceStore.services}
        locations={locations}
      />
      <CustomerWelcomeEmailDialog
        {...inviteToPortal}
        patient={customer}
      />
      <CustomerAssignStaffModal
        staffs={staffStore.staffs}
        theme={theme}
        open={assignStaff.dialog.open}
        handleClose={() => {
          assignStaff.handleRemoveStaff([] as unknown as [string, ...string[]]);
          assignStaff.dialog.handleClose();
        }}
        isLoading={assignStaff.isLoading}
        handleSubmit={assignStaff.handleSubmit}
        onSubmit={assignStaff.onSubmit}
        control={assignStaff.control}
        errors={assignStaff.errors}
        handleRemoveStaff={assignStaff.handleRemoveStaff}
      />

      <ChartingNoteModal
        open={createChartingNote.dialog.open}
        handleClose={createChartingNote.dialog.handleClose}
        onSelectItem={createChartingNote.handleNewChartItem}
        patientId={customer.id}
        type={'items'}
        onSelectTemplateItem={createChartingNote.handleApplyTemplate}
      />
    </>
  );
};

export default Page;
