import React, { ChangeEvent, FC, MouseEvent, useCallback, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import dayjs from 'dayjs';
import Menu from '@mui/material/Menu';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
import { usePopover } from '../../../hooks/use-popover';
import { AccountLogsListTable } from './account-logs-list-table';
import { trpc } from '../../../app/_trpc/client';
import { Log, LogAction, SubFile, User } from '@prisma/client';
import { useStaffsStore } from '../../../hooks/use-staffs-store';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { useRouter } from '../../../hooks/use-router';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

type DateFilter = {
  startDate: Date | null;
  endDate: Date | null;
};

interface SearchState {
  filters: DateFilter & { staffIds?: string[] | null };
  page: number;
  rowsPerPage: number;
}

const useSearch = () => {
  const [state, setState] = useState<SearchState>({
    filters: {
      startDate: null,
      endDate: null,
      staffIds: undefined,
    },
    page: 0,
    rowsPerPage: 10,
  });

  const handleFiltersChange = useCallback((filters: SearchState['filters']): void => {
    setState((prevState) => ({
      ...prevState,
      filters,
      page: 0,
      rowsPerPage: 10,
    }));
  }, []);

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, page: number): void => {
      setState((prevState) => ({
        ...prevState,
        page,
      }));
    },
    [],
  );

  const handleRowsPerPageChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  }, []);

  return {
    handleFiltersChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

const useLogStore = (searchState: SearchState) => {
  const { data, refetch, isLoading, isFetching } = trpc.log.list.useQuery(
    {
      rowsPerPage: searchState.rowsPerPage,
      page: searchState.page,
      from: searchState.filters.startDate,
      to: searchState.filters.endDate,
      staffIds: searchState.filters.staffIds?.includes('all') ? null : searchState.filters.staffIds,
    },
    {
      keepPreviousData: true,
    }
  );

  const flatData = useMemo(() => {
    const items = data?.items;
    return (items || []) as (Log & { staff: User; sub_file: SubFile | null; user: User })[];
  }, [data]);

  const count = data?.meta?.totalRowCount ?? 0;

  return {
    items: flatData,
    count,
    refetch,
    isLoading: isLoading || isFetching,
  };
};

export const AccountLogs: FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const [staffIds, setStaffIds] = React.useState<string[]>(['all']);
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: null,
    endDate: null,
  });
  const search = useSearch();
  const logsStore = useLogStore(search.state);
  const staffStore = useStaffsStore();

  const popover = usePopover<HTMLDivElement>();

  const handleChange = (event: SelectChangeEvent<typeof staffIds>) => {
    const {
      target: { value },
    } = event;
    if (value.includes('all') && !staffIds.includes('all')) {
      setStaffIds(['all']);
      search.handleFiltersChange({
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        staffIds: null,
      });
      return;
    }

    const newStaffIds = // On autofill we get a stringified value.
      (typeof value === 'string' ? value.split(',') : value).filter((opt) => opt !== 'all');
    setStaffIds(newStaffIds);
    search.handleFiltersChange({
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
      staffIds: newStaffIds,
    });
  };

  const handleDelete = (name: string) => {
    setStaffIds((current) => current.filter((item) => item !== name));
  };

  const handleStartDateChange = (date: Date | null) => {
    setDateFilter((prevState) => ({
      ...prevState,
      startDate: date,
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setDateFilter((prevState) => ({
      ...prevState,
      endDate: date,
    }));
  };

  const handleConfirmDateFilter = useCallback(() => {
    popover.handleClose();
    search.handleFiltersChange({
      ...dateFilter,
      staffIds,
    });
  }, [dateFilter, staffIds]);

  const handleSelectRow = (log: Log & { sub_file: SubFile | null }) => {
    if (log.action === LogAction.DELETE) {
      router.push(`/dashboard/account?tab=team&staffId=${log.staff_id}`);
      return;
    }

    if (log.chart_id) {
      router.push(`/dashboard/customers/${log.user_id}?tab=profile&chartId=${log.chart_id}`);
      return;
    }

    if (log.consultation_id) {
      router.push(`/dashboard/consultations?id=${log.consultation_id}`);
      return;
    }

    if (log.file_id) {
      router.push(`/dashboard/customers/${log.user_id}?tab=files&id=${log.file_id}`);
      return;
    }

    if (log.sub_file) {
      router.push(
        `/dashboard/customers/${log.user_id}?tab=files&folderId=${log.sub_file.file_id}&id=${log.sub_file.id}`,
      );
      return;
    }

    router.push(`/dashboard/customers/${log.user_id}?tab=profile`);
  };

  return (
    <>
      <Stack spacing={4}>
        <Card>
          <CardHeader title={'Event Logs'} />
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                justifyContent={'space-between'}
                spacing={2}
              >
                <Stack
                  direction={'row'}
                  spacing={2}
                  alignItems={'center'}
                >
                  <Typography
                    variant={'subtitle1'}
                    color={'text.secondary'}
                    sx={{
                      width: { xs: 130, lg: 'auto' },
                    }}
                  >
                    User
                  </Typography>
                  <FormControl
                    fullWidth
                    sx={{ width: { lg: 600, xs: '100%' } }}
                  >
                    <Select
                      multiple
                      value={staffIds}
                      onChange={handleChange}
                      input={<OutlinedInput />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={
                                value !== 'all'
                                  ? getUserFullName(
                                    staffStore.staffs.find((staff) => staff.id === value),
                                  )
                                  : 'All Staff'
                              }
                              onDelete={() => handleDelete(value)}
                              onMouseDown={(event) => {
                                event.stopPropagation();
                              }}
                            />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      <MenuItem
                        value={'all'}
                        style={getStyles('all', staffIds, theme)}
                      >
                        All Staff
                      </MenuItem>
                      {staffStore.staffs?.map((staff) => (
                        <MenuItem
                          key={staff.id}
                          value={staff.id}
                          style={getStyles(staff.id, staffIds, theme)}
                        >
                          {getUserFullName(staff)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <Stack
                  alignItems={'center'}
                  direction={'row'}
                  spacing={2}
                >
                  <Typography
                    variant={'subtitle1'}
                    color={'text.secondary'}
                    sx={{
                      width: { xs: 130, lg: 160 },
                    }}
                  >
                    see activity of
                  </Typography>

                  <TextField
                    ref={popover.anchorRef}
                    value={
                      search.state.filters.startDate && search.state.filters.endDate
                        ? `${dayjs(search.state.filters.startDate).format(
                          'MMM D, YYYY',
                        )} to ${dayjs(search.state.filters.endDate).format('MMM D, YYYY')}`
                        : 'Select date range'
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {search.state.filters.startDate && search.state.filters.endDate && (
                            <Button
                              onClick={(event) => {
                                event.stopPropagation();
                                setDateFilter({
                                  startDate: null,
                                  endDate: null,
                                });
                                search.handleFiltersChange({
                                  startDate: null,
                                  endDate: null,
                                  staffIds,
                                });
                              }}
                              color={'primary'}
                              onMouseDown={(event) => {
                                event.stopPropagation();
                              }}
                            >
                              Clear
                            </Button>
                          )}
                          <IconButton onClick={popover.handleOpen}>
                            <SvgIcon>
                              <ChevronDownIcon />
                            </SvgIcon>
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      color: 'inherit',
                    }}
                    variant="outlined"
                    fullWidth
                    onClick={popover.handleOpen}
                  />
                </Stack>
              </Stack>

              <AccountLogsListTable
                count={logsStore.count}
                items={logsStore.items}
                onPageChange={search.handlePageChange}
                onRowsPerPageChange={search.handleRowsPerPageChange}
                onSelect={handleSelectRow}
                page={search.state.page}
                rowsPerPage={search.state.rowsPerPage}
                isLoading={logsStore.isLoading}
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Menu
        id="actions-menu"
        anchorEl={popover.anchorRef.current}
        open={popover.open}
        onClose={popover.handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
      >
        <Stack spacing={2} sx={{ p: 2, width: popover.anchorRef.current?.clientWidth }}>
          <DatePicker
            format="yyyy-MM-dd"
            label="From"
            onChange={handleStartDateChange}
            value={dateFilter.startDate || null}
          />
          <DatePicker
            format="yyyy-MM-dd"
            label="To"
            onChange={handleEndDateChange}
            value={dateFilter.endDate || null}
          />
          <Button
            variant={'contained'}
            onClick={handleConfirmDateFilter}
          >
            OK
          </Button>
        </Stack>
      </Menu>
    </>
  );
};
