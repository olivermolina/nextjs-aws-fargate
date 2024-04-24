import React, { ChangeEvent, FC, MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import LinearProgress from '@mui/material/LinearProgress';
import dayjs from 'dayjs';
import { SeverityPill, SeverityPillColor } from '../../../components/severity-pill';
import Stack from '@mui/material/Stack';
import { FaxWithStaff } from './sent-fax';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';

const statusMap: Record<string, SeverityPillColor> = {
  Success: 'success',
  Sent: 'success',
  Failed: 'error',
};

interface FaxListTableProps {
  count?: number;
  items?: FaxWithStaff[];
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectOne?: (customerId: string) => void;
  page?: number;
  rowsPerPage?: number;
  selected?: string[];
  isLoading?: boolean;
  handleViewFax?: (fileName: string, direction: 'IN' | 'OUT') => void;
}

export const SentFaxListTable: FC<FaxListTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => {
    },
    onRowsPerPageChange,
    page = 0,
    rowsPerPage = 10,
    selected = [],
    isLoading,
    handleViewFax,
  } = props;

  return (
    <Box sx={{ position: 'relative' }}>
      <Scrollbar>
        {isLoading && <LinearProgress />}
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>To </TableCell>
              <TableCell>Sent</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>View</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((fax) => {
              const isSelected = selected.includes(fax.id);

              const recipientFullName = `${fax.recipient_first_name} ${fax.recipient_last_name}`;
              const statusColor = statusMap[fax.srfax_sent_status || fax.status || ''] || 'error';
              return (
                <TableRow
                  hover
                  key={fax.id}
                  selected={isSelected}
                >
                  <TableCell>{fax.to_number}</TableCell>

                  <TableCell>{dayjs(fax.updated_at).format('MMM DD, YYYY')}</TableCell>

                  <TableCell>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {recipientFullName}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      color="text.secondary"
                      variant="body1"
                    >
                      {fax.subject}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      color="text.secondary"
                      variant="body1"
                    >
                      {fax.remarks}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack
                      direction={'row'}
                      spacing={1}
                    >
                      <SeverityPill color={statusColor}>
                        {fax.srfax_sent_status || fax.status || 'Failed'}
                      </SeverityPill>
                      <Typography variant="body2">
                        {fax.status === 'Success' &&
                          fax.srfax_sent_status === 'Failed' &&
                          `${fax.srfax_error_code || ''}`}
                        {fax.status === 'Failed' && `${fax.status_message || ''}`}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    {fax.srfax_file_name && (
                      <Tooltip title={'View Fax'}>
                        <IconButton
                          onClick={() => handleViewFax?.(fax.srfax_file_name || '', 'OUT')}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
};
