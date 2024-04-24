import React, { ChangeEvent, FC, MouseEvent } from 'react';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/components/router-link';
import { Scrollbar } from 'src/components/scrollbar';
import { paths } from 'src/paths';
import { SeverityPill, SeverityPillColor } from '../../../components/severity-pill';
import LinearProgress from '@mui/material/LinearProgress';
import UserAvatar from '../../../components/user-avatar';
import { User } from '@prisma/client';
import CustomerListStaffCell from './customer-list-staff-cell';

const ActiveMap: Record<string, SeverityPillColor> = {
  true: 'success',
  false: 'warning',
};

const ActiveStringMap: Record<string, string> = {
  true: 'Active',
  false: 'Inactive',
};

interface CustomerListTableProps {
  count?: number;
  items?: User[];
  onDeselectAll?: () => void;
  onDeselectOne?: (customerId: string) => void;
  onPageChange?: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectAll?: () => void;
  onSelectOne?: (customerId: string) => void;
  page?: number;
  rowsPerPage?: number;
  selected?: string[];
  isLoading?: boolean;
  openAssignStaff?: () => void;
}

export const CustomerListTable: FC<CustomerListTableProps> = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onPageChange = () => {
    },
    onRowsPerPageChange,
    onSelectAll,
    page = 0,
    rowsPerPage = 10,
    selected = [],
    isLoading,
    onSelectOne,
    onDeselectOne,
    openAssignStaff,
  } = props;

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;
  const enableBulkActions = selected.length > 0;

  return (
    <Box sx={{ position: 'relative' }}>
      {enableBulkActions && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
            display: enableBulkActions ? 'flex' : 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            px: 2,
            py: 0.5,
            zIndex: 10,
          }}
        >
          <Checkbox
            checked={selectedAll}
            indeterminate={selectedSome}
            onChange={(event) => {
              if (event.target.checked) {
                onSelectAll?.();
              } else {
                onDeselectAll?.();
              }
            }}
          />
          <Button
            color="inherit"
            size="small"
            onClick={() => openAssignStaff?.()}
          >
            Assign Staff
          </Button>
        </Stack>
      )}
      <Scrollbar>
        {isLoading && <LinearProgress />}
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onSelectAll?.();
                    } else {
                      onDeselectAll?.();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Name & Email </TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((customer) => {
              const isSelected = selected.includes(customer.id);
              const statusColor = ActiveMap[customer.active.toString()] || 'warning';

              const fullName = `${customer.first_name} ${customer.last_name}`;
              return (
                <TableRow
                  hover
                  key={customer.id}
                  selected={isSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                        if (event.target.checked) {
                          onSelectOne?.(customer.id);
                        } else {
                          onDeselectOne?.(customer.id);
                        }
                      }}
                      value={isSelected}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    >
                      <UserAvatar
                        userId={customer.id}
                        height={42}
                        width={42}
                      />
                      <div>
                        <Link
                          color="inherit"
                          component={RouterLink}
                          href={paths.dashboard.customers.details.replace(
                            ':customerId',
                            customer.id,
                          )}
                          variant="subtitle2"
                        >
                          {fullName}
                        </Link>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                        >
                          {customer.email}
                        </Typography>
                      </div>
                    </Stack>
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>

                  <TableCell>
                    <CustomerListStaffCell customerId={customer.id} />
                  </TableCell>
                  <TableCell>
                    <SeverityPill color={statusColor}>
                      {ActiveStringMap[customer.active.toString()]}
                    </SeverityPill>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      component={RouterLink}
                      href={paths.dashboard.customers.edit.replace(':customerId', customer.id)}
                    >
                    </IconButton>
                    <IconButton
                      component={RouterLink}
                      href={paths.dashboard.customers.details.replace(':customerId', customer.id)}
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

CustomerListTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
};
