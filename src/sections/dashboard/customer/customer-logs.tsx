import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { MoreMenu } from 'src/components/more-menu';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import type { CustomerLog } from 'src/types/customer';

interface CustomerLogsProps {
  logs?: CustomerLog[];
}

export const CustomerLogs: FC<CustomerLogsProps> = (props) => {
  const { logs = [], ...other } = props;

  return (
    <Card {...other}>
      <CardHeader
        action={<MoreMenu />}
        title="Recent Logs"
      />
      <Scrollbar>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Path</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Ip</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => {
              const statusColor = log.status >= 200 && log.status < 300 ? 'success' : 'error';
              const createdAt = format(log.createdAt, 'yyyy/MM/dd HH:mm:ss');

              return (
                <TableRow key={log.id}>
                  <TableCell width="100">
                    <Typography
                      color="text.secondary"
                      variant="caption"
                    >
                      {log.method}
                    </Typography>
                  </TableCell>
                  <TableCell width="64">
                    <SeverityPill color={statusColor}>{log.status}</SeverityPill>
                  </TableCell>
                  <TableCell>{log.route}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.ip}</TableCell>
                  <TableCell>{createdAt}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <TablePagination
        component="div"
        count={logs.length}
        onPageChange={(): void => {}}
        onRowsPerPageChange={(): void => {}}
        page={0}
        rowsPerPage={10}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
};

CustomerLogs.propTypes = {
  logs: PropTypes.array,
};
