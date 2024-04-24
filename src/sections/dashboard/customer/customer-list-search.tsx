import type { FC } from 'react';
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';

import { useUpdateEffect } from 'src/hooks/use-update-effect';
import { Prisma } from '@prisma/client';
import useDebounce from 'src/hooks/use-debounce';
import * as React from 'react';

interface Filters {
  query?: string;
  active?: boolean;
  assigned?: boolean;
}

type ActiveTabValue = 'all' | 'active' | 'inactive' | 'assigned';

interface TabOption {
  label: string;
  value: ActiveTabValue;
}

const tabs: TabOption[] = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'Inactive',
    value: 'inactive',
  },
  {
    label: 'My Patients',
    value: 'assigned',
  },
];

type SortValue = 'updated_at|desc' | 'updated_at|asc';

interface SortOption {
  label: string;
  value: SortValue;
}

const sortOptions: SortOption[] = [
  {
    label: 'Last update (newest)',
    value: 'updated_at|desc',
  },
  {
    label: 'Last update (oldest)',
    value: 'updated_at|asc',
  },
];

type SortDir = 'asc' | 'desc';

interface CustomerListSearchProps {
  onFiltersChange?: (filters: Filters) => void;
  onSortChange?: (sort: { sortBy: string; sortDir: SortDir }) => void;
  sortBy?: string;
  sortDir?: Prisma.SortOrder;
}

export const CustomerListSearch: FC<CustomerListSearchProps> = (props) => {
  const { onFiltersChange, onSortChange, sortBy, sortDir } = props;
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [currentTab, setCurrentTab] = useState<ActiveTabValue>('all');
  const [filters, setFilters] = useState<Filters>({});
  const [searchKey, setSearchKey] = useState('');

  const debouncedSearch = useDebounce<string>(searchKey, 100);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchKey(value);
  };

  const handleFiltersUpdate = useCallback(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  useUpdateEffect(() => {
    handleFiltersUpdate();
  }, [filters, handleFiltersUpdate]);

  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: ActiveTabValue): void => {
    setCurrentTab(value);
    setFilters((prevState) => {
      const updatedFilters: Filters = {
        ...prevState,
      };

      switch (value) {
        case 'active':
          updatedFilters.active = true;
          updatedFilters.assigned = false;
          break;
        case 'inactive':
          updatedFilters.active = false;
          updatedFilters.assigned = false;
          break;
        case 'all':
          updatedFilters.active = undefined;
          updatedFilters.assigned = false;
          break;
        case 'assigned':
          updatedFilters.active = undefined;
          updatedFilters.assigned = true;
          break;
      }

      return updatedFilters;
    });
  }, []);

  const handleQueryChange = useCallback((event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFilters((prevState) => ({
      ...prevState,
      query: queryRef.current?.value,
    }));
  }, []);

  const handleSortChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const [sortBy, sortDir] = event.target.value.split('|') as [string, SortDir];

      onSortChange?.({
        sortBy,
        sortDir,
      });
    },
    [onSortChange]
  );

  useEffect(() => {
    setFilters((prevState) => ({
      ...prevState,
      query: debouncedSearch,
    }));
  }, [debouncedSearch]);

  return (
    <>
      <Tabs
        indicatorColor="primary"
        onChange={handleTabsChange}
        scrollButtons="auto"
        sx={{ px: 3 }}
        textColor="primary"
        value={currentTab}
        variant="scrollable"
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.label}
            label={tab.label}
            value={tab.value}
          />
        ))}
      </Tabs>
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        spacing={3}
        sx={{ p: 3 }}
      >
        <Box
          component="form"
          onSubmit={handleQueryChange}
          sx={{ flexGrow: 1 }}
        >
          <OutlinedInput
            defaultValue=""
            fullWidth
            value={searchKey}
            inputProps={{ ref: queryRef }}
            placeholder="Search customers"
            startAdornment={
              <InputAdornment position="start">
                <SvgIcon>
                  <SearchMdIcon />
                </SvgIcon>
              </InputAdornment>
            }
            onChange={handleInputChange}
          />
        </Box>
        <TextField
          label="Sort By"
          name="sort"
          onChange={handleSortChange}
          select
          SelectProps={{ native: true }}
          value={`${sortBy}|${sortDir}`}
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </TextField>
      </Stack>
    </>
  );
};

CustomerListSearch.propTypes = {
  onFiltersChange: PropTypes.func,
  onSortChange: PropTypes.func,
  sortBy: PropTypes.string,
  sortDir: PropTypes.oneOf<SortDir>(['asc', 'desc']),
};
