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
import { trpc } from 'src/app/_trpc/client';
import { useParams } from 'next/navigation';
import {
  AccountInvoicePdfDocument,
} from 'src/sections/dashboard/account/account-invoice-pdf-document';
import { AccountInvoicePreview } from 'src/sections/dashboard/account/account-invoice-preview';
import { AccountInvoicePdfDialog } from 'src/sections/dashboard/account/account-invoice-pdf-dialog';
import UserAvatar from '../../../../../components/user-avatar';
import { useAuth } from '../../../../../hooks/use-auth';

const Page = () => {
  const { user } = useAuth();
  const params = useParams();
  const { data: invoice } = trpc.organization.invoice.useQuery(
    {
      id: params.invoice_id! as string,
    },
    {
      keepPreviousData: true,
    }
  );

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
                  <UserAvatar userId={user?.id} />
                  <div>
                    <Typography variant="h4">{invoice.number}</Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {invoice.customer_name}
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
                  <PDFDownloadLink
                    document={<AccountInvoicePdfDocument invoice={invoice} />}
                    fileName="invoice"
                    style={{ textDecoration: 'none' }}
                  >
                    <Button
                      color="primary"
                      variant="contained"
                    >
                      Download
                    </Button>
                  </PDFDownloadLink>
                </Stack>
              </Stack>
            </Stack>
            <AccountInvoicePreview invoice={invoice} />
          </Stack>
        </Container>
      </Box>
      <AccountInvoicePdfDialog
        invoice={invoice}
        onClose={dialog.handleClose}
        open={dialog.open}
      />
    </>
  );
};

export default Page;
