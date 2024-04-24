import type { FC } from 'react';
import { useMemo } from 'react';
import ClockIcon from '@untitled-ui/icons-react/build/esm/Clock';
import ReceiptCheckIcon from '@untitled-ui/icons-react/build/esm/ReceiptCheck';
import ReceiptIcon from '@untitled-ui/icons-react/build/esm/Receipt';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Invoice } from 'src/types/invoice';
import numeral from 'numeral';
import { InvoiceStatus } from '@prisma/client';

interface InvoiceListSummaryProps {
  invoices: Invoice[];
}

export const InvoiceListSummary: FC<InvoiceListSummaryProps> = ({ invoices }) => {
  const summary = useMemo(() => {
    const pending = invoices.filter((invoice) => invoice.status === InvoiceStatus.PENDING);
    const paid = invoices.filter((invoice) => invoice.status === InvoiceStatus.PAID);

    return {
      total: numeral(invoices.reduce((acc, invoice) => (acc += invoice.total_amount), 0)).format(
        '0,0.00'
      ),
      paidTotal: numeral(paid.reduce((acc, invoice) => (acc += invoice.total_amount), 0)).format(
        '0,0.00'
      ),
      paidCount: paid.length,
      pendingTotal: numeral(
        pending.reduce((acc, invoice) => (acc += invoice.total_amount), 0)
      ).format('0,0.00'),
      pendingCount: pending.length,
    };
  }, [invoices]);

  const currencySymbol = invoices[0]?.staffs[0]?.Staff.organization.currency_symbol;

  return (
    <div>
      <Grid
        container
        spacing={3}
      >
        <Grid
          xs={12}
          md={6}
          lg={4}
        >
          <Card>
            <CardContent>
              <Stack
                alignItems="center"
                direction="row"
                spacing={2}
              >
                <Avatar
                  sx={{
                    height: 48,
                    width: 48,
                  }}
                >
                  <ReceiptIcon />
                </Avatar>
                <div>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    Total
                  </Typography>
                  <Typography variant="h6">
                    {currencySymbol}
                    {summary.total}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    from {invoices.length} invoices
                  </Typography>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          xs={12}
          md={6}
          lg={4}
        >
          <Card>
            <CardContent>
              <Stack
                alignItems="center"
                direction="row"
                spacing={2}
              >
                <Avatar
                  sx={{
                    backgroundColor: 'success.lightest',
                    color: 'success.main',
                    height: 48,
                    width: 48,
                  }}
                >
                  <ReceiptCheckIcon />
                </Avatar>
                <div>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    Paid
                  </Typography>
                  <Typography variant="h6">
                    {' '}
                    {currencySymbol}
                    {summary.paidTotal}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    from {summary.paidCount} invoices
                  </Typography>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid
          xs={12}
          md={6}
          lg={4}
        >
          <Card>
            <CardContent>
              <Stack
                alignItems="center"
                direction="row"
                spacing={2}
              >
                <Avatar
                  sx={{
                    backgroundColor: 'warning.lightest',
                    color: 'warning.main',
                    height: 48,
                    width: 48,
                  }}
                >
                  <ClockIcon />
                </Avatar>
                <div>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    Pending
                  </Typography>
                  <Typography variant="h6">
                    {' '}
                    {currencySymbol}
                    {summary.pendingTotal}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    from {summary.pendingTotal} invoices
                  </Typography>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};
