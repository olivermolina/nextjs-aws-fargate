import React, { FC } from 'react';
import PropTypes from 'prop-types';
import Camera01Icon from '@untitled-ui/icons-react/build/esm/Camera01';
import { alpha } from '@mui/system/colorManipulator';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import AddressForm from 'src/sections/components/address/address-form';
import AddressListView from 'src/sections/components/address/address-list-view';
import { useAuth } from 'src/hooks/use-auth';
import CircularProgress from '@mui/material/CircularProgress';
import { UserType } from '@prisma/client';
import { useAddressDetails } from 'src/hooks/use-address-details';
import { useBasicDetails } from 'src/hooks/use-basic-details';
import UserAvatar from '../../../components/user-avatar';

interface AccountGeneralSettingsProps {
  avatar: string;
  email: string;
  name: string;
}

export const AccountGeneralSettings: FC<AccountGeneralSettingsProps> = (props) => {
  const { email } = props;
  const { user } = useAuth();
  const addressDetails = useAddressDetails(user?.id || '');
  const basicDetails = useBasicDetails(user?.id || '');

  return (
    <Stack
      spacing={4}
      {...props}
    >
      <form onSubmit={basicDetails.handleSubmit(basicDetails.onSubmit)}>
        <Card>
          <CardContent>
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                md={4}
              >
                <Typography variant="h6">Basic details</Typography>
              </Grid>
              <Grid
                xs={12}
                md={8}
              >
                <Stack spacing={3}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                  >
                    <label htmlFor="contained-button-file">
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
                              direction="row"
                              spacing={1}
                            >
                              <SvgIcon color="inherit">
                                <Camera01Icon />
                              </SvgIcon>
                              <Typography
                                color="inherit"
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                Select
                              </Typography>
                            </Stack>
                          </Box>

                          <UserAvatar
                            defaultSrc={basicDetails.fileInput?.base64}
                            userId={user?.id}
                            height={100}
                            width={100}
                          />
                        </Box>
                      </Box>
                    </label>
                    <input
                      type={'file'}
                      name={'image'}
                      id="contained-button-file"
                      value={''}
                      onChange={basicDetails.handleFileInput}
                      style={{
                        display: 'none',
                      }}
                      accept="image/*"
                    />

                    <label htmlFor="contained-button-file">
                      <Button
                        color="inherit"
                        size="small"
                        component="span"
                      >
                        Change
                      </Button>
                    </label>
                  </Stack>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                  >
                    <TextField
                      label="First Name"
                      sx={{ flexGrow: 1 }}
                      {...basicDetails.register('first_name')}
                      error={!!basicDetails.errors.first_name}
                      helperText={basicDetails.errors.first_name?.message}
                      disabled={!basicDetails.edit}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Last Name"
                      sx={{ flexGrow: 1 }}
                      {...basicDetails.register('last_name')}
                      error={!!basicDetails.errors.last_name}
                      helperText={basicDetails.errors.last_name?.message}
                      disabled={!basicDetails.edit}
                      InputLabelProps={{ shrink: true }}
                    />
                    {basicDetails.edit ? (
                      <Button
                        color="primary"
                        size="small"
                        variant={'contained'}
                        type={'submit'}
                        disabled={basicDetails.isSubmitting}
                      >
                        Save
                        {basicDetails.isSubmitting && (
                          <CircularProgress
                            sx={{ ml: 1 }}
                            size={20}
                          />
                        )}
                      </Button>
                    ) : (
                      <Button disabled />
                    )}
                  </Stack>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                  >
                    <TextField
                      defaultValue={email}
                      disabled
                      label="Email Address"
                      required
                      sx={{
                        flexGrow: 1,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderStyle: 'dashed',
                        },
                      }}
                    />
                    <Button
                      color="inherit"
                      size="small"
                      onClick={basicDetails.onCancel}
                    >
                      {basicDetails.edit ? 'Cancel' : 'Edit'}
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </form>

      {basicDetails.user?.type === UserType.PATIENT && (
        <Card>
          <CardContent>
            <Typography variant="h6">Address Details</Typography>

            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6"> </Typography>
              {addressDetails.edit ? (
                <Button
                  color="inherit"
                  onClick={addressDetails.onCancel}
                  startIcon={
                    <SvgIcon>
                      <CloseIcon />
                    </SvgIcon>
                  }
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  color="inherit"
                  onClick={addressDetails.toggleEdit}
                  startIcon={
                    <SvgIcon>
                      <Edit02Icon />
                    </SvgIcon>
                  }
                >
                  Edit
                </Button>
              )}
            </Box>
            <Box
              sx={
                addressDetails.edit
                  ? {}
                  : {
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mt: 3,
                    }
              }
            >
              {addressDetails.edit ? (
                <AddressForm {...addressDetails} />
              ) : (
                <AddressListView address={addressDetails.user?.address || {}} />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/*
      <Card>


        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              xs={12}
              md={4}
            >
              <Typography variant="h6">Public profile</Typography>
            </Grid>
            <Grid
              xs={12}
              sm={12}
              md={8}
            >
              <Stack
                divider={<Divider />}
                spacing={3}
              >
                <Stack
                  alignItems="flex-start"
                  direction="row"
                  justifyContent="space-between"
                  spacing={3}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">Make Contact Info Public</Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Means that anyone viewing your profile will be able to see your contacts
                      details.
                    </Typography>
                  </Stack>
                  <Switch />
                </Stack>
                <Stack
                  alignItems="flex-start"
                  direction="row"
                  justifyContent="space-between"
                  spacing={3}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">Available to hire</Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Toggling this will let your teammates know that you are available for
                      acquiring new projects.
                    </Typography>
                  </Stack>
                  <Switch defaultChecked />
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>


      <Card>
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              xs={12}
              md={4}
            >
              <Typography variant="h6">Delete Account</Typography>
            </Grid>
            <Grid
              xs={12}
              md={8}
            >
              <Stack
                alignItems="flex-start"
                spacing={3}
              >
                <Typography variant="subtitle1">
                  Delete your account and all of your source data. This is irreversible.
                </Typography>
                <Button
                  color="error"
                  variant="outlined"
                >
                  Delete account
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

    */}
    </Stack>
  );
};

AccountGeneralSettings.propTypes = {
  avatar: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};
