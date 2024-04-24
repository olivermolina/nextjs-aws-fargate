import type { FC } from 'react';
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
import dayjs from 'dayjs';
import Stripe from 'stripe';
import { useAuth } from 'src/hooks/use-auth';

interface InvoicePreviewProps {
  invoice: Stripe.Invoice;
}

type BillingAddressBoxProp = {
  address?: Stripe.Invoice['customer_address'] | null;
};

const BillingAddressBox = ({ address }: BillingAddressBoxProp) => {
  if (!address) return null;

  return (
    <>
      {address.line1 && <>{address.line2}</>}
      {address.line2 && (
        <>
          <br />
          {address.line2}
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

export const AccountInvoicePreview: FC<InvoicePreviewProps> = (props) => {
  const { invoice, ...other } = props;
  const { user } = useAuth();
  const billingAddress = invoice.customer_address;
  const items = invoice.lines.data || [];
  const dueDate = format(
    dayjs((invoice.due_date || invoice.created) * 1000).toDate(),
    'dd MMM yyyy'
  );
  const issueDate =
    invoice.created && format(dayjs(invoice.created * 1000).toDate(), 'dd MMM yyyy');
  const currency = user?.organization?.currency_symbol || '$';
  const subtotalAmount = numeral(invoice.subtotal / 100).format(`${currency}0,0.00`);
  const taxAmount = numeral(Number(invoice.tax) / 100).format(`${currency}0,0.00`);
  const totalAmount = numeral(invoice.total / 100).format(`${currency}0,0.00`);

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
          <Typography variant="subtitle2">Luna Health</Typography>
        </div>
        <div>
          <Typography
            align="right"
            color="success.main"
            variant="h4"
          >
            {invoice.status?.toUpperCase()}
          </Typography>
          <Typography
            align="right"
            variant="subtitle2"
          >
            {invoice.number}
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
              <BillingAddressBox
                address={{
                  line1: '4059 Carling Avenue',
                  line2: 'Suite 202',
                  city: 'Ottawa',
                  state: 'Ontario',
                  country: 'Canada',
                  postal_code: 'K2K 2A4',
                }}
              />
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
              support@lunahealth.app
              <br />
              +1 1234567965
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
            <Typography variant="body2">{invoice.number}</Typography>
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
          {invoice.customer_name}
          {user?.organization && (
            <>
              <br /> {user?.organization.name}
            </>
          )}
          {user?.organization?.Tax?.vat_number && (
            <>
              <br /> {user?.organization?.Tax?.vat_number}
            </>
          )}

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
            const unitAmount = numeral(Number(item.unit_amount_excluding_tax) / 100).format(
              `${currency}0,0.00`
            );
            const totalAmount = numeral(Number(item.amount) / 100).format(`${currency}0,0.00`);

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
