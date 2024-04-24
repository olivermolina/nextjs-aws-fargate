import React, { FC, useCallback } from 'react';

import PropTypes from 'prop-types';
import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import Mail01Icon from '@untitled-ui/icons-react/build/esm/Mail01';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DeleteIcon from '@mui/icons-material/Delete';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill, SeverityPillColor } from 'src/components/severity-pill';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { RoleName, User } from '@prisma/client';
import { trpc } from 'src/app/_trpc/client';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';
import AccountStaffConfirmationDeleteDialog from './account-staff-confirmation-delete-dialog';
import { useDialog } from '../../../hooks/use-dialog';
import { useUpdateSearchParams } from '../../../hooks/use-update-search-params';
import UserAvatar from '../../../components/user-avatar';

interface AccountTeamSettingsProps {
  members: User[];
  refetch: any;
  hasEditAccess: boolean;
}

const ValidationSchema = z.object({
  email: z.string().email({
    message: 'Invalid email. Please enter a valid email address',
  }),
  roleName: z.nativeEnum(RoleName),
});

export const roleColorMap: Record<RoleName | 'none', SeverityPillColor> = {
  ['none']: 'primary',
  [RoleName.ADMIN]: 'success',
  [RoleName.ADMIN_STAFF]: 'info',
  [RoleName.PRACTITIONER]: 'warning',
  [RoleName.CUSTOM]: 'primary',
};

export const roleLabelMap: Record<RoleName | 'none', string> = {
  ['none']: 'None',
  [RoleName.ADMIN]: 'Admin',
  [RoleName.ADMIN_STAFF]: 'Staff',
  [RoleName.PRACTITIONER]: 'Practitioner',
  [RoleName.CUSTOM]: 'Custom',
};

type Input = z.infer<typeof ValidationSchema>;

const MemberTableRow = ({
                          member,
                          hasEditAccess,
                          handleMenuOpen,
                        }: {
  member: User;
  hasEditAccess: boolean;
  handleMenuOpen: any;
}) => {
  const { data } = trpc.user.getUserRole.useQuery({
    id: member.id,
  });
  return (
    <TableRow>
      <TableCell>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
        >
          <UserAvatar
            userId={member?.id}
            height={40}
            width={40}
          />
          <div>
            <Typography variant="subtitle2">{getUserFullName(member)}</Typography>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {member.email}
            </Typography>
          </div>
        </Stack>
      </TableCell>
      <TableCell>
        <SeverityPill color={roleColorMap[data?.role?.name || 'none']}>
          {roleLabelMap[data?.role?.name || 'none']}
        </SeverityPill>
      </TableCell>
      <TableCell align="right">
        {hasEditAccess && (
          <IconButton onClick={(event) => handleMenuOpen(event, member)}>
            <SvgIcon>
              <DotsHorizontalIcon />
            </SvgIcon>
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
};

export const AccountTeamSettings: FC<AccountTeamSettingsProps> = (props) => {
  const { updateSearchParams } = useUpdateSearchParams();
  const { data } = trpc.organization.get.useQuery();
  const { members, hasEditAccess } = props;
  const dialog = useDialog();
  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<Input>({
    resolver: zodResolver(ValidationSchema),
  });
  const [selectedStaff, setSelectedStaff] = React.useState<User | null>(null);

  const deleteMutation = trpc.user.delete.useMutation();

  const mutation = trpc.user.inviteStaff.useMutation();

  // New state for the anchor element of the menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, staff: User) => {
    setSelectedStaff(staff);
    setAnchorEl(event.currentTarget);
  };

  // Close menu handler
  const handleClose = () => {
    setAnchorEl(null);
  };

  const sendInvite = async (data: Input) => {
    try {
      await mutation.mutateAsync({
        email: data.email,
        roleName: data.roleName,
      });
      reset();
      toast.success('User successfully invited!');
      await props.refetch();
    } catch (e) {
      toast.error(e.message || 'Something went wrong. Please try again.');
    }
  };

  const handleDeleteUser = useCallback(async () => {
    handleClose();
    try {
      if (selectedStaff) {
        await deleteMutation.mutateAsync({
          id: selectedStaff.id,
        });
        toast.success('User successfully deleted!');
        dialog.handleClose();
        setSelectedStaff(null);
        await props.refetch();
      }
    } catch (e) {
      toast.error(e.message || 'Something went wrong. Please try again.');
      dialog.handleClose();
      setSelectedStaff(null);
    }
  }, [selectedStaff]);

  return (
    <>
      <Card>
        {hasEditAccess && (
          <CardContent>
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                md={4}
              >
                <Stack spacing={1}>
                  <Typography variant="h6">Invite members</Typography>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    You currently pay for {data?.additional_users} Editor Seats.
                  </Typography>
                </Stack>
              </Grid>

              <Grid
                xs={12}
                md={8}
              >
                <form onSubmit={handleSubmit(sendInvite)}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={3}
                  >
                    <TextField
                      {...register('email')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SvgIcon>
                              <Mail01Icon />
                            </SvgIcon>
                          </InputAdornment>
                        ),
                      }}
                      label="Email address"
                      name="email"
                      sx={{ flexGrow: 1 }}
                      type="email"
                      error={!!errors?.email}
                      helperText={errors?.email?.message}
                    />
                    <Controller
                      control={control}
                      name={'roleName'}
                      defaultValue={RoleName.ADMIN_STAFF}
                      render={({ field }) => {
                        return (
                          <TextField
                            value={field.value}
                            select
                            onChange={field.onChange}
                            label={'Role'}
                            size={'small'}
                            sx={{
                              width: {
                                xs: 'auto',
                                lg: 200,
                              },
                            }}
                          >
                            {Object.values(RoleName)
                              .filter((role) => role !== RoleName.CUSTOM)
                              .map((role) => (
                                <MenuItem
                                  key={role}
                                  value={role}
                                >
                                  <SeverityPill color={roleColorMap[role || 'none']}>
                                    {roleLabelMap[role]}
                                  </SeverityPill>
                                </MenuItem>
                              ))}
                          </TextField>
                        );
                      }}
                    />
                    <Button
                      type={'submit'}
                      variant="contained"
                      disabled={mutation.isLoading}
                    >
                      Send Invite
                      {mutation.isLoading && (
                        <CircularProgress
                          sx={{ ml: 1 }}
                          size={20}
                        />
                      )}
                    </Button>
                  </Stack>
                </form>
              </Grid>
            </Grid>
          </CardContent>
        )}
        <Scrollbar>
          <Table sx={{ minWidth: 400 }}>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Role</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member, index) => (
                <MemberTableRow
                  key={index}
                  member={member}
                  hasEditAccess={hasEditAccess}
                  handleMenuOpen={handleMenuOpen}
                />
              ))}
            </TableBody>
          </Table>

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
            <MenuItem onClick={() => updateSearchParams('staffId', selectedStaff?.id || '')}>
              Edit
            </MenuItem>
            <MenuItem
              onClick={dialog.handleOpen}
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
        </Scrollbar>
      </Card>
      <AccountStaffConfirmationDeleteDialog
        handleClose={dialog.handleClose}
        open={dialog.open}
        isLoading={deleteMutation.isLoading}
        handleDelete={handleDeleteUser}
      />
    </>
  );
};

AccountTeamSettings.propTypes = {
  members: PropTypes.array.isRequired,
};
