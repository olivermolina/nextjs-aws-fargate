import * as React from 'react';
import { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { useUpdateEffect } from 'src/hooks/use-update-effect';
import { Location, Prisma, Status, User } from '@prisma/client';
import { useUpdateSearchParams } from '../../../hooks/use-update-search-params';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Menu from '@mui/material/Menu';
import { MenuItem } from '@mui/material';
import { usePopover } from '../../../hooks/use-popover';
import dayjs from 'dayjs';
import { MultiSelect } from '../../../components/multi-select';
import { getUserFullName } from '../../../utils/get-user-full-name';
import VideocamIcon from '@mui/icons-material/Videocam';
import { grey } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';


interface Filters {
  query?: string;
  status?: StateValue;
  startDate?: Date | null;
  endDate?: Date | null;
  staff_ids?: string[];
  locationId?: string;
}

export type StateValue = 'all' | 'canceled' | 'complete' | 'pending';

interface StateOption {
  label: string;
  value: StateValue;
}

const sateOptions: StateOption[] = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Canceled',
    value: 'canceled',
  },
  {
    label: 'Completed',
    value: 'complete',
  },
  {
    label: 'Pending',
    value: 'pending',
  },
];

type SortDir = Prisma.SortOrder;

interface SortOption {
  label: string;
  value: SortDir;
}

const sortOptions: SortOption[] = [
  {
    label: 'Newest',
    value: Prisma.SortOrder.desc,
  },
  {
    label: 'Oldest',
    value: Prisma.SortOrder.asc,
  },
];

export const StatusMap: Record<StateValue, Status | undefined> = {
  all: undefined,
  canceled: Status.CANCELED,
  complete: Status.COMPLETED,
  pending: Status.PENDING,
};

interface ConsultationListSearchProps {
  onFiltersChange?: (filters: Filters) => void;
  onSortChange?: (sort: SortDir) => void;
  sortBy?: string;
  sortDir?: Prisma.SortOrder;
  staffs?: User[];
  isPatientView?: boolean;
  locations?: Location[];
}

