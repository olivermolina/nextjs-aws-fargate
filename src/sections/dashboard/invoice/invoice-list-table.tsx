import React, { ChangeEvent, FC, MouseEvent } from 'react';
import { format } from 'date-fns';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import type { SeverityPillColor } from 'src/components/severity-pill';
import { SeverityPill } from 'src/components/severity-pill';
import { paths } from 'src/paths';
import type { Invoice } from 'src/types/invoice';
import { InvoiceStatus } from '@prisma/client';
import { getUserFullName } from 'src/utils/get-user-full-name';
import dayjs from 'dayjs';
import UserAvatar from '../../../components/user-avatar';

type GroupedInvoices = {
  [key in InvoiceStatus]: Invoice[];
};

const groupInvoices = (invoices: Invoice[]): GroupedInvoices => {
  return invoices.reduce(
    (acc: Record<InvoiceStatus, Invoice[]>, invoice) => {
      const { status } = invoice;

      return {
        ...acc,
        [status]: [...acc[status], invoice],
      };
    },
    {
      [InvoiceStatus.PAID]: [],
      [InvoiceStatus.PENDING]: [],
      [InvoiceStatus.CANCELED]: [],
    },
  );
};

const statusColorsMap: Record<InvoiceStatus, SeverityPillColor> = {
  [InvoiceStatus.CANCELED]: 'error',
  [InvoiceStatus.PAID]: 'success',
  [InvoiceStatus.PENDING]: 'warning',
};

interface InvoiceRowProps {
  invoice: Invoice;
}

const InvoiceRow: FC<InvoiceRowProps> = (props) => {
  const { invoice, ...other } = props;
  const statusColor = statusColorsMap[invoice.status];
  const totalAmount = numeral(invoice.total_amount).format('0,0.00');
  const issueDate = invoice.created_at && format(dayjs(invoice.created_at).toDate(), 'dd/MM/yyyy');
  const dueDate = invoice.due_date && format(dayjs(invoice.due_date).toDate(), 'dd/MM/yyyy');
  const staff = invoice.staffs[0]?.Staff;

  return (
    <TableRow
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
      {...other}
    >
      <TableCell width="25%">
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
          component={RouterLink}
          href={paths.dashboard.invoices.details.replace(':invoiceId', invoice.id)}
          sx={{
            display: 'inline-flex',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <UserAvatar
            userId={invoice.patient.id}
            height={25}
            width={25}
          />
          <div>
            <Typography
              color="text.primary"
              variant="subtitle2"
            >
              {invoice.invoice_number}
            </Typography>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {getUserFullName(invoice.patient)}
            </Typography>
          </div>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="subtitle2">
          {staff?.organization?.currency_symbol}
          {totalAmount}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="subtitle2">Issued</Typography>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          {issueDate}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="subtitle2">Due</Typography>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          {dueDate}
        </Typography>
      </TableCell>
      <TableCell align="right">
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
};

InvoiceRow.propTypes = {
  // @ts-ignore
  invoice: PropTypes.object.isRequired,
};

interface InvoiceListTableProps {
  count?: number;
  group?: boolean;
  items?: Invoice[];
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  page?: number;
  rowsPerPage?: number;
}

export const InvoiceListTable: FC<InvoiceListTableProps> = (props) => {
  const {
    group = false,
    items = [],
    count = 0,
    onPageChange = () => {
    },
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 0,
  } = props;

  let content: JSX.Element;

  if (group) {
    const groupedInvoices = groupInvoices(items);
    const statuses = Object.keys(groupedInvoices) as InvoiceStatus[];

    content = (
      <Stack spacing={6}>
        {statuses.map((status) => {
          const groupTitle = status.charAt(0).toUpperCase() + status.slice(1);
          const count = groupedInvoices[status].length;
          const invoices = groupedInvoices[status];
          const hasInvoices = invoices.length > 0;

          return (
            <Stack
              key={groupTitle}
              spacing={2}
            >
              <Typography
                color="text.secondary"
                variant="h6"
              >
                {groupTitle} ({count})
              </Typography>
              {hasInvoices && (
                <Card>
                  <Scrollbar>
                    <Table sx={{ minWidth: 600 }}>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <InvoiceRow
                            key={invoice.id}
                            invoice={invoice}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </Card>
              )}
            </Stack>
          );
        })}
      </Stack>
    );
  } else {
    content = (
      <Card>
        <Table>
          <TableBody>
            {items.map((invoice) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  return (
    <Stack spacing={4}>
      {content}
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Stack>
  );
};

InvoiceListTable.propTypes = {
  count: PropTypes.number,
  group: PropTypes.bool,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
};
