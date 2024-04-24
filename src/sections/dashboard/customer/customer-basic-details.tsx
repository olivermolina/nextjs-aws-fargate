import { FC, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';
import dayjs from 'dayjs';
import { useBasicDetails } from 'src/hooks/use-basic-details';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MenuItem from '@mui/material/MenuItem';
import { Gender } from '@prisma/client';
import { Controller } from 'react-hook-form';

interface CustomerBasicDetailsProps {
  title?: string;
  customerId?: string;
  hasEditAccess?: boolean;
  basicDetails: ReturnType<typeof useBasicDetails>;
}

export const CustomerBasicDetails: FC<CustomerBasicDetailsProps> = (props) => {
  const { title = 'Address Details', hasEditAccess, basicDetails } = props;
  const [selectedDate, setSelectedDate] = useState(dayjs());

  useEffect(() => {
    if (basicDetails.user) {
      setSelectedDate(dayjs(basicDetails.user.birthdate));
    }
  }, [basicDetails.user]);

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          hasEditAccess && (
            <Button
              color="inherit"
              size="small"
              onClick={basicDetails.onCancel}
            >
              {basicDetails.edit ? 'Cancel' : 'Edit'}
            </Button>
          )
        }
      />
      {basicDetails.edit ? (
        <form onSubmit={basicDetails.handleSubmit(basicDetails.onSubmit)}>
          <Grid
            container
            spacing={2}
          >
            <Grid
              xs={12}
              sx={{ mx: 2 }}
            >
              <TextField
                fullWidth
                label="First name*"
                {...basicDetails.register('first_name')}
                error={!!basicDetails.errors.first_name}
                helperText={basicDetails.errors.first_name?.message}
              />
            </Grid>

            <Grid
              xs={12}
              sx={{ mx: 2 }}
            >
              <TextField
                fullWidth
                label="Last name*"
                {...basicDetails.register('last_name')}
                error={!!basicDetails.errors.last_name}
                helperText={basicDetails.errors.last_name?.message}
              />
            </Grid>

            <Grid
              xs={12}
              sx={{ mx: 2 }}
            >
              <TextField
                fullWidth
                label="Email"
                {...basicDetails.register('email')}
                disabled
              />
            </Grid>
            <Grid
              xs={12}
              sx={{ mx: 2 }}
            >
              <TextField
                fullWidth
                label="Phone*"
                {...basicDetails.register('phone')}
                error={!!basicDetails.errors.phone}
                helperText={basicDetails.errors.phone?.message}
              />
            </Grid>

            <Grid
              xs={12}
              sx={{ mx: 2 }}
            >
              <Controller
                control={basicDetails.control}
                name="gender"
                defaultValue={Gender.OTHER}
                render={({ field }) => {
                  return (
                    <TextField
                      fullWidth
                      label="Gender"
                      value={field.value}
                      error={!!basicDetails.errors.gender}
                      helperText={basicDetails.errors.gender?.message}
                      select
                      onChange={field.onChange}
                    >
                      <MenuItem
                        value={Gender.OTHER}
                        disabled
                      />
                      <MenuItem value={Gender.MALE}>Male</MenuItem>
                      <MenuItem value={Gender.FEMALE}>Female</MenuItem>
                    </TextField>
                  );
                }}
              />
            </Grid>

            <Grid
              xs={12}
              sx={{ mx: 2 }}
            >
              <FormControl fullWidth>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={selectedDate}
                    label="Birthdate"
                    onChange={(newValue) => {
                      const newDate = newValue ?? dayjs();
                      setSelectedDate(newDate);
                      basicDetails.setValue('birthdate', newDate.toDate());
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>

            <Grid xs={12}>
              <Divider />
              <Stack
                direction={'row'}
                justifyContent={'flex-end'}
                sx={{ p: 2 }}
                spacing={1}
              >
                <Button
                  color="primary"
                  onClick={basicDetails.onCancel}
                  variant={'outlined'}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  type={'submit'}
                  disabled={basicDetails.isSubmitting}
                >
                  Save
                  {basicDetails.isSubmitting && (
                    <CircularProgress
                      sx={{ ml: 1 }}
                      size={20}
                    />
                  )}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      ) : (
        <PropertyList>
          <PropertyListItem
            divider
            label="First name"
            value={basicDetails.user?.first_name || ''}
          />
          <PropertyListItem
            divider
            label="Last name"
            value={basicDetails.user?.last_name || ''}
          />
          <PropertyListItem
            divider
            label="Email"
            value={basicDetails.user?.email || ''}
          />
          <PropertyListItem
            divider
            label="Phone"
            value={basicDetails.user?.phone || ''}
          />
          <PropertyListItem
            divider
            label="Gender"
            value={basicDetails.user?.gender || ''}
          />
          <PropertyListItem
            divider
            label="Birthdate"
            value={dayjs(basicDetails.user?.birthdate).format('YYYY-MM-DD')}
          />
        </PropertyList>
      )}
    </Card>
  );
};
