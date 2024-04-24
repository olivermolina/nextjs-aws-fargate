import type { FC } from 'react';
import { FormEvent, useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { MultiSelect } from 'src/components/multi-select';
import { useUpdateEffect } from 'src/hooks/use-update-effect';

interface Filters {
  name?: string;
  category: string[];
  status: string[];
  inStock?: boolean;
}

interface SearchChip {
  label: string;
  field: 'name' | 'category' | 'status' | 'inStock';
  value: unknown;
  displayValue?: unknown;
}

interface Option {
  label: string;
  value: string;
}

const categoryOptions: Option[] = [
  {
    label: 'Healthcare',
    value: 'healthcare',
  },
  {
    label: 'Makeup',
    value: 'makeup',
  },
  {
    label: 'Dress',
    value: 'dress',
  },
  {
    label: 'Skincare',
    value: 'skincare',
  },
  {
    label: 'Jewelry',
    value: 'jewelry',
  },
  {
    label: 'Blouse',
    value: 'blouse',
  },
];

const statusOptions: Option[] = [
  {
    label: 'Published',
    value: 'published',
  },
  {
    label: 'Draft',
    value: 'draft',
  },
];

const stockOptions: Option[] = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Available',
    value: 'available',
  },
  {
    label: 'Out of Stock',
    value: 'outOfStock',
  },
];

interface ProductListSearchProps {
  onFiltersChange?: (filters: Filters) => void;
}

