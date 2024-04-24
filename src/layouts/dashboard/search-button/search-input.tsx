import SvgIcon from '@mui/material/SvgIcon';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import React, { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { Prisma, User, UserType } from '@prisma/client';
import { trpc } from '../../../app/_trpc/client';
import { getUserFullName } from '../../../utils/get-user-full-name';
import debounce from 'lodash.debounce';
import UserAvatar from '../../../components/user-avatar';
import { useRouter } from '../../../hooks/use-router';
import { paths } from '../../../paths';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

export default function SearchInput() {
  const router = useRouter();
  const [value, setValue] = useState<User | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<readonly User[]>([]);

  const { isFetching } = trpc.user.list.useQuery(
    {
      query: inputValue || undefined,
      rowsPerPage: 10,
      type: [UserType.PATIENT],
      sortDir: Prisma.SortOrder.asc,
    },
    {
      onSettled: (data) => {
        if (data) {
          setOptions(data.items);
        }
      },
    }
  );

  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const handleInputChange = debounce((newValue: string) => {
    setInputValue(newValue);
  }, 1000);

  return (
    <Box
      sx={{
        pt: { xs: 1, lg: 2 },
        pl: { xs: 1, lg: 4 },
        height: 50,
        display: 'flex',
        width: '100%',
        maxWidth: 400,
      }}
    >
      <Autocomplete
        size={lgUp ? 'medium' : 'small'}
        loading={isFetching}
        fullWidth
        id="tob-bar-search-patient"
        getOptionLabel={(option) => (typeof option === 'string' ? option : getUserFullName(option))}
        filterOptions={(x) => x}
        options={options}
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={value}
        noOptionsText={inputValue ? 'No records found' : ''}
        onChange={(event: any, newValue: User | null) => {
          setValue(newValue);
          if (!newValue) return;
          router.push(`${paths.dashboard.customers.index}/${newValue?.id}`);
        }}
        onInputChange={(event, newInputValue) => handleInputChange(newInputValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            size={lgUp ? 'medium' : 'small'}
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SvgIcon>
                    <SearchMdIcon />
                  </SvgIcon>
                </InputAdornment>
              ),
            }}
            placeholder={'Search...'}
            variant={'outlined'}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                console.log('Enter key pressed');
                // Handle Enter key press here
                router.push(paths.dashboard.customers.index);
              }
            }}
          />
        )}
        renderOption={(props, option) => {
          const patientName = getUserFullName(option);
          const matches = match(patientName, inputValue);
          const parts = parse(patientName, matches);
          return (
            <li
              {...props}
              key={option.id}
            >
              <Grid
                container
                alignItems="center"
                sx={{ display: 'flex', width: '100%' }}
                spacing={1}
              >
                <Grid item>
                  <UserAvatar
                    userId={option.id}
                    width={25}
                    height={25}
                  />
                </Grid>
                <Grid
                  item
                  sx={{ wordWrap: 'break-word' }}
                >
                  {parts.map((part, index) => (
                    <Box
                      key={index}
                      component="span"
                      sx={{ fontWeight: part.highlight ? 'bold' : 'regular' }}
                    >
                      {part.text}
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </li>
          );
        }}
      />
    </Box>
  );
}
