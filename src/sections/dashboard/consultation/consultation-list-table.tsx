import React, { ChangeEvent, FC, MouseEvent } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import type { SeverityPillColor } from 'src/components/severity-pill';
import { SeverityPill } from 'src/components/severity-pill';
import { Status } from '@prisma/client';
import { Consultation } from 'src/types/consultation';
import LinearProgress from '@mui/material/LinearProgress';
import UserAvatar from '../../../components/user-avatar';

export const statusMap: Record<Status, SeverityPillColor> = {
  COMPLETED: 'success',
  PENDING: 'info',
  CANCELED: 'warning',
  CONFIRMED: 'primary',
};

interface ConsultationListTableProps {
  count?: number;
  items?: Consultation[];
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (id: string) => void;
  page?: number;
  rowsPerPage?: number;
  isLoading?: boolean;
  isPatientView?: boolean;
}

export const ConsultationListTable: FC<ConsultationListTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelect,
    page = 0,
    rowsPerPage = 0,
    isLoading,
    isPatientView,
  } = props;

  return (
    <div>
      {isLoading && <LinearProgress />}
      <Table>
        <TableBody>
          {items.map((consultation) => {
            const scheduleStartMonth = format(
              new Date(consultation.start_time),
              'LLL'
            ).toUpperCase();
            const scheduledStartDay = format(new Date(consultation.start_time), 'd');
            const statusColor = statusMap[consultation.status] || 'warning';
            const consultationTime = format(new Date(consultation.start_time), 'HH:mm');
            const fullName = `${consultation.user.first_name} ${consultation.user.last_name}`;
            return (
              <TableRow
                hover
                key={consultation.id}
                onClick={() => onSelect?.(consultation.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.200',
                      borderRadius: 2,
                      maxWidth: 'fit-content',
                      ml: 3,
                      p: 1,
                    }}
                  >
                    <Typography
                      align="center"
                      variant="subtitle2"
                    >
                      {scheduleStartMonth}
                    </Typography>
                    <Typography
                      align="center"
                      variant="h6"
                    >
                      {scheduledStartDay}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle2">
                      {isPatientView ? consultation.service?.name : fullName}{' '}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {consultationTime}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="left">
                  {consultation.staffs?.length > 0 && (
                    <UserAvatar
                      userId={consultation.staffs?.[0].staff?.id}
                      height={42}
                      width={42}
                    />
                  )}
                </TableCell>
                {!isPatientView && (
                  <TableCell align="center">
                    <Typography>{consultation.service?.name}</Typography>
                  </TableCell>
                )}
                <TableCell align="right">
                  <Typography>
                    {consultation.location
                      ? consultation.location?.display_name
                      : consultation.telemedicine
                        ? 'Telemedicine'
                        : ''}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <SeverityPill color={statusColor}>{consultation.status}</SeverityPill>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={count}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </div>
  );
};

ConsultationListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelect: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
};