export const ProductListSearch: FC<ProductListSearchProps> = (props) => {
  const { onFiltersChange, ...other } = props;
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [chips, setChips] = useState<SearchChip[]>([]);

  const handleChipsUpdate = useCallback(() => {
    const filters: Filters = {
      name: undefined,
      category: [],
      status: [],
      inStock: undefined,
    };

    chips.forEach((chip) => {
      switch (chip.field) {
        case 'name':
          // There will (or should) be only one chips with field "name"
          // so we can set up it directly
          filters.name = chip.value as string;
          break;
        case 'category':
          filters.category.push(chip.value as string);
          break;
        case 'status':
          filters.status.push(chip.value as string);
          break;
        case 'inStock':
          // The value can be "available" or "outOfStock" and we transform it to a boolean
          filters.inStock = chip.value === 'available';
          break;
        default:
          break;
      }
    });

    onFiltersChange?.(filters);
  }, [chips, onFiltersChange]);

  useUpdateEffect(() => {
    handleChipsUpdate();
  }, [chips, handleChipsUpdate]);

  const handleChipDelete = useCallback((deletedChip: SearchChip): void => {
    setChips((prevChips) => {
      return prevChips.filter((chip) => {
        // There can exist multiple chips for the same field.
        // Filter them by value.

        return !(deletedChip.field === chip.field && deletedChip.value === chip.value);
      });
    });
  }, []);

  const handleQueryChange = useCallback((event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const value = queryRef.current?.value || '';

    setChips((prevChips) => {
      const found = prevChips.find((chip) => chip.field === 'name');

      if (found && value) {
        return prevChips.map((chip) => {
          if (chip.field === 'name') {
            return {
              ...chip,
              value: queryRef.current?.value || '',
            };
          }

          return chip;
        });
      }

      if (found && !value) {
        return prevChips.filter((chip) => chip.field !== 'name');
      }

      if (!found && value) {
        const chip: SearchChip = {
          label: 'Name',
          field: 'name',
          value,
        };

        return [...prevChips, chip];
      }

      return prevChips;
    });

    if (queryRef.current) {
      queryRef.current.value = '';
    }
  }, []);

  const handleCategoryChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== 'category') {
          return true;
        }

        const found = values.includes(chip.value as string);

        if (found) {
          valuesFound.push(chip.value as string);
        }

        return found;
      });

      // Nothing changed
      if (values.length === valuesFound.length) {
        return newChips;
      }

      values.forEach((value) => {
        if (!valuesFound.includes(value)) {
          const option = categoryOptions.find((option) => option.value === value);

          newChips.push({
            label: 'Category',
            field: 'category',
            value,
            displayValue: option!.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleStatusChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== 'status') {
          return true;
        }

        const found = values.includes(chip.value as string);

        if (found) {
          valuesFound.push(chip.value as string);
        }

        return found;
      });

      // Nothing changed
      if (values.length === valuesFound.length) {
        return newChips;
      }

      values.forEach((value) => {
        if (!valuesFound.includes(value)) {
          const option = statusOptions.find((option) => option.value === value);

          newChips.push({
            label: 'Status',
            field: 'status',
            value,
            displayValue: option!.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleStockChange = useCallback((values: string[]): void => {
    // Stock can only have one value, even if displayed as multi-select, so we select the first one.
    // This example allows you to select one value or "All", which is not included in the
    // rest of multi-selects.

    setChips((prevChips) => {
      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => chip.field !== 'inStock');
      const latestValue = values[values.length - 1];

      switch (latestValue) {
        case 'available':
          newChips.push({
            label: 'Stock',
            field: 'inStock',
            value: 'available',
            displayValue: 'Available',
          });
          break;
        case 'outOfStock':
          newChips.push({
            label: 'Stock',
            field: 'inStock',
            value: 'outOfStock',
            displayValue: 'Out of Stock',
          });
          break;
        default:
          // Should be "all", so we do not add this filter
          break;
      }

      return newChips;
    });
  }, []);

  // We memoize this part to prevent re-render issues
  const categoryValues = useMemo(
    () => chips.filter((chip) => chip.field === 'category').map((chip) => chip.value) as string[],
    [chips]
  );

  const statusValues = useMemo(
    () => chips.filter((chip) => chip.field === 'status').map((chip) => chip.value) as string[],
    [chips]
  );

  const stockValues = useMemo(() => {
    const values = chips
      .filter((chip) => chip.field === 'inStock')
      .map((chip) => chip.value) as string[];

    // Since we do not display the "all" as chip, we add it to the multi-select as a selected value
    if (values.length === 0) {
      values.unshift('all');
    }

    return values;
  }, [chips]);

  const showChips = chips.length > 0;

  return (
    <div {...other}>
      <Stack
        alignItems="center"
        component="form"
        direction="row"
        onSubmit={handleQueryChange}
        spacing={2}
        sx={{ p: 2 }}
      >
        <SvgIcon>
          <SearchMdIcon />
        </SvgIcon>
        <Input
          defaultValue=""
          disableUnderline
          fullWidth
          inputProps={{ ref: queryRef }}
          placeholder="Search by product name"
          sx={{ flexGrow: 1 }}
        />
      </Stack>
      <Divider />
      {showChips ? (
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          gap={1}
          sx={{ p: 2 }}
        >
          {chips.map((chip, index) => (
            <Chip
              key={index}
              label={
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    '& span': {
                      fontWeight: 600,
                    },
                  }}
                >
                  <>
                    <span>{chip.label}</span>: {chip.displayValue || chip.value}
                  </>
                </Box>
              }
              onDelete={(): void => handleChipDelete(chip)}
              variant="outlined"
            />
          ))}
        </Stack>
      ) : (
        <Box sx={{ p: 2.5 }}>
          <Typography
            color="text.secondary"
            variant="subtitle2"
          >
            No filters applied
          </Typography>
        </Box>
      )}
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        spacing={1}
        sx={{ p: 1 }}
      >
        <MultiSelect
          label="Category"
          onChange={handleCategoryChange}
          options={categoryOptions}
          value={categoryValues}
        />
        <MultiSelect
          label="Status"
          onChange={handleStatusChange}
          options={statusOptions}
          value={statusValues}
        />
        <MultiSelect
          label="Stock"
          onChange={handleStockChange}
          options={stockOptions}
          value={stockValues}
        />
      </Stack>
    </div>
  );
};

ProductListSearch.propTypes = {
  onFiltersChange: PropTypes.func,
};
