import React, { FC } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import { getUserFullName } from '../utils/get-user-full-name';
import TextField from '@mui/material/TextField';
import { CalendarPatient, CalendarStaff } from '../types/calendar';
import Chip from '@mui/material/Chip';
import { User } from '@prisma/client';
import UserAvatar from './user-avatar';

const filterOptions = createFilterOptions({
  matchFrom: 'start',
  stringify: (option: CalendarPatient | CalendarStaff) => getUserFullName(option),
});

export type AutoCompleteUser = Pick<
  User,
  'id' | 'first_name' | 'last_name' | 'email' | 'avatar' | 'avatar_color' | 'organization_id'
>;

interface Props {
  options: AutoCompleteUser[];
  selectedOptions?: AutoCompleteUser[];
  onChange: (value: AutoCompleteUser[]) => void;
  error?: boolean;
  helperText?: string;
  handleBlur?: () => void;
  label: string;
  name?: string;
  showAvatarColor: boolean;
  size: 'medium' | 'small';
  variant: 'standard' | 'outlined' | 'filled';
  max?: number;
}

const UserAutocomplete: FC<Props> = ({
  options,
  selectedOptions,
  onChange,
  error,
  handleBlur,
  helperText,
  label = 'User',
  name = 'user',
  size = 'medium',
  variant = 'outlined',
}) => {
  return (
    <Autocomplete
      size={size}
      filterSelectedOptions
      options={options.filter(
        (user) => !selectedOptions?.map((assignedUser) => assignedUser.id).includes(user.id)
      )}
      onChange={(e, value) => {
        onChange(value as User[]);
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={(props: any, option) => (
        <Box {...props}>
          <UserAvatar
            userId={option.id}
            height={42}
            width={42}
            includeFullName={true}
            justifyContent={'flex-start'}
          />
        </Box>
      )}
      value={selectedOptions}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return '';
        }
        return getUserFullName(option);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          error={error}
          fullWidth
          helperText={helperText}
          label={label}
          name={name}
          onBlur={handleBlur}
          size={size}
          variant={variant}
        />
      )}
      filterOptions={filterOptions}
      multiple
      renderTags={(value: readonly CalendarPatient[], getTagProps) =>
        value.map((option: CalendarPatient, index: number) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            variant="outlined"
            label={getUserFullName(option)}
          />
        ))
      }
      freeSolo
    />
  );
};

export default UserAutocomplete;
