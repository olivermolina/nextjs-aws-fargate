import React, { ChangeEvent, FC, MouseEvent } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Scrollbar } from 'src/components/scrollbar';
import LinearProgress from '@mui/material/LinearProgress';
import { SeverityPill, SeverityPillColor } from '../../../components/severity-pill';
import Stack from '@mui/material/Stack';
import { IReceivedFax } from '../../../types/sr-fax';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Tooltip from '@mui/material/Tooltip';

const statusMap: Record<string, SeverityPillColor> = {
  Ok: 'success',
  Partial: 'error',
};

interface ReceivedFaxListTableProps {
  count?: number;
  items?: IReceivedFax[];
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectOne?: (customerId: string) => void;
  page?: number;
  rowsPerPage?: number;
  selected?: string[];
  isLoading?: boolean;
  handleViewFax?: (fileName: string, direction: 'IN' | 'OUT') => void;
}

export const ReceivedFaxListTable: FC<ReceivedFaxListTableProps> = (props) => {
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
              <TableCell>Date</TableCell>
              <TableCell>From Fax#</TableCell>
              <TableCell>Remote ID</TableCell>
              <TableCell>Pages</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>View</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((fax) => {
              const isSelected = selected.includes(fax.FileName);

              const statusColor = statusMap[fax.ReceiveStatus] || 'warning';
              return (
                <TableRow
                  hover
                  key={fax.FileName}
                  selected={isSelected}
                >
                  <TableCell>{fax.Date}</TableCell>
                  <TableCell>{fax.CallerID}</TableCell>
                  <TableCell>{fax.RemoteID}</TableCell>
                  <TableCell>{fax.Pages}</TableCell>
                  <TableCell>{fax.Size}</TableCell>
                  <TableCell>
                    <Stack
                      direction={'row'}
                      spacing={1}
                    >
                      <SeverityPill color={statusColor}>{fax.ReceiveStatus}</SeverityPill>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={'View Fax'}>
                      <IconButton onClick={() => handleViewFax?.(fax.FileName, 'IN')}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
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

ReceivedFaxListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
};