export const ConsultationListSearch: FC<ConsultationListSearchProps> = (props) => {
  const {
    onFiltersChange,
    onSortChange,
    sortDir = 'asc',
    staffs,
    isPatientView,
    locations,
  } = props;
  const popover = usePopover<HTMLButtonElement>();
  const [filters, setFilters] = useState<Filters>({
    query: undefined,
    status: 'all',
  });
  const { removeSearchParams } = useUpdateSearchParams();

  const handleFiltersUpdate = useCallback(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  useUpdateEffect(() => {
    handleFiltersUpdate();
  }, [filters, handleFiltersUpdate]);

  useUpdateEffect(() => {
    setFilters((prevState) => ({
      ...prevState,
      staff_ids: ['all', ...(staffs?.map((staff) => staff.id) || [])],
    }));
  }, [staffs]);

  const handleStateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const state = event.target.value as StateValue;
      setFilters((prevState) => ({
        ...prevState,
        status: state,
        id: undefined,
      }));
      removeSearchParams('id');
    },
    [onSortChange],
  );

  const handleLocationChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const state = event.target.value as string;
      setFilters((prevState) => ({
        ...prevState,
        locationId: state,
        id: undefined,
      }));
      removeSearchParams('id');
    },
    [onSortChange],
  );

  const handleSortChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const sortDir = event.target.value as SortDir;
      onSortChange?.(sortDir);
    },
    [onSortChange]
  );

  const handleCustomDateChangeConfirm = () => {
    popover.handleClose();
    setFilters((prevState) => ({
      ...prevState,
      id: undefined,
    }));
  };

  const handleStartDateChange = (date: Date | null) => {
    setFilters((prevState) => ({
      ...prevState,
      startDate: date,
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setFilters((prevState) => ({
      ...prevState,
      endDate: date,
    }));
  };

  const handleAssignedChange = (value: string[]) => {
    setFilters((prevState) => ({
      ...prevState,
      staff_ids: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      query: undefined,
      status: 'all',
      startDate: null,
      endDate: null,
      staff_ids: ['all', ...(staffs?.map((staff) => staff.id) || [])],
      locationId: 'all',
    });
  };

  const assignedStaffLabel = useMemo(() => {
    const assingedStaffs = filters.staff_ids?.filter((id) => id !== 'all');

    if (assingedStaffs?.length === staffs?.length) {
      return 'All Staff Members';
    }

    if (!assingedStaffs || assingedStaffs?.length === 0) {
      return 'Staff Members';
    }

    return `${assingedStaffs?.length} Staff Members`;
  }, [filters.staff_ids]);

  return (
    <div>
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        justifyContent={'flex-end'}
        gap={3}
        sx={{ p: 3 }}
      >
        <Button onClick={handleResetFilters}>Clear Filters</Button>

        <TextField
          label="Appointment Type"
          select
          onChange={handleLocationChange}
          value={filters.locationId ?? 'all'}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value={'all'}>All</MenuItem>
          <MenuItem value={'telemedicine'}>
            <Stack
              direction={'row'}
              spacing={1}
              justifyContent={'flex-start'}
              alignItems={'center'}
            >
              <SvgIcon>
                <VideocamIcon sx={{ color: grey[500] }} />
              </SvgIcon>
              <Typography>Telemedicine</Typography>
            </Stack>
          </MenuItem>
          {locations?.map((location) => (
            <MenuItem
              key={location.id}
              value={location.id}
            >
              <Stack
                direction={'row'}
                spacing={1}
                justifyContent={'flex-start'}
                alignItems={'center'}
              >
                <SvgIcon>
                  <LocationOnIcon sx={{ color: grey[500] }} />
                </SvgIcon>
                <Typography>{location.display_name}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="State"
          select
          onChange={handleStateChange}
          value={filters.status ?? 'all'}
          sx={{ minWidth: 150 }}
        >
          {sateOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Button
          ref={popover.anchorRef}
          endIcon={
            <SvgIcon>
              <ChevronDownIcon />
            </SvgIcon>
          }
          onClick={popover.handleOpen}
          size={'large'}
          color={'inherit'}
          sx={{
            borderColor: '#e4e6ea',
            fontWeight: 'normal',
            height: '57px',
          }}
          variant={'outlined'}
        >
          {filters.endDate && filters.startDate ? (
            <TextField
              label="Date Filter"
              value={`${dayjs(filters.startDate).format('MMM D, YYYY')} to ${dayjs(
                filters.endDate,
              ).format('MMM D, YYYY')}`}
              InputProps={{
                disableUnderline: true,
                style: { border: 'none' },
              }}
              sx={{
                color: 'inherit',
              }}
              variant="standard"
            />
          ) : (
            'Date Filter'
          )}
        </Button>

        {!isPatientView && (
          <MultiSelect
            label={assignedStaffLabel}
            options={
              staffs?.map((staff) => ({ label: getUserFullName(staff), value: staff.id })) || []
            }
            value={filters.staff_ids ? filters.staff_ids : []}
            onChange={handleAssignedChange}
            size={'large'}
            color={'inherit'}
            sx={{
              borderColor: '#e4e6ea',
              fontWeight: 'normal',
              height: '57px',
            }}
            variant={'outlined'}
            selectAllLabel={'Select all'}
          />
        )}

        <TextField
          label="Sort By"
          name="sort"
          onChange={handleSortChange}
          select
          value={sortDir}
        >
          {sortOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
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
        <MenuItem>
          <Stack spacing={2}>
            <DatePicker
              format="yyyy-MM-dd"
              label="From"
              onChange={handleStartDateChange}
              value={filters.startDate || null}
            />
            <DatePicker
              format="yyyy-MM-dd"
              label="To"
              onChange={handleEndDateChange}
              value={filters.endDate || null}
            />
            <Button
              variant={'contained'}
              onClick={handleCustomDateChangeConfirm}
            >
              OK
            </Button>
          </Stack>
        </MenuItem>
      </Menu>
    </div>
  );
};

ConsultationListSearch.propTypes = {
  onFiltersChange: PropTypes.func,
  onSortChange: PropTypes.func,
  sortBy: PropTypes.string,
  sortDir: PropTypes.oneOf<SortDir>(['asc', 'desc']),
};
