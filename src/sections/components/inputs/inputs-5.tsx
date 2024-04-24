import React, { FC, useState } from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import dayjs, { Dayjs } from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'; // or '@mui/lab/StaticDatePicker'

interface CategoryOption {
  label: string;
  value: string;
}

const categoryOptions: CategoryOption[] = [
  {
    label: 'Healthcare',
    value: 'healthcare',
  },
  {
    label: 'Makeup',
    value: 'makeup',
  },
  // ... other category options ...
];

//const now = new Date();

const now = dayjs(new Date());

export const Inputs5: FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(now);

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <div>
          <FormControlLabel
            control={<Switch color="primary" />}
            label="Schedule Publish"
          />
        </div>

        {/*}
        <DateTimePicker
          label="Start date test"
          onChange={() => {}}
          value={now}
        />
        <TextField
          defaultValue={categoryOptions[0].value}
          fullWidth
          label="Category"
          name="category"
          select
        >
          {categoryOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
  */}

        <div id="datepickerview">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={3}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                openTo="day"
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                }}
                // renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </LocalizationProvider>
        </div>
      </Stack>
    </Box>
  );
};
