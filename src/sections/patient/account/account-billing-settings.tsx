import { FC, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import { format } from 'date-fns';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { SeverityPill } from 'src/components/severity-pill';
import { InvoiceStatus } from '@prisma/client';

import { Invoice } from 'src/types/invoice';
import { trpc } from 'src/app/_trpc/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { AddressValidationSchema } from 'src/utils/zod-schemas/address';
import z from 'zod';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';
import AddressForm from '../../components/address/address-form';
import AddressListView from '../../components/address/address-list-view';
import CustomerPaymentMethod from '../../dashboard/customer/customer-payment-method';

const FormSchema = AddressValidationSchema.and(
  z.object({
    bill_name: z.string().min(1, { message: 'This is required' }),
  }),
);

type FormInput = z.infer<typeof FormSchema>;

const usePatientBillingDetails = () => {
  const [edit, setEdit] = useState(false);
  const { user } = useAuth();
  const { data, refetch } = trpc.user.get.useQuery(
    {
      id: user?.id || '',
    },
    {
      enabled: !!user?.id,
      refetchOnWindowFocus: false,
    },
  );
  const mutation = trpc.user.update.useMutation();

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
          const { bill_name, ...billing_address } = inputs;
          await mutation.mutateAsync({
            id: data.id || '',
            bill_name: inputs.bill_name,
            billing_address,
          });
          await refetch();
        }

        toggleEdit();
        toast.success('Billing details updated.');
      } catch (e) {
        toast.error(e.message);
      }
    },
    [data],
  );

  const resetForm = useCallback(() => {
    if (data) {
      reset({
        bill_name: data.bill_name || '',
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
    user: data,
    onCancel,
    control,
  };
};

interface AccountBillingSettingsProps {
  invoices?: Invoice[];
}

export const AccountBillingSettings: FC<AccountBillingSettingsProps> = (props) => {
  const { invoices = [] } = props;
  const billingDetails = usePatientBillingDetails();

  return (
    <Stack
      spacing={4}
      {...props}
    >
      <Card>
        <CardHeader
          title="Billing details"
          subheader="Review or modify your payment information here"
        />
        <CardContent sx={{ pt: 0 }}>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6"> </Typography>
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
          <Box
            sx={
              billingDetails.edit
                ? {}
                : {
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mt: 3,
                }
            }
          >
            {billingDetails.edit ? (
              <AddressForm
                {...billingDetails}
                isBilling
              />
            ) : (
              <AddressListView
                bill_name={billingDetails?.user?.bill_name || ''}
                address={billingDetails.user?.billing_address || {}}
                isBilling
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <CustomerPaymentMethod
        customerId={billingDetails.user?.id || ""}
      />

      <Card>
        <CardHeader
          title="Invoice history"
          subheader="You can view and download all your previous invoices here. If you’ve just made a payment, it may take a few hours for it to appear in the table below."
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Total (incl. tax)</TableCell>
              <TableCell>Status</TableCell>

              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => {
              const createdAt = format(invoice.created_at, 'dd MMM yyyy');
              const amount = numeral(invoice.total_amount).format('$0,0.00');
              const status = invoice.status;
              const statusColor = invoice.status === InvoiceStatus.PAID ? 'success' : 'error';

              return (
                <TableRow key={invoice.id}>
                  <TableCell>{createdAt}</TableCell>
                  <TableCell>{amount}</TableCell>
                  <TableCell>
                    <SeverityPill color={statusColor}>{status}</SeverityPill>
                  </TableCell>
                  <TableCell align="right">
                    <Link
                      color="inherit"
                      underline="always"
                      href={`/patient/invoices/${invoice.id}`}
                    >
                      View Invoice
                    </Link>

                    {/* Import route path correctly and replace */}
                    {/*
                    <IconButton
                        component={RouterLink}
                        href={paths.patient.invoices.details.replace(':invoiceId', invoice.id)}
                      >
                        <SvgIcon>
                          <ArrowRightIcon />
                        </SvgIcon>
                      </IconButton>
                    */}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  );
};

AccountBillingSettings.propTypes = {
  invoices: PropTypes.array,
};
