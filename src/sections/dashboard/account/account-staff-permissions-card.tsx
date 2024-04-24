import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { RoleName, RolePermissionLevel } from '@prisma/client';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Scrollbar } from '../../../components/scrollbar';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import React from 'react';
import { Skeleton } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { PermissionResourceEnum, useRolePermission } from 'src/hooks/use-role-permissions';
import Stack from '@mui/material/Stack';
import { SeverityPill } from '../../../components/severity-pill';
import { roleColorMap, roleLabelMap } from './account-team-settings';
import { RolePermissionsInput } from '../../../utils/zod-schemas/role-permission';

const getResourceLevelLabel = (resourceName: string, level: RolePermissionLevel) => {
  if (level === RolePermissionLevel.OWN) {
    if (
      resourceName === PermissionResourceEnum.PATIENT_INFORMATION ||
      resourceName === PermissionResourceEnum.INVOICING_AND_PAYMENT ||
      resourceName === PermissionResourceEnum.CHAT
    ) {
      return 'Assigned Only';
    }

    if (resourceName === PermissionResourceEnum.SCHEDULING) {
      return 'Own Calendar';
    }
  }

  return level;
};

const getLevelOptions = (resourceName: string) => {
  if (resourceName === 'Organization settings' || resourceName === 'Reports') {
    return [RolePermissionLevel.NONE, RolePermissionLevel.EVERYTHING];
  }
  return Object.values(RolePermissionLevel);
};

interface AccountStaffPermissionsCardProps {
  staffId: string;
  refetchMembers: () => Promise<void>;
}

export default function AccountStaffPermissionsCard(props: AccountStaffPermissionsCardProps) {
  const {
    edit,
    toggleEdit,
    staff,
    fields,
    control,
    isLoading,
    handleSubmit,
    onSubmit,
    isSubmitting,
    setValue,
  } = useRolePermission(props.staffId);

  const submit = async (data: RolePermissionsInput) => {
    await onSubmit(data);
    await props.refetchMembers();
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Card>
        <CardHeader
          title={
            <Stack
              direction={'row'}
              spacing={2}
              alignItems={'center'}
            >
              <Typography variant={'h6'}>Permissions</Typography>
              {staff && (
                <SeverityPill color={roleColorMap[staff.role?.name || 'none']}>
                  {roleLabelMap[staff.role?.name || 'none']}
                </SeverityPill>
              )}
            </Stack>
          }
          action={
            staff?.role?.name === RoleName.ADMIN ? (
              <Typography
                variant={'subtitle1'}
                sx={{
                  color: 'text.secondary',
                }}
              >
                Admin
              </Typography>
            ) : (
              <Button onClick={toggleEdit}>{edit ? 'Cancel' : 'Edit'}</Button>
            )
          }
        />
        <Scrollbar>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Permission</TableCell>
                <TableCell>View Access</TableCell>
                <TableCell>Edit Access</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading &&
                Array.from(Array(3).keys()).map((index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))}

              {fields?.map((permission, index) => {
                const levelOptions = getLevelOptions(permission.resourceName);
                return (
                  <TableRow
                    hover
                    key={permission.id}
                  >
                    <TableCell>{permission.resourceName}</TableCell>
                    <TableCell
                      sx={{
                        textTransform: 'capitalize',
                      }}
                    >
                      {edit ? (
                        <Controller
                          control={control}
                          name={`permissions.${index}.viewAccessLevel`}
                          defaultValue={permission.viewAccessLevel}
                          render={({ field }) => {
                            return (
                              <TextField
                                fullWidth
                                value={field.value}
                                select
                                onChange={(event) => {
                                  field.onChange(event);
                                  if (event.target.value === RolePermissionLevel.NONE) {
                                    setValue(
                                      `permissions.${index}.editAccessLevel`,
                                      event.target.value
                                    );
                                  }
                                }}
                                variant={'outlined'}
                                size={'small'}
                                sx={{
                                  width: {
                                    xs: 'auto',
                                    lg: 160,
                                  },
                                }}
                              >
                                {levelOptions.map((level) => (
                                  <MenuItem
                                    key={level}
                                    value={level}
                                    sx={{
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {getResourceLevelLabel(
                                      permission.resourceName,
                                      level
                                    ).toLowerCase()}
                                  </MenuItem>
                                ))}
                              </TextField>
                            );
                          }}
                        />
                      ) : (
                        getResourceLevelLabel(
                          permission.resourceName,
                          permission.viewAccessLevel
                        ).toLowerCase()
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        textTransform: 'capitalize',
                      }}
                    >
                      {edit ? (
                        <Controller
                          control={control}
                          name={`permissions.${index}.editAccessLevel`}
                          defaultValue={permission.editAccessLevel}
                          render={({ field }) => {
                            return (
                              <TextField
                                fullWidth
                                value={field.value}
                                select
                                onChange={field.onChange}
                                variant={'outlined'}
                                size={'small'}
                                sx={{
                                  width: {
                                    xs: 'auto',
                                    lg: 160,
                                  },
                                }}
                              >
                                {levelOptions.map((level) => (
                                  <MenuItem
                                    key={level}
                                    value={level}
                                    sx={{
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {getResourceLevelLabel(
                                      permission.resourceName,
                                      level
                                    ).toLowerCase()}
                                  </MenuItem>
                                ))}
                              </TextField>
                            );
                          }}
                        />
                      ) : (
                        getResourceLevelLabel(
                          permission.resourceName,
                          permission.editAccessLevel
                        ).toLowerCase()
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>
        {edit && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
            }}
          >
            <Button
              type={'submit'}
              size="small"
              variant={'contained'}
              disabled={isSubmitting}
            >
              Save{' '}
              {isSubmitting && (
                <CircularProgress
                  sx={{ ml: 1 }}
                  size={20}
                />
              )}
            </Button>
          </Box>
        )}
      </Card>
    </form>
  );
}
