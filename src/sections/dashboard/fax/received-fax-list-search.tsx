import type { FC } from 'react';
import * as React from 'react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import dayjs from 'dayjs';
import { usePopover } from '../../../hooks/use-popover';
import Menu from '@mui/material/Menu';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

interface Filters {
  from?: Date;
  to?: Date;
}

interface ReceivedFaxListSearchProps {
  onFiltersChange?: (filters: Filters) => void;
}

export const ReceivedFaxListSearch: FC<ReceivedFaxListSearchProps> = (props) => {
  const [filters, setFilters] = useState<Filters>({
    from: dayjs().startOf('month').toDate(),
    to: dayjs().endOf('month').toDate(),
  });

  const popover = usePopover<HTMLDivElement>();

  const handleDateChangeConfirm = () => {
    popover.handleClose();
    props.onFiltersChange?.(filters);
  };

  const handleStartDateChange = (date: Date | null) => {
    setFilters((prevState) => ({
      ...prevState,
      from: date || dayjs().startOf('month').toDate(),
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setFilters((prevState) => ({
      ...prevState,
      to: date || dayjs().endOf('month').toDate(),
    }));
  };

  return (
    <>
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        sx={{ p: 2 }}
        spacing={1}
      >
        <TextField
          ref={popover.anchorRef}
          value={
            filters.from && filters.to
              ? `${dayjs(filters.to).format('MMM D, YYYY')} to ${dayjs(filters.from).format(
                'MMM D, YYYY',
              )}`
              : 'Select date range'
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
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
          onClick={popover.handleOpen}
          label={'Date Range'}
        />
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
        <Stack
          spacing={2}
          sx={{ p: 2, width: popover.anchorRef.current?.clientWidth }}
        >
          <DatePicker
            format="yyyy-MM-dd"
            label="From"
            onChange={handleStartDateChange}
            value={filters.from || null}
          />
          <DatePicker
            format="yyyy-MM-dd"
            label="To"
            onChange={handleEndDateChange}
            value={filters.to || null}
          />
          <Button
            variant={'contained'}
            onClick={handleDateChangeConfirm}
          >
            OK
          </Button>
        </Stack>
      </Menu>
    </>
  );
};

ReceivedFaxListSearch.propTypes = {
  onFiltersChange: PropTypes.func,
};
