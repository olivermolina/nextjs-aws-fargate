import React, { FC, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';

import { AccountPlanIcon } from './account-plan-icon';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressValidationSchemaWithId } from 'src/utils/zod-schemas/address';
import z from 'zod';
import { trpc } from 'src/app/_trpc/client';
import toast from 'react-hot-toast';
import AddressForm from '../../components/address/address-form';
import AddressListView from '../../components/address/address-list-view';
import { useProducts } from 'src/hooks/use-products';
import dayjs from 'dayjs';
import { Skeleton } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AccountCancelPlanModal from './account-cancel-plan-modal';
import PaymentMethodForm from 'src/components/payment-method-form';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { usePlan } from 'src/hooks/use-plan';
import { AppAccess } from '@prisma/client';
import BackdropLoading from './account-billing-reactivate-backdrop';
import { useDispatch } from 'src/store';
import { slice } from 'src/slices/app';
import { useOrganizationStore } from 'src/hooks/use-organization';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { a11yProps, TabPanel } from './account-vertical-tab';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface Invoice {
  id: string;
  amount: number;
  createdAt: number;
}

interface AccountBillingSettingsProps {
  plan?: string;
  invoices?: Invoice[];
  hasEditAccess: boolean;
}

const FormSchema = AddressValidationSchemaWithId.and(
  z.object({
    bill_name: z.string().min(1, { message: 'This is required' }),
    bill_email: z.string().email({
      message: 'Invalid email. Please enter a valid email address',
    }),
  })
);

type FormInput = z.infer<typeof FormSchema>;

const useBillingDetails = () => {
  const [edit, setEdit] = useState(false);
  const { data, refetch } = trpc.organization.get.useQuery();
  const mutation = trpc.organization.update.useMutation();

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<FormInput>({
    resolver: zodResolver(FormSchema),
  });

  const toggleEdit = () => setEdit((prev) => !prev);
  const onSubmit = useCallback(
    async (inputs: FormInput) => {
      try {
        if (data) {
          await mutation.mutateAsync({
            id: data.id || '',
            name: data.name || '',
            bill_name: inputs.bill_name,
            bill_email: inputs.bill_email,
            billing_address: {
              ...inputs,
              id: inputs.id || undefined,
            },
          });
          await refetch();
        }

        toggleEdit();
        toast.success('Billing details updated.');
      } catch (e) {
        toast.error(e.message);
      }
    },
    [data]
  );

  const resetForm = useCallback(() => {
    if (data) {
      reset({
        id: data.billing_address?.id || '',
        bill_name: data.bill_name || '',
        bill_email: data.bill_email || '',
        address_line1: data.billing_address?.address_line1 || '',
        address_line2: data.billing_address?.address_line2 || '',
        city: data.billing_address?.city || '',
        state: data.billing_address?.state || '',
        postal_code: data.billing_address?.postal_code || '',
        country: data.billing_address?.country || '',
      });
    }
  }, [data]);

  const onCancel = () => {
    resetForm();
    toggleEdit();
  };

  useEffect(() => {
    if (data) {
      resetForm();
    }
  }, [data]);

  return {
    register,
    handleSubmit,
    onSubmit,
    edit,
    toggleEdit,
    errors,
    isSubmitting,
    organization: data,
    onCancel,
    control,
  };
};

const UserCountSelector = ({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (event: SelectChangeEvent<string>) => void;
  disabled: boolean;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2, mb: 2 }}>
    <Select
      value={value?.toString()}
      onChange={onChange}
      displayEmpty
      inputProps={{ 'aria-label': 'Without label' }}
      sx={{ width: '120px' }}
      disabled={disabled}
    >
      <MenuItem disabled>
        <em>Select users</em>
      </MenuItem>
      {[...Array(10).keys()].map((number) => (
        <MenuItem
          key={number}
          value={number + 1}
        >
          {number + 1}
        </MenuItem>
      ))}
    </Select>
  </Box>
);

const useOrganizationInvoices = () => {
  const { data } = trpc.organization.invoices.useQuery();
  return data;
};

