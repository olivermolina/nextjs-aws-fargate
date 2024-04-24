'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useDialog } from 'src/hooks/use-dialog';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { InvoicePdfDialog } from 'src/sections/dashboard/invoice/invoice-pdf-dialog';
import { InvoicePdfDocument } from 'src/sections/dashboard/invoice/invoice-pdf-document';
import { InvoicePreview } from 'src/sections/dashboard/invoice/invoice-preview';
import { getUserFullName } from 'src/utils/get-user-full-name';
import { trpc } from 'src/app/_trpc/client';
import { useParams } from 'next/navigation';
import { Invoice } from 'src/types/invoice';
import AccountPaymentModal from '../../../../sections/patient/account/account-payment-modal';
import BackdropLoading
  from '../../../../sections/dashboard/account/account-billing-reactivate-backdrop';
import React, { useCallback, useState } from 'react';
import { usePayInvoice } from '../../../../hooks/use-pay-invoice';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import toast from 'react-hot-toast';
import { InvoiceStatus } from '@prisma/client';
import UserAvatar from '../../../../components/user-avatar';
import { useOrganizationStore } from '../../../../hooks/use-organization';
import { useAuth } from '../../../../hooks/use-auth';

const Page = () => {
  const { user } = useAuth();
  const params = useParams();
  const organizationStore = useOrganizationStore();
  const organization = organizationStore.data;
  const { data: invoice, refetch } = trpc.invoice.get.useQuery(
    {
      id: params.invoiceId! as string,
      organization_id: user?.organization_id,
    },
    {
      keepPreviousData: true,
    }
  );

  const refetchInvoice = async () => await refetch();

  const payInvoice = usePayInvoice(invoice, refetchInvoice);

  const mutation = trpc.invoice.resendInvoice.useMutation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const term = invoice?.status === InvoiceStatus.PAID ? 'Receipt' : 'Invoice';

  const handleResendInvoice = useCallback(async () => {
    if (!invoice) {
      toast.error('Invoice not found');
      return;
    }
    try {
      await mutation.mutateAsync({ id: invoice.id });
      handleClose();
      toast.success(`${term} sent.`);
    } catch (e) {
      toast.error(e);
    }
  }, [invoice, term]);

  const dialog = useDialog();

  usePageView();

  if (!invoice) {
    return null;
  }

  return (
    <>
      <Seo title="Dashboard: Invoice Details" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            divider={<Divider />}
            spacing={4}
          >
            <Stack spacing={4}>
              <div>
                <Link
                  color="text.primary"
                  component={RouterLink}
                  href={paths.dashboard.invoices.index}
                  sx={{
                    alignItems: 'center',
                    display: 'inline-flex',
                  }}
                  underline="hover"
                >
                  <SvgIcon sx={{ mr: 1 }}>
                    <ArrowLeftIcon />
                  </SvgIcon>
                  <Typography variant="subtitle2">Invoices</Typography>
                </Link>
              </div>
              <Stack
                alignItems="flex-start"
                direction="row"
                justifyContent="space-between"
                spacing={4}
              >
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <UserAvatar
                    userId={invoice.patient.id}
                    height={42}
                    width={42}
                  />
                  <div>
                    <Typography variant="h4">{invoice.invoice_number}</Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {getUserFullName(invoice.patient)}
                    </Typography>
                  </div>
                </Stack>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <Button
                    color="inherit"
                    onClick={dialog.handleOpen}
                  >
                    Preview
                  </Button>

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
                    <MenuItem>
                      <PDFDownloadLink
                        document={
                          <InvoicePdfDocument
                            invoice={invoice as Invoice}
                            organization={organization}
                          />
                        }
                        fileName="invoice"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        Download
                      </PDFDownloadLink>
                    </MenuItem>
                    <MenuItem onClick={handleResendInvoice}>Resend {term}</MenuItem>
                    {payInvoice.patientPaymentMethod && (
                      <MenuItem onClick={payInvoice.handlePay}>Pay Invoice</MenuItem>
                    )}
                  </Menu>
                </Stack>
              </Stack>
            </Stack>
            <InvoicePreview invoice={invoice as Invoice} />
          </Stack>
        </Container>
      </Box>
      <InvoicePdfDialog
        invoice={invoice as Invoice}
        onClose={dialog.handleClose}
        open={dialog.open}
      />

      <AccountPaymentModal
        dialog={payInvoice.dialog}
        paymentMethod={payInvoice.paymentMethod}
        submitPayNow={payInvoice.submitPayNow}
        isLoading={payInvoice.mutation.isLoading}
      />
      <BackdropLoading
        open={payInvoice.mutation.isLoading || mutation.isLoading}
        message={mutation.isLoading ? `Sending ${term}` : 'Processing invoice payment'}
      />
    </>
  );
};

export default Page;
