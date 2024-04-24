import { type ChangeEvent, FC, useCallback } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { Scrollbar } from 'src/components/scrollbar';
import type { SeverityPillColor } from 'src/components/severity-pill';
import { SeverityPill } from 'src/components/severity-pill';
import { InvoiceStatus } from '@prisma/client';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import { paths } from '../../../paths';
import { useRouter } from '../../../hooks/use-router';

const statusMap: Record<InvoiceStatus, SeverityPillColor> = {
  PAID: 'success',
  PENDING: 'warning',
  CANCELED: 'error',
};

interface Transaction {
  id: string;
  amount: number;
  createdAt: number;
  currency: string;
  sender: string;
  status: InvoiceStatus;
}

interface OverviewTransactionsProps {
  transactions: Transaction[];
  tab: InvoiceStatus | 'all' | undefined;
  setTabValue: (status: InvoiceStatus | 'all' | undefined) => void;
  isLoading: boolean;
}

export const OverviewTransactions: FC<OverviewTransactionsProps> = (props) => {
  const { transactions, tab, setTabValue, isLoading } = props;
  const router = useRouter();

  const onItemClick = (transaction: Transaction) => {
    const transactionId = transaction.id;
    router.push(paths.dashboard.invoices.index + `/${transactionId}`);
  };

  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: string): void => {
    setTabValue(value as InvoiceStatus | 'all');
  }, []);

  return (
    <Card>
      <CardHeader
        title="Latest Transactions"
        sx={{ pb: 0 }}
      />
      <Tabs
        value={tab || 'all'}
        sx={{ px: 3 }}
        onChange={handleTabsChange}
      >
        <Tab
          label="All"
          value="all"
        />
        <Tab
          label="Paid"
          value={InvoiceStatus.PAID}
        />
        <Tab
          label="Pending"
          value={InvoiceStatus.PENDING}
        />
        <Tab
          label="Canceled"
          value={InvoiceStatus.CANCELED}
        />
      </Tabs>
      <Divider />
      <Scrollbar>
        <Table sx={{ minWidth: 600 }}>
          <TableBody>
            {isLoading && transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography
                    align="center"
                    color="textSecondary"
                    variant="caption"
                  >
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography
                    align="center"
                    color="textSecondary"
                    variant="caption"
                  >
                    There are no transactions available
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {transactions.map((transaction) => {
              const createdAtMonth = format(transaction.createdAt, 'LLL').toUpperCase();
              const createdAtDay = format(transaction.createdAt, 'd');
              const statusColor = statusMap[transaction.status];
              const type = transaction.status === InvoiceStatus.PAID ? 'Payment received' : 'Invoice sent';
              const amount =
                (transaction.status === InvoiceStatus.PAID ? '+' : '-') +
                ' ' +
                numeral(transaction.amount).format('$0,0.00');
              const amountColor = transaction.status === InvoiceStatus.PAID ? 'success.main' : 'error.main';

              return (
                <TableRow
                  key={transaction.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => onItemClick(transaction)}
                >
                  <TableCell width={100}>
                    <Box
                      sx={{
                        p: 1,
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100',
                        borderRadius: 2,
                        maxWidth: 'fit-content',
                      }}
                    >
                      <Typography
                        align="center"
                        color="text.primary"
                        variant="caption"
                      >
                        {createdAtMonth}
                      </Typography>
                      <Typography
                        align="center"
                        color="text.primary"
                        variant="h6"
                      >
                        {createdAtDay}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Typography variant="subtitle2">{transaction.sender}</Typography>
                      <Typography
                        color="text.secondary"
                        variant="body2"
                      >
                        {type}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <SeverityPill color={statusColor}>{transaction.status}</SeverityPill>
                  </TableCell>
                  <TableCell width={180}>
                    <Typography
                      color={amountColor}
                      variant="subtitle2"
                    >
                      {amount}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>

      <Divider />
      <CardActions>
        <Button
          color="inherit"
          endIcon={
            <SvgIcon>
              <ArrowRightIcon />
            </SvgIcon>
          }
          size="small"
          href={paths.dashboard.invoices.index}
        >
          See all
        </Button>
      </CardActions>
    </Card>
  );
};

OverviewTransactions.propTypes = {
  transactions: PropTypes.array.isRequired,
};