const usePaymentMethod = () => {
  const dispatch = useDispatch();
  const { data: organization } = useOrganizationStore();
  const { data, refetch } = trpc.organization.getPaymentMethod.useQuery();

  const reactivateMutation = trpc.organization.reactivate.useMutation();

  const mutation = trpc.organization.savePaymentMethod.useMutation();
  const [edit, setEdit] = useState(false);
  const toggleEdit = () => setEdit((prev) => !prev);
  const onCancel = () => {
    toggleEdit();
  };

  const reactivateSubscription = async () => {
    try {
      await reactivateMutation.mutateAsync();
      toast.success('Payment is successful. Your subscription is now active.');
      dispatch(slice.actions.setRefetch(true));
      await refetch();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleSubmit = useCallback(
    async (stripePaymentMethodId: string) => {
      try {
        await mutation.mutateAsync({
          stripePaymentMethodId,
        });
        toast.success('Payment method updated.');
        await refetch();
        toggleEdit();
        if (organization?.access === AppAccess.Block) {
          reactivateSubscription();
        }
      } catch (e) {
        toast.error(e.message);
      }
    },
    [organization]
  );

  return {
    edit,
    toggleEdit,
    onCancel,
    handleSubmit,
    data,
    isLoading: mutation.isLoading,
    reactiveIsLoading: reactivateMutation.isLoading,
  };
};

const tabs = ['Change Plan', 'Billing Information', 'Payment Method', 'Invoice history'];

export const AccountBillingSettings: FC<AccountBillingSettingsProps> = ({
  hasEditAccess,
}) => {
  const billingDetails = useBillingDetails();
  const { plans, isLoading } = useProducts(true);
  const orgInvoices = useOrganizationInvoices();
  const plan = usePlan();
  const paymentMethod = usePaymentMethod();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [userCount, setUserCount] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(
    plans.find((p) => p.id === plan.currentPlan?.id)?.price || 0
  );

  const onUpgradePlan = useCallback(
    () => plan.onChangePlan(plan.currentPlan?.id || '', selectedPlan, userCount),
    [plan.currentPlan, selectedPlan, userCount]
  );

  const [tabvalue, setTabvalue] = useState(0);
  const handleChangeTab = (event: SyntheticEvent, newValue: number) => {
    setTabvalue(newValue);
  };

  useEffect(() => {
    setUserCount(billingDetails.organization?.additional_users || 1);
  }, [billingDetails.organization?.additional_users]);

  useEffect(() => {
    if (plan.currentPlan) {
      setSelectedPlan(plan.currentPlan.id);
    }
  }, [plan.currentPlan]);

  // Calculate the total price whenever the selected plan or user count changes
  useEffect(() => {
    const selectedPlanPrice = plans.find((p) => p.id === selectedPlan)?.price || 0;
    setTotalPrice(selectedPlanPrice + (userCount - 1) * 15);
  }, [selectedPlan, userCount, plans]);

  return (
    <>
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
          value={tabvalue}
          onChange={handleChangeTab}
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

        {/* Change Plan */}
        <TabPanel
          value={tabvalue}
          index={0}
        >
          {/* Spread the rest of the props here */}
          <Card>
            <CardHeader
              title="Change Plan"
              subheader={
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="body2">
                    You can upgrade and downgrade whenever you want
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ marginLeft: 2 }}
                  >
                    Number of users ($15 / additional user):
                  </Typography>
                  <UserCountSelector
                    value={userCount}
                    onChange={(event) => setUserCount(Number(event.target.value))}
                    disabled={!hasEditAccess}
                  />
                </Box>
              }
              sx={{ paddingBottom: 2 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <div>
                <Grid
                  container
                  spacing={3}
                >
                  {isLoading &&
                    Array.from(Array(3).keys()).map((number) => (
                      <Grid
                        key={number}
                        xs={12}
                        sm={4}
                      >
                        <Skeleton
                          height={200}
                          variant="rectangular"
                          sx={{
                            borderRadius: 2,
                          }}
                        />
                      </Grid>
                    ))}

                  {plans.map((item) => {
                    const isSelected = item.id === selectedPlan;
                    const isCurrent = item.id === plan.currentPlan?.id;
                    const price = numeral(item.price).format('$0,0.00');

                    return (
                      <Grid
                        key={item.id}
                        xs={12}
                        sm={4}
                      >
                        <Card
                          onClick={() => {
                            if (item.type === 'plan') {
                              setSelectedPlan(item.id);
                            }
                          }}
                          sx={{
                            cursor: 'pointer',
                            ...(isSelected && {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                              m: '-1px',
                            }),
                          }}
                          variant="outlined"
                        >
                          <CardContent>
                            <Box
                              sx={{
                                height: 52,
                                width: 52,
                                '& img': {
                                  height: 'auto',
                                  width: '100%',
                                },
                              }}
                            >
                              <AccountPlanIcon name={item.name} />
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                mb: 1,
                                mt: 1,
                              }}
                            >
                              <Typography variant="h5">{item.type === 'plan' && price}</Typography>

                              <Typography
                                color="text.secondary"
                                sx={
                                  item.type === 'plan'
                                    ? {
                                      mt: 'auto',
                                      ml: '4px',
                                    }
                                    : undefined
                                }
                                variant="body2"
                              >
                                {item.type === 'plan' ? '/mo' : 'Contact Support'}
                              </Typography>
                            </Box>
                            <Stack
                              alignItems="center"
                              direction="row"
                              justifyContent="space-between"
                              spacing={3}
                            >
                              <Typography variant="overline">{item.name}</Typography>
                              {isCurrent && (
                                <Typography
                                  color="primary.main"
                                  variant="caption"
                                >
                                  Using now
                                </Typography>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </div>
              <Divider sx={{ my: 4 }} />

              <Box
                sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', my: 2 }}
              >
                <Typography
                  variant="h6"
                  sx={{ marginRight: 2 }}
                >
                  Total Monthly Charge: {numeral(totalPrice).format('$0,0.00')}
                </Typography>
              </Box>

              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ mt: 3 }}
              >
                We cannot refund once you purchased a subscription, but you can always
                <Link
                  sx={{ ml: '4px' }}
                  underline="none"
                  variant="body2"
                  component={'button'}
                  onClick={() => plan.cancelPlan.dialog.handleOpen()}
                  disabled={!hasEditAccess}
                >
                  Cancel
                </Link>
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 3,
                }}
              >
                {hasEditAccess && (
                  <Button
                    variant="contained"
                    disabled={plan.isLoading}
                    onClick={onUpgradePlan}
                  >
                    Upgrade Plan{' '}
                    {plan.isLoading && (
                      <CircularProgress
                        sx={{ ml: 1 }}
                        size={20}
                      />
                    )}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Billing Information */}
        <TabPanel
          value={tabvalue}
          index={1}
        >
          <Card>
            <CardHeader
              title="Billing Information "
              subheader="Change billing information here"
            />

            <CardContent>
              {hasEditAccess && (
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  {billingDetails.edit ? (
                    <Button
                      color="inherit"
                      onClick={billingDetails.onCancel}
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
                      onClick={billingDetails.toggleEdit}
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
              )}

              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mt: 3,
                }}
              >
                {billingDetails.edit ? (
                  <AddressForm
                    {...billingDetails}
                    isBilling
                    includeBillingEmail
                  />
                ) : (
                  <AddressListView
                    bill_email={billingDetails.organization?.bill_email || ''}
                    bill_name={billingDetails.organization?.bill_name || ''}
                    address={billingDetails.organization?.billing_address || {}}
                    isBilling
                  />
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 3,
                }}
              ></Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Payment Method */}
        <TabPanel
          value={tabvalue}
          index={2}
        >
          <Card
            sx={{
              minHeight: 400,
            }}
          >
            <CardHeader title="Payment Method" />

            <CardContent>
              {hasEditAccess && (
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  {paymentMethod.edit ? (
                    <Button
                      color="inherit"
                      onClick={paymentMethod.onCancel}
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
                      onClick={paymentMethod.toggleEdit}
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
              )}
              <Box
                sx={{
                  mt: 3,
                }}
              >
                {paymentMethod.edit ? (
                  <Elements stripe={stripePromise}>
                    <PaymentMethodForm
                      handleSubmit={paymentMethod.handleSubmit}
                      isLoading={paymentMethod.isLoading}
                    />
                  </Elements>
                ) : (
                  <Stack>
                    <Typography variant="body2">
                      Credit Card:{' '}
                      {paymentMethod.data
                        ? `${paymentMethod.data?.stripe_payment_method?.brand?.toUpperCase()} ending
                    in ${paymentMethod.data?.stripe_payment_method?.last4}`
                        : 'No credit card on file'}
                    </Typography>
                  </Stack>
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 3,
                }}
              ></Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Invoice history */}
        <TabPanel
          value={tabvalue}
          index={3}
        >
          <Card
            sx={{
              minHeight: 400,
            }}
          >
            <CardHeader
              title="Invoice history"
              subheader="You can view and download all your previous invoices here. If you’ve just made a payment, it may take a few hours for it to appear in the table below."
            />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Total (incl. tax)</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {orgInvoices?.map((invoice) => {
                  const createdAt = dayjs(invoice.created * 1000).format('DD MMM YYYY');
                  const amount = numeral(invoice.total / 100).format('$0,0.00');

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>{createdAt}</TableCell>
                      <TableCell>{amount}</TableCell>
                      <TableCell align="right">
                        <Link
                          color="inherit"
                          underline="always"
                          href={`/dashboard/account/invoices/${invoice.id}`}
                        >
                          View Invoice
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabPanel>
      </Box>

      <AccountCancelPlanModal
        open={plan.cancelPlan.dialog.open}
        handleClose={plan.cancelPlan.dialog.handleClose}
        handleConfirm={plan.cancelPlan.onCancelPlan}
        isLoading={plan.cancelPlan.isLoading}
      />
      <BackdropLoading
        open={paymentMethod.reactiveIsLoading}
        message="Processing payment"
      />
    </>
  );
};

AccountBillingSettings.propTypes = {
  plan: PropTypes.string,
  invoices: PropTypes.array,
};
