import * as React from 'react';
import { FC, useState } from 'react';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { MultiSelect } from 'src/components/multi-select';
import { professionOptions, sharedOptions } from '../../../constants/template-options';
import { SearchChip } from '../../../app/dashboard/templates/page';
import useDebounce from '../../../hooks/use-debounce';

interface TemplateListSearchProps {
  chips: SearchChip[];
  handleChipsChange: (newValues: string[], field: 'tags' | 'shared' | 'profession') => void;
  handleRemoveChip: (chip: SearchChip) => void;
  handleClearChips: () => void;
  tagValues: string[];
  sharedValues: string[];
  professionValues: string[];
  handleQueryChange: (query: string) => void;
  tags: string[];
}

export const TemplateListSearch: FC<TemplateListSearchProps> = (props) => {
  const {
    chips,
    handleChipsChange,
    handleRemoveChip,
    handleClearChips,
    tagValues,
    sharedValues,
    professionValues,
    tags,
  } = props;
  const showChips = chips.length > 0;

  const [searchKey, setSearchKey] = useState('');

  const debouncedSearch = useDebounce<string>(searchKey, 100);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchKey(value);
  };

  React.useEffect(() => {
    props.handleQueryChange(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <Card {...props}>
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
        sx={{ p: 2 }}
      >
        <SvgIcon>
          <SearchMdIcon />
        </SvgIcon>
        <Box sx={{ flexGrow: 1 }}>
          <Input
            disableUnderline
            fullWidth
            placeholder="Enter a keyword"
            onChange={handleInputChange}
            value={searchKey}
          />
        </Box>
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
                    <span style={{ textTransform: 'capitalize' }}>{chip.label}</span>:{' '}
                    {chip.displayValue || chip.value}
                  </>
                </Box>
              }
              onDelete={() => handleRemoveChip(chip)}
              variant="outlined"
            />
          ))}
          {chips.length > 0 && (
            <Chip
              color={'primary'}
              label={'Clear'}
              onClick={handleClearChips}
              variant="outlined"
            />
          )}
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
        spacing={2}
        sx={{ p: 1 }}
      >
        <MultiSelect
          label="Tags"
          options={tags.map((tag) => ({ label: tag, value: tag }))}
          value={tagValues}
          onChange={(newValues: string[]) => handleChipsChange(newValues, 'tags')}
        />
        <MultiSelect
          label="Shared"
          options={sharedOptions}
          value={sharedValues}
          onChange={(newValues: string[]) => handleChipsChange(newValues, 'shared')}
        />
        <MultiSelect
          label="Profession"
          options={professionOptions}
          value={professionValues}
          onChange={(newValues: string[]) => handleChipsChange(newValues, 'profession')}
        />
        <Box sx={{ flexGrow: 1 }} />
      </Stack>
    </Card>
  );
};
