import type { FC } from 'react';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import { MoreMenu } from 'src/components/more-menu';
import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import { paths } from 'src/paths';
import { CustomerPayment } from 'src/sections/dashboard/customer/customer-payment';

import { PatientWithInvoices } from 'src/types/patient';
import dayjs from 'dayjs';
import { InvoiceStatus } from '@prisma/client';
import numeral from 'numeral';
import { CustomerAddressDetails } from './customer-address-details';
import CustomerPaymentMethod from './customer-payment-method';

interface CustomerInvoicesProps {
  customer: PatientWithInvoices;
  hasEditAccess?: boolean;
}

export const CustomerInvoices: FC<CustomerInvoicesProps> = ({
  customer,
  hasEditAccess,
  ...other
}) => {
  const invoices = customer.PatientInvoices;

  return (
    <Grid
      container
      spacing={4}
    >
      <Grid
        xs={12}
        item
      >
        <Card {...other}>
          <CardHeader
            action={<MoreMenu />}
            title="Recent Invoices"
          />
          <Scrollbar>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => {
                  const issueDate = dayjs(invoice.created_at).format('MMM DD, YYYY');
                  const statusColor = invoice.status === InvoiceStatus.PAID ? 'success' : 'error';
                  const currency = invoice.staffs?.[0].Staff?.organization?.currency_symbol || '$';

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>#{invoice.invoice_number}</TableCell>
                      <TableCell>{issueDate}</TableCell>
                      <TableCell>
                        {currency}
                        {numeral(invoice.total_amount).format('0,0.00')}
                      </TableCell>
                      <TableCell>
                        <SeverityPill color={statusColor}>{invoice.status}</SeverityPill>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          component={RouterLink}
                          href={paths.dashboard.invoices.details.replace(':invoiceId', invoice.id)}
                        >
                          <SvgIcon>
                            <ArrowRightIcon />
                          </SvgIcon>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Scrollbar>
          <TablePagination
            component="div"
            count={invoices.length}
            onPageChange={(): void => {
            }}
            onRowsPerPageChange={(): void => {
            }}
            page={0}
            rowsPerPage={5}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Card>
      </Grid>

      <Grid
        xs={12}
        lg={4}
        item
      >
        <CustomerAddressDetails
          title={'Billing Details'}
          customer={customer}
          isBilling={true}
        />
      </Grid>

      <Grid
        xs={12}
        lg={4}
        item
      >
        <Stack spacing={4}>
          <CustomerPayment />
        </Stack>
      </Grid>

      <Grid
        xs={12}
        lg={4}
        item
      >
        <CustomerPaymentMethod
          customerId={customer.id}
          hasEditAccess={hasEditAccess}
        />
      </Grid>
    </Grid>
  );
};
