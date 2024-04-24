import React, { FC, Fragment, useCallback, useState } from 'react';
import { deepOrange, grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';

import { Scrollbar } from 'src/components/scrollbar';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import SvgIcon from '@mui/material/SvgIcon';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import IconButton from '@mui/material/IconButton';
import AvatarGroup from '@mui/material/AvatarGroup';
import LinkIcon from '@mui/icons-material/Link';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material/styles/createTheme';
import { AccountServiceCreateModal } from './account-service-create-modal';
import { useStaffsStore } from 'src/hooks/use-staffs-store';
import { ServiceWithStaff } from 'src/types/service';
import { trpc } from 'src/app/_trpc/client';
import toast from 'react-hot-toast';
import LinearProgress from '@mui/material/LinearProgress';
import { useAuth } from 'src/hooks/use-auth';
import { paths } from 'src/paths';
import { getBaseUrl } from 'src/utils/get-base-url';

import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import DeleteIcon from '@mui/icons-material/Delete';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useDialog } from 'src/hooks/use-dialog';
import AccountServiceDeleteDialog from './account-service-delete-dialog';
import { Skeleton } from '@mui/material';
import UserAvatar from '../../../components/user-avatar';
import { ServiceInput } from '../../../utils/zod-schemas/service';

const useServiceStore = () => {
  const [open, setOpen] = useState(false);
  const deleteDialog = useDialog();

  const [service, setService] = useState<ServiceWithStaff | undefined>(undefined);
  const [addDisplayName, setAddDisplayName] = useState(false);
  const [addDescription, setAddDescription] = useState(false);
  const { data, isLoading, refetch } = trpc.service.list.useQuery(
    {
      rowsPerPage: 1000,
      page: 0,
    },
    {
      keepPreviousData: true,
    }
  );

  const mutation = trpc.service.create.useMutation();
  const updateMutation = trpc.service.update.useMutation();
  const deleMutation = trpc.service.delete.useMutation();

  const handleClose = () => {
    setAddDisplayName(false);
    setAddDescription(false);
    setService(undefined);
    setOpen(false);
  };

  const handleOpen = () => setOpen(true);
  const showAddDisplayName = () => setAddDisplayName(true);
  const showAddDescription = () => setAddDescription(true);

  const onSubmit = async (input: ServiceInput) => {
    const { id, staffIds, displayName, ...restInputs } = input;
    try {
      if (id) {
        await updateMutation.mutateAsync({
          ...restInputs,
          id,
          display_name: displayName,
          staffIds: typeof staffIds === 'string' || !staffIds ? [] : staffIds,
        });

        toast.success('Service updated successfully');
      } else {
        await mutation.mutateAsync({
          ...restInputs,
          displayName: displayName,
          staffIds: typeof staffIds === 'string' || !staffIds ? [] : staffIds,
        });

        toast.success('Service created successfully');
      }
    } catch (e) {
      toast.error(e.message);
    }

    handleClose();
    refetch();
  };

  const handleDelete = useCallback(async () => {
    if (!service?.id) return;

    try {
      await deleMutation.mutateAsync({
        id: service.id,
      });
      toast.success('Service deleted successfully');
      deleteDialog.handleClose();
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }, [service]);

  return {
    open,
    handleClose,
    handleOpen,
    onSubmit,
    addDisplayName,
    addDescription,
    showAddDisplayName,
    showAddDescription,
    service,
    setService,
    isLoading: updateMutation.isLoading || mutation.isLoading || isLoading,
    services: data?.items || [],
    deleteDialog: {
      ...deleteDialog,
      handleDelete,
      isLoading: deleMutation.isLoading,
    },
  };
};

export const AccountServiceSettings: FC = () => {
  const { user } = useAuth();
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
  const serviceStore = useServiceStore();
  const staffStore = useStaffsStore();
  const currency = user?.organization?.currency || 'USD';
  const currencySymbol = user?.organization?.currency_symbol || '$';
  const organizationSlug = user?.organization?.slug!;

  // New state for the anchor element of the menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    service: ServiceWithStaff
  ) => {
    serviceStore.setService(service);
    setAnchorEl(event.currentTarget);
  };

  // Close menu handler
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
        >
          <Button
            variant={'contained'}
            startIcon={
              <SvgIcon>
                <AddIcon />
              </SvgIcon>
            }
            onClick={() => {
              serviceStore.setService(undefined);
              serviceStore.handleOpen();
            }}
          >
            Create
          </Button>
        </Stack>

        <Scrollbar>
          {serviceStore.isLoading && <LinearProgress />}
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {serviceStore.services.map((service) => (
              <Fragment key={service.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Skeleton
                      sx={{ bgcolor: deepOrange[500], width: 24, height: 24 }}
                      variant="rectangular"
                      animation={false}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<b>{service.name}</b>}
                    secondary={
                      <Stack
                        direction={'row'}
                        spacing={1}
                        alignItems={'center'}
                      >
                        <span>{service.duration} mins</span>
                        <Avatar sx={{ bgcolor: grey[500], width: 5, height: 5 }}> {''}</Avatar>
                        <span>
                          {currencySymbol}
                          {service.price}
                        </span>
                      </Stack>
                    }
                  />
                  <Stack
                    direction={'row'}
                    spacing={1}
                    alignItems={'center'}
                    justifyContent={'flex-end'}
                  >
                    {service.telemedicine && (
                      <Tooltip title="Telemedicine">
                        <IconButton aria-label="telemedicine">
                          <EventAvailableIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <AvatarGroup max={3}>
                      {service.staffs.map((staff) => (
                        <UserAvatar
                          key={staff.id}
                          userId={staff.Staff.id}
                          height={32}
                          width={32}
                        />
                      ))}
                    </AvatarGroup>

                    <Tooltip title={smUp ? '' : 'Booking Link'}>
                      <Button
                        variant={'outlined'}
                        endIcon={
                          smUp && (
                            <SvgIcon>
                              <LinkIcon />
                            </SvgIcon>
                          )
                        }
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${getBaseUrl()}${paths.schedule.service
                              .replace(':slug', organizationSlug)
                              .replace(':serviceSlug', service.slug)}`
                          );

                          toast.success('Link copied');
                        }}
                      >
                        {smUp ? (
                          'Booking Link'
                        ) : (
                          <SvgIcon>
                            <LinkIcon />
                          </SvgIcon>
                        )}
                      </Button>
                    </Tooltip>

                    <IconButton onClick={(event) => handleMenuOpen(event, service)}>
                      <SvgIcon>
                        <DotsHorizontalIcon />
                      </SvgIcon>
                    </IconButton>
                  </Stack>
                </ListItem>
                <Divider />
              </Fragment>
            ))}
            {serviceStore.services.length === 0 && (
              <ListItem>
                <ListItemText
                  primary={'No services found'}
                  secondary={'Create a new service to get started'}
                />
              </ListItem>
            )}
          </List>
        </Scrollbar>
      </Stack>

      {/* Menu component */}
      <Menu
        id="actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
      >
        <MenuItem
          onClick={() => {
            serviceStore.handleOpen();
            handleClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            serviceStore.deleteDialog.handleOpen();
            handleClose();
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
      <AccountServiceCreateModal
        {...serviceStore}
        staffOptions={staffStore.staffs}
        currency={currency}
      />
      {serviceStore.service && (
        <AccountServiceDeleteDialog
          handleClose={serviceStore.deleteDialog.handleClose}
          handleDelete={serviceStore.deleteDialog.handleDelete}
          open={serviceStore.deleteDialog.open}
          isLoading={serviceStore.deleteDialog.isLoading}
          service={serviceStore.service}
        />
      )}
    </>
  );
};
