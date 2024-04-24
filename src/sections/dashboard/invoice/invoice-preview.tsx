import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Logo } from 'src/components/logo';
import type { Invoice } from 'src/types/invoice';
import { getUserFullName } from 'src/utils/get-user-full-name';
import dayjs from 'dayjs';
import { Address } from '@prisma/client';
import { useOrganizationStore } from '../../../hooks/use-organization';

interface InvoicePreviewProps {
  invoice: Invoice;
}

type BillingAddressBoxProp = {
  address?: Address | null;
};

const BillingAddressBox = ({ address }: BillingAddressBoxProp) => {
  if (!address) return null;

  return (
    <>
      {address.address_line1 && <>{address.address_line1}</>}
      {address.address_line2 && (
        <>
          <br />
          {address.address_line2}
        </>
      )}
      {address.postal_code ? `, ${address.postal_code}` : ''}
      {address.city && (
        <>
          <br />
          {address.city}, {address.state}
          {address.country ? `, ${address.country}` : ''}
        </>
      )}
    </>
  );
};

export const InvoicePreview: FC<InvoicePreviewProps> = (props) => {
  const { invoice, ...other } = props;
  const organizationStore = useOrganizationStore();
  const billingAddress = invoice.patient.billing_address;
  const organizationAddress = organizationStore.data?.address;
  const items = invoice.InvoiceItems || [];
  const dueDate = invoice.due_date && format(dayjs(invoice.due_date).toDate(), 'dd MMM yyyy');
  const issueDate = invoice.created_at && format(dayjs(invoice.created_at).toDate(), 'dd MMM yyyy');
  const currency = organizationStore.data?.currency_symbol || '$';
  const subtotalAmount = numeral(invoice.subtotal_amount).format(`${currency}0,0.00`);
  const taxAmount = numeral(invoice.tax_amount).format(`${currency}0,0.00`);
  const totalAmount = numeral(invoice.total_amount).format(`${currency}0,0.00`);

  return (
    <Card
      {...other}
      sx={{ p: 6 }}
    >
      <Stack
        alignItems="flex-start"
        direction="row"
        justifyContent="space-between"
        spacing={3}
      >
        <div>
          <Box
            sx={{
              display: 'inline-flex',
              height: 24,
              width: 24,
            }}
          >
            <Logo />
          </Box>
          <Typography variant="subtitle2">{organizationStore.data?.website}</Typography>
        </div>
        <div>
          <Typography
            align="right"
            color="success.main"
            variant="h4"
          >
            {invoice.status.toUpperCase()}
          </Typography>
          <Typography
            align="right"
            variant="subtitle2"
          >
            {invoice.invoice_number}
          </Typography>
        </div>
      </Stack>
      <Box sx={{ mt: 4 }}>
        <Grid
          container
          justifyContent="space-between"
        >
          <Grid
            xs={12}
            md={4}
          >
            <Typography variant="body2">
              <BillingAddressBox address={organizationAddress} />
            </Typography>
          </Grid>
          <Grid
            xs={12}
            md={4}
          >
            <Typography variant="body2">
              Company No. {organizationStore.data?.Tax?.company_number}
              <br />
              EU VAT No. {organizationStore.data?.Tax?.vat_number}
              <br />
            </Typography>
          </Grid>
          <Grid
            xs={12}
            md={4}
          >
            <Typography
              align="right"
              variant="body2"
            >
              {organizationStore.data?.email}
              <br />
              {organizationStore.data?.phone}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Grid
          container
          justifyContent="space-between"
        >
          <Grid
            xs={12}
            md={4}
          >
            <Typography
              gutterBottom
              variant="subtitle2"
            >
              Due date
            </Typography>
            <Typography variant="body2">{dueDate}</Typography>
          </Grid>
          <Grid
            xs={12}
            md={4}
          >
            <Typography
              gutterBottom
              variant="subtitle2"
            >
              Date of issue
            </Typography>
            <Typography variant="body2">{issueDate}</Typography>
          </Grid>
          <Grid
            xs={12}
            md={4}
          >
            <Typography
              gutterBottom
              variant="subtitle2"
            >
              Number
            </Typography>
            <Typography variant="body2">{invoice.invoice_number}</Typography>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography
          gutterBottom
          variant="subtitle2"
        >
          Billed to
        </Typography>
        <Typography variant="body2">
          {getUserFullName(invoice.patient)}
          {invoice.patient.company ? `<br /> ${invoice.patient.company}` : ''}
          {invoice.patient.Tax?.vat_number ? `<br /> ${invoice.patient.Tax?.vat_number}` : ''}
          <BillingAddressBox address={billingAddress} />
        </Typography>
      </Box>
      <Table sx={{ mt: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Unit Price</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => {
            const unitAmount = numeral(item.unit_amount).format(`${currency}0,0.00`);
            const totalAmount = numeral(item.total_amount).format(`${currency}0,0.00`);

            return (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{unitAmount}</TableCell>
                <TableCell align="right">{totalAmount}</TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell
              colSpan={3}
              sx={{ borderBottom: 'none' }}
            />
            <TableCell sx={{ borderBottom: 'none' }}>
              <Typography variant="subtitle1">Subtotal</Typography>
            </TableCell>
            <TableCell
              align="right"
              sx={{ borderBottom: 'none' }}
            >
              <Typography variant="subtitle2">{subtotalAmount}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              colSpan={3}
              sx={{ borderBottom: 'none' }}
            />
            <TableCell sx={{ borderBottom: 'none' }}>
              <Typography variant="subtitle1">Taxes</Typography>
            </TableCell>
            <TableCell
              align="right"
              sx={{ borderBottom: 'none' }}
            >
              <Typography variant="subtitle2">{taxAmount}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              colSpan={3}
              sx={{ borderBottom: 'none' }}
            />
            <TableCell sx={{ borderBottom: 'none' }}>
              <Typography variant="subtitle1">Total</Typography>
            </TableCell>
            <TableCell
              align="right"
              sx={{ borderBottom: 'none' }}
            >
              <Typography variant="subtitle2">{totalAmount}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Box sx={{ mt: 2 }}>
        <Typography
          gutterBottom
          variant="h6"
        >
          Notes
        </Typography>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          Please make sure you have the right bank registration number as I had issues before and
          make sure you guys cover transfer expenses.
        </Typography>
      </Box>
    </Card>
  );
};

InvoicePreview.propTypes = {
  // @ts-ignore
  invoice: PropTypes.object.isRequired,
};
