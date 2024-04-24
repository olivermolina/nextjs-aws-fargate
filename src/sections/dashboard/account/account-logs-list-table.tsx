import React, { ChangeEvent, FC, MouseEvent } from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Log, LogAction, SubFile, User } from '@prisma/client';
import LinearProgress from '@mui/material/LinearProgress';
import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import SvgIcon from '@mui/material/SvgIcon';
import EventNoteIcon from '@mui/icons-material/EventNote';
import Typography from '@mui/material/Typography';
import { getUserFullName } from '../../../utils/get-user-full-name';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

const logActionMap: Record<LogAction, string> = {
  VIEW: 'warning.main',
  EDIT: 'primary.main',
  CREATE: 'success.main',
  DELETE: 'error.main',
};

const logActionLabelMap: Record<LogAction, string> = {
  VIEW: 'viewed',
  EDIT: 'updated',
  CREATE: 'created',
  DELETE: 'deleted',
};

interface Props {
  count?: number;
  items?: (Log & { staff: User; sub_file: SubFile | null; user: User })[];
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (log: Log & { sub_file: SubFile | null }) => void;
  page?: number;
  rowsPerPage?: number;
  isLoading?: boolean;
}

const RenderLogCell: FC<{ log: Log & { staff: User; user: User } }> = ({ log }) => {
  let Icon = PersonSearchIcon;
  let appendText = ` of ${getUserFullName(log.user)}`;
  if (log.chart_id) {
    Icon = EventNoteIcon;
  } else if (log.consultation_id) {
    Icon = CalendarTodayIcon;
    appendText = ` for ${getUserFullName(log.user)}`;
  } else if (log.file_id || log.sub_file_id) {
    Icon = InsertDriveFileOutlinedIcon;
  } else if (log.action === LogAction.CREATE) {
    Icon = PersonAddAltIcon;
    appendText = ` ${getUserFullName(log.user)}`;
  } else if (log.action === LogAction.DELETE) {
    Icon = PersonRemoveIcon;
    appendText = '';
  }

  return (
    <TableCell align="left">
      <Stack
        direction={{ lg: 'row', xs: 'column' }}
        spacing={1}
        justifyContent={{ lg: 'flex-start', xs: 'center' }}
        alignItems={{ lg: 'flex-end', xs: 'flex-start' }}
      >
        <SvgIcon fontSize={'small'}>
          <Icon />
        </SvgIcon>
        <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
          {getUserFullName(log.staff)}
        </Typography>
        <Typography
          sx={{ whiteSpace: 'nowrap' }}
          color={logActionMap[log.action]}
        >
          {logActionLabelMap[log.action]}
        </Typography>
        <Typography
          sx={{
            whiteSpace: 'nowrap',
          }}
        >
          {log.text} {appendText}
        </Typography>
      </Stack>
    </TableCell>
  );
};

export const AccountLogsListTable: FC<Props> = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => {
    },
    onRowsPerPageChange,
    onSelect,
    page = 0,
    rowsPerPage = 0,
    isLoading,
  } = props;

  return (
    <div>
      {isLoading && <LinearProgress />}
      <Table>
        <TableBody>
          {items.map((log) => {
            return (
              <TableRow
                hover
                key={log.id}
                onClick={() => onSelect?.(log)}
                sx={{ cursor: 'pointer' }}
              >
                <RenderLogCell log={log} />
                <TableCell align="right">
                  {dayjs(log.created_at).format('MMM D, YYYY h:mm A')}
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

AccountLogsListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelect: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
};
