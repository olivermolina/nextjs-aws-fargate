import type { ChangeEvent, FC, FormEvent } from 'react';
import { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Scrollbar } from 'src/components/scrollbar';
import { InvoiceStatus, User } from '@prisma/client';
import UserAutocomplete, { AutoCompleteUser } from 'src/components/user-autocomplete';

export interface Filters {
  query?: string;
  startDate?: Date;
  endDate?: Date;
  customers?: User[];
  status?: InvoiceStatus;
}

interface InvoiceListSidebarProps {
  container?: HTMLDivElement | null;
  filters?: Filters;
  group?: boolean;
  onClose?: () => void;
  onFiltersChange?: (filters: Filters) => void;
  onGroupChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  open?: boolean;
  customers: User[];
}

export const InvoiceListSidebar: FC<InvoiceListSidebarProps> = (props) => {
  const {
    container,
    filters = {},
    group,
    onClose,
    onFiltersChange,
    onGroupChange,
    open,
    customers,
    ...other
  } = props;
  const queryRef = useRef<HTMLInputElement | null>(null);
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const handleQueryChange = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      onFiltersChange?.({
        ...filters,
        query: queryRef.current?.value || '',
      });
    },
    [filters, onFiltersChange],
  );

  const handleStartDateChange = useCallback(
    (date: Date | null): void => {
      const newFilters: Filters = {
        ...filters,
        startDate: date || undefined,
      };

      // Prevent end date to be before start date
      if (newFilters.endDate && date && date > newFilters.endDate) {
        newFilters.endDate = date;
      }

      onFiltersChange?.(newFilters);
    },
    [filters, onFiltersChange],
  );

  const handleEndDateChange = useCallback(
    (date: Date | null): void => {
      const newFilters: Filters = {
        ...filters,
        endDate: date || undefined,
      };

      // Prevent start date to be after end date
      if (newFilters.startDate && date && date < newFilters.startDate) {
        newFilters.startDate = date;
      }

      onFiltersChange?.(newFilters);
    },
    [filters, onFiltersChange],
  );

  const handleCustomerToggle = useCallback(
    (customers: AutoCompleteUser[]): void => {
      onFiltersChange?.({
        ...filters,
        customers: customers as User[],
      });
    },
    [filters, onFiltersChange],
  );

  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      onFiltersChange?.({
        ...filters,
        status: event.target.checked ? InvoiceStatus.PAID : undefined,
      });
    },
    [filters, onFiltersChange],
  );

  const content = (
    <div>
      <Stack
        alignItems="center"
        justifyContent="space-between"
        direction="row"
        sx={{ p: 3 }}
      >
        <Typography variant="h5">Filters</Typography>
        {!lgUp && (
          <IconButton onClick={onClose}>
            <SvgIcon>
              <XIcon />
            </SvgIcon>
          </IconButton>
        )}
      </Stack>
      <Stack
        spacing={3}
        sx={{ p: 3 }}
      >
        <form onSubmit={handleQueryChange}>
          <OutlinedInput
            defaultValue=""
            fullWidth
            inputProps={{ ref: queryRef }}
            placeholder="Invoice number"
            startAdornment={
              <InputAdornment position="start">
                <SvgIcon>
                  <SearchMdIcon />
                </SvgIcon>
              </InputAdornment>
            }
          />
        </form>
        <div>
          <FormLabel
            sx={{
              display: 'block',
              mb: 2,
            }}
          >
            Issue date
          </FormLabel>
          <Stack spacing={2}>
            <DatePicker
              format="dd/MM/yyyy"
              label="From"
              onChange={handleStartDateChange}
              value={filters.startDate || null}
            />
            <DatePicker
              format="dd/MM/yyyy"
              label="To"
              onChange={handleEndDateChange}
              value={filters.endDate || null}
            />
          </Stack>
        </div>
        <div>
          <FormLabel
            sx={{
              display: 'block',
              mb: 2,
            }}
          >
            From customer
          </FormLabel>
          <Box
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
              borderColor: 'divider',
              borderRadius: 1,
              borderStyle: 'solid',
              borderWidth: 1,
            }}
          >
            <Scrollbar sx={{ maxHeight: 200 }}>
              <UserAutocomplete
                error={false}
                helperText=""
                onChange={handleCustomerToggle}
                options={customers}
                selectedOptions={filters.customers}
                label={'Customer'}
                showAvatarColor={false}
                size={'medium'}
                variant={'outlined'}
              />
            </Scrollbar>
          </Box>
        </div>
        <FormControlLabel
          control={
            <Switch
              checked={filters.status === InvoiceStatus.PAID}
              onChange={handleStatusChange}
            />
          }
          label="Paid only"
        />
        <FormControlLabel
          control={
            <Switch
              checked={group}
              onChange={onGroupChange}
            />
          }
          label="Group by status"
        />
      </Stack>
    </div>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open={open}
        PaperProps={{
          elevation: 16,
          sx: {
            border: 'none',
            borderRadius: 2.5,
            overflow: 'hidden',
            position: 'relative',
            width: 380,
          },
        }}
        SlideProps={{ container }}
        variant="persistent"
        sx={{ p: 3 }}
        {...other}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      hideBackdrop
      ModalProps={{
        container,
        sx: {
          pointerEvents: 'none',
          position: 'absolute',
        },
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          maxWidth: '100%',
          width: 380,
          pointerEvents: 'auto',
          position: 'absolute',
        },
      }}
      SlideProps={{ container }}
      variant="temporary"
      {...other}
    >
      {content}
    </Drawer>
  );
};

InvoiceListSidebar.propTypes = {
  container: PropTypes.any,
  // @ts-ignore
  filters: PropTypes.object,
  group: PropTypes.bool,
  onClose: PropTypes.func,
  onFiltersChange: PropTypes.func,
  onGroupChange: PropTypes.func,
  open: PropTypes.bool,
};
