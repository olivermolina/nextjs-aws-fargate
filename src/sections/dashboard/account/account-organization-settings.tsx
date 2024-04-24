import React, { FC, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { trpc } from 'src/app/_trpc/client';
import Image from 'next/image';
import {
  OrganizationInput,
  OrganizationValidationSchema,
} from 'src/utils/zod-schemas/organization';
import toast from 'react-hot-toast';
import { Skeleton } from '@mui/material';
import { useFileInput } from 'src/hooks/use-file-input';
import { AddressValidationSchemaWithId } from 'src/utils/zod-schemas/address';
import z from 'zod';
import StripeConnect from 'src/icons/stripe-connect';
import BackdropLoading from './account-billing-reactivate-backdrop';
import { AccountConfigureClinicalProfileCard } from './account-configure-clinical-profile-card';
import AccountOrganizationLocationCard from './account-organization-location-card';
import AccountOrganizationFaxCard from './account-organization-fax-card';
import { useStripeSetting } from '../../../hooks/use-stripe-setting';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { a11yProps, TabPanel } from './account-vertical-tab';

interface AccountOrganizationSettingsProps {
  hasEditAccess: boolean;
}

const FormSchema = OrganizationValidationSchema.and(
  z.object({
    address: AddressValidationSchemaWithId,
  }),
);

type FormInput = z.infer<typeof FormSchema>;

const useOrganizationEdit = () => {
  const { data, isLoading, refetch } = trpc.organization.get.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { data: logoUrl } = trpc.user.getSignedUrlFile.useQuery(
    {
      key: data?.logo || '',
    },
    {
      enabled: !!data?.logo,
      refetchOnWindowFocus: false,
    },
  );

  const { handleFileInput, fileInput, setFileInput } = useFileInput();
  const [editMode, setEditMode] = useState<boolean>(false);
  const mutation = trpc.organization.update.useMutation();
  const toggleEditMode = () => setEditMode(!editMode);

  const onSubmit = useCallback(
    async (input: OrganizationInput) => {
      try {
        await mutation.mutateAsync({
          ...input,
          ...(fileInput?.isEdited && {
            file: fileInput,
          }),
        });
        await refetch();
        setFileInput({
          ...fileInput!,
          isEdited: false,
        });

        toast.success('Organization updated');
        toggleEditMode();
      } catch (e) {
        toast.error(e.message);
      }
    },
    [fileInput, editMode],
  );

  useEffect(() => {
    if (logoUrl) {
      setFileInput({
        name: 'logo',
        type: 'image/png',
        size: 1,
        base64: logoUrl || '',
        isEdited: false,
      });
    }
  }, [logoUrl]);

  return {
    editMode,
    toggleEditMode,
    onSubmit,
    organization: data,
    isLoading,
    handleFileInput,
    fileInput,
    refetch,
  };
};

const tabs = ['Information', 'Online Payments', 'Locations', 'eFax', 'Configure Clinical Profile'];

export const AccountOrganizationSettings: FC<AccountOrganizationSettingsProps> = ({
                                                                                    hasEditAccess,
                                                                                  }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const organizationEdit = useOrganizationEdit();

  const { handleDisconnectStripe, handleConnect, mutation, stripeAccountMutation } =
    useStripeSetting(organizationEdit.refetch);

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    control,
    reset,
  } = useForm<FormInput>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    if (organizationEdit.organization) {
      reset({
        ...organizationEdit.organization,
        currency: organizationEdit.organization.currency || 'USD',
        description: organizationEdit.organization.description || '',
        address: {
          ...organizationEdit.organization.address,
          address_line1: organizationEdit.organization.address?.address_line1 || '',
          address_line2: organizationEdit.organization.address?.address_line2 || '',
          postal_code: organizationEdit.organization.address?.postal_code || '',
          city: organizationEdit.organization.address?.city || '',
          state: organizationEdit.organization.address?.state || '',
          country: organizationEdit.organization.address?.country || '',
        },
      });
    }
  }, [organizationEdit.organization]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        height: '100%',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        sx={{
          '&& .MuiTab-root': {
            alignItems: 'baseline',
            marginLeft: 0,
          },
          minWidth: 150,
        }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab}
            {...a11yProps(index)}
            sx={{
              whiteSpace: 'nowrap',
              pr: 4,
            }}
          />
        ))}
      </Tabs>

      {/* Information */}
      <TabPanel
        value={value}
        index={0}
      >
        <Card>
          <CardHeader
            title="Information"
            action={
              hasEditAccess && (
                <Button onClick={organizationEdit.toggleEditMode}>
                  <Typography
                    sx={{
                      color: (theme) => theme.palette.primary.main,
                      textTransform: 'none',
                    }}
                    variant={'button'}
                  >
                    {organizationEdit.editMode ? 'Cancel' : 'Edit'}
                  </Typography>
                </Button>
              )
            }
          />
          <CardContent>
            <form
              noValidate
              onSubmit={handleSubmit(organizationEdit.onSubmit)}
            >
              <Grid
                container
                spacing={3}
              >
                <Grid
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.name}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel
                      sx={{
                        color: 'text.primary.light',
                        mb: 1,
                      }}
                    >
                      Name {organizationEdit.editMode && '*'}
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '50%' }} />
                    ) : organizationEdit.editMode ? (
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('name')}
                        aria-describedby="component-error-text"
                      />
                    ) : (
                      <Typography>{organizationEdit.organization?.name || '-'} </Typography>
                    )}

                    <FormHelperText>{errors?.name?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.phone}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel
                      sx={{
                        color: 'text.primary.light',
                        mb: 1,
                      }}
                    >
                      Phone
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '50%' }} />
                    ) : organizationEdit.editMode ? (
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('phone')}
                        aria-describedby="component-error-text"
                      />
                    ) : (
                      <Typography> {organizationEdit.organization?.phone || '-'} </Typography>
                    )}

                    <FormHelperText>{errors?.phone?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.npi}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel
                      sx={{
                        color: 'text.primary.light',
                        mb: 1,
                      }}
                    >
                      National Provider Identifier (NPI)
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '50%' }} />
                    ) : organizationEdit.editMode ? (
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('npi')}
                        aria-describedby="component-error-text"
                      />
                    ) : (
                      <Typography> {organizationEdit.organization?.npi || '-'} </Typography>
                    )}

                    <FormHelperText>{errors?.npi?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.currency}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel
                      sx={{
                        color: 'text.primary.light',
                        mb: 1,
                      }}
                    >
                      Currency
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '50%' }} />
                    ) : organizationEdit.editMode ? (
                      <Controller
                        control={control}
                        name="currency"
                        defaultValue={'USD'}
                        render={({ field }) => {
                          return (
                            <TextField
                              size={'small'}
                              fullWidth
                              value={field.value}
                              aria-describedby="component-error-text"
                              select
                              variant={'outlined'}
                              onChange={field.onChange}
                            >
                              {['MXN', 'CAD', 'USD'].map((option) => (
                                <MenuItem
                                  key={option}
                                  value={option}
                                >
                                  {option}
                                </MenuItem>
                              ))}
                            </TextField>
                          );
                        }}
                      />
                    ) : (
                      <Typography> {organizationEdit.organization?.currency || '-'} </Typography>
                    )}

                    <FormHelperText>{errors?.currency?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Website Grid component */}
                <Grid
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.website}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel
                      sx={{
                        color: 'text.primary.light',
                        mb: 1,
                      }}
                    >
                      Website
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '50%' }} />
                    ) : organizationEdit.editMode ? (
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('website')}
                        aria-describedby="component-error-text"
                      />
                    ) : (
                      <Typography>{organizationEdit.organization?.website || '-'}</Typography>
                    )}
                    <FormHelperText>{errors?.website?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Tax ID Grid component */}
                <Grid
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.tax_id}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel
                      sx={{
                        color: 'text.primary.light',
                        mb: 1,
                      }}
                    >
                      Tax ID
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '50%' }} />
                    ) : organizationEdit.editMode ? (
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('tax_id')}
                        aria-describedby="component-error-text"
                      />
                    ) : (
                      <Typography>{organizationEdit.organization?.tax_id || '-'}</Typography>
                    )}
                    <FormHelperText>{errors?.tax_id?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Description Grid component */}
                <Grid xs={12}>
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.description}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel
                      sx={{
                        color: 'text.primary.light',
                        mb: 1,
                      }}
                    >
                      Description {organizationEdit.editMode && '*'}
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '100%' }} />
                    ) : organizationEdit.editMode ? (
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('description')}
                        aria-describedby="component-description-text"
                      />
                    ) : (
                      <Typography>{organizationEdit.organization?.description || '-'}</Typography>
                    )}
                    <FormHelperText>{errors?.description?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Address Line 1 Field  */}
                <Grid
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.address?.address_line1}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel sx={{ color: 'text.primary.light', mb: 1 }}>
                      Address Line 1 {organizationEdit.editMode && '*'}
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '50%' }} />
                    ) : organizationEdit.editMode ? (
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('address.address_line1')}
                        aria-describedby="component-error-text"
                      />
                    ) : (
                      <Typography>
                        {organizationEdit.organization?.address?.address_line1 || '-'}
                      </Typography>
                    )}
                    <FormHelperText>{errors?.address?.address_line1?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Postal Code Field  */}
                <Grid
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.address?.postal_code}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel sx={{ color: 'text.primary.light', mb: 1 }}>
                      Postal Code {organizationEdit.editMode && '*'}
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '50%' }} />
                    ) : organizationEdit.editMode ? (
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('address.postal_code')}
                        aria-describedby="component-error-text"
                      />
                    ) : (
                      <Typography>
                        {organizationEdit.organization?.address?.postal_code || '-'}
                      </Typography>
                    )}
                    <FormHelperText>{errors?.address?.postal_code?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* City Field  */}
                <Grid
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.address?.city}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel sx={{ color: 'text.primary.light', mb: 1 }}>
                      City {organizationEdit.editMode && '*'}
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '50%' }} />
                    ) : organizationEdit.editMode ? (
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('address.city')}
                        aria-describedby="component-error-text"
                      />
                    ) : (
                      <Typography>{organizationEdit.organization?.address?.city || '-'}</Typography>
                    )}
                    <FormHelperText>{errors?.address?.city?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* State Field  */}
                <Grid
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.address?.state}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel sx={{ color: 'text.primary.light', mb: 1 }}>
                      State {organizationEdit.editMode && '*'}
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '50%' }} />
                    ) : organizationEdit.editMode ? (
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('address.state')}
                        aria-describedby="component-error-text"
                      />
                    ) : (
                      <Typography>
                        {organizationEdit.organization?.address?.state || '-'}
                      </Typography>
                    )}
                    <FormHelperText>{errors?.address?.state?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                {/* Country Field  */}
                <Grid
                  xs={12}
                  lg={6}
                >
                  <FormControl
                    error={organizationEdit.editMode && !!errors?.address?.country}
                    variant="standard"
                    fullWidth
                  >
                    <FormLabel sx={{ color: 'text.primary.light', mb: 1 }}>
                      Country {organizationEdit.editMode && '*'}
                    </FormLabel>
                    {organizationEdit.isLoading ? (
                      <Skeleton sx={{ width: '50%' }} />
                    ) : organizationEdit.editMode ? (
                      <Controller
                        control={control}
                        name="address.country"
                        defaultValue={'US'}
                        render={({ field }) => {
                          return (
                            <TextField
                              size={'small'}
                              fullWidth
                              aria-describedby="component-error-text"
                              variant={'outlined'}
                              select
                              value={field.value}
                              onChange={field.onChange}
                            >
                              {['CA', 'MX', 'US'].map((option) => (
                                <MenuItem
                                  key={option}
                                  value={option}
                                >
                                  {option}
                                </MenuItem>
                              ))}
                            </TextField>
                          );
                        }}
                      />
                    ) : (
                      <Typography>
                        {organizationEdit.organization?.address?.country || '-'}
                      </Typography>
                    )}
                    <FormHelperText>{errors?.address?.country?.message}</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  xs={12}
                  lg={6}
                >
                  <Stack
                    direction={{ xs: 'column', lg: organizationEdit.editMode ? 'row' : 'column' }}
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <FormControl
                      variant="standard"
                      fullWidth
                      sx={{ maxWidth: { sx: 150, lg: 250 } }}
                    >
                      <FormLabel
                        sx={{
                          color: 'text.primary.light',
                          mb: 1,
                        }}
                      >
                        Logo
                      </FormLabel>
                      {organizationEdit.isLoading ? (
                        <Skeleton sx={{ width: '50%' }} />
                      ) : (
                        organizationEdit.editMode && (
                          <>
                            <input
                              type={'file'}
                              name={'image'}
                              id="contained-button-file"
                              value={''}
                              onChange={organizationEdit.handleFileInput}
                              style={{
                                display: 'none',
                              }}
                              accept="image/*"
                            />
                            <label htmlFor="contained-button-file">
                              <Button
                                variant="contained"
                                color="primary"
                                component="span"
                                fullWidth
                              >
                                Attach
                              </Button>
                            </label>
                          </>
                        )
                      )}
                    </FormControl>
                    {organizationEdit.fileInput && (
                      <Image
                        src={organizationEdit.fileInput.base64}
                        alt={'Preview'}
                        height={200}
                        width={200}
                      />
                    )}
                    <span />
                  </Stack>
                </Grid>
              </Grid>

              {organizationEdit.editMode && (
                <Stack direction="row-reverse">
                  <Button
                    sx={{ mt: 3, width: 100 }}
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    Save
                    {isSubmitting && (
                      <CircularProgress
                        sx={{ ml: 1 }}
                        size={20}
                      />
                    )}
                  </Button>
                </Stack>
              )}
            </form>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Online Payments */}
      <TabPanel
        value={value}
        index={1}
      >
        <Card sx={{
          minHeight: 400,
        }}>
          <CardHeader title="Online Payments" />
          <CardContent>
            {organizationEdit.organization?.StripeConnect?.[0]?.stripe_user_id ? (
              <Stack
                direction={'column'}
                spacing={2}
              >
                <Typography
                  variant={'h6'}
                  sx={{
                    color: 'success.main',
                  }}
                >
                  Stripe is successfully connected.
                </Typography>

                {hasEditAccess && (
                  <Button
                    onClick={handleDisconnectStripe}
                    variant={'contained'}
                    sx={{ width: 150 }}
                    color={'error'}
                    disabled={mutation.isLoading}
                  >
                    Disconnect
                    {mutation.isLoading && (
                      <CircularProgress
                        sx={{ ml: 1 }}
                        size={20}
                      />
                    )}
                  </Button>
                )}
              </Stack>
            ) : (
              <>
                {hasEditAccess && (
                  <Button
                    sx={{
                      p: 0,
                    }}
                    onClick={handleConnect}
                    disabled={stripeAccountMutation.isLoading}
                  >
                    <StripeConnect />
                  </Button>
                )}
                <BackdropLoading
                  open={stripeAccountMutation.isLoading}
                  message="Creating stripe account"
                />
              </>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Locations */}
      <TabPanel
        value={value}
        index={2}
      >
        <AccountOrganizationLocationCard hasEditAccess={hasEditAccess} />
      </TabPanel>

      {/*SRFax Settings*/}
      <TabPanel
        value={value}
        index={3}
      >
        <AccountOrganizationFaxCard hasEditAccess={hasEditAccess} />
      </TabPanel>

      {/* Configure Clinical Profile */}
      <TabPanel
        value={value}
        index={4}
      >
        <AccountConfigureClinicalProfileCard />
      </TabPanel>
    </Box>
  );
};
