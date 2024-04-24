import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import { Controller } from 'react-hook-form';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';

type AddressFormProps = {
  handleSubmit: any;
  onSubmit: any;
  register: any;
  errors: any;
  onCancel: any;
  isSubmitting: any;
  isBilling?: boolean;
  control?: any;
  includeBillingEmail?: boolean;
};

export default function AddressForm(props: AddressFormProps) {
  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <Grid
        container
        spacing={2}
      >
        {props.isBilling && (
          <>
            <Grid
              xs={12}
              sx={{ mx: 2 }}
            >
              <TextField
                fullWidth
                label="Billing Name*"
                {...props.register('bill_name')}
                error={!!props.errors.bill_name}
                helperText={props.errors.bill_name?.message}
              />
            </Grid>
            {props.includeBillingEmail && (
              <Grid
                xs={12}
                sx={{ mx: 2 }}
              >
                <TextField
                  fullWidth
                  label="Billing Email*"
                  {...props.register('bill_email')}
                  error={!!props.errors.bill_name}
                  helperText={props.errors.bill_email?.message}
                />
              </Grid>
            )}
          </>
        )}

        <Grid
          xs={12}
          sx={{ mx: 2 }}
        >
          <TextField
            fullWidth
            label="Address Line 1*"
            {...props.register('address_line1')}
            error={!!props.errors.address_line1}
            helperText={props.errors.address_line1?.message}
          />
        </Grid>
        <Grid
          xs={12}
          sx={{ mx: 2 }}
        >
          <TextField
            fullWidth
            label="Address Line 2"
            {...props.register('address_line2')}
          />
        </Grid>

        <Grid
          xs={12}
          sx={{ mx: 2 }}
        >
          <TextField
            fullWidth
            label="City*"
            {...props.register('city')}
            error={!!props.errors.city}
            helperText={props.errors.city?.message}
          />
        </Grid>

        <Grid
          xs={12}
          sx={{ mx: 2 }}
        >
          <TextField
            fullWidth
            label="State*"
            {...props.register('state')}
            error={!!props.errors.state}
            helperText={props.errors.state?.message}
          />
        </Grid>

        <Grid
          xs={12}
          sx={{ mx: 2 }}
        >
          <TextField
            fullWidth
            label="Zip / Postal Code*"
            {...props.register('postal_code')}
            error={!!props.errors.postal_code}
            helperText={props.errors.postal_code?.message}
          />
        </Grid>

        <Grid
          xs={12}
          sx={{ mx: 2 }}
        >
          <Controller
            control={props.control}
            name="country"
            defaultValue={'US'}
            render={({ field }) => {
              return (
                <TextField
                  aria-describedby="component-error-text"
                  variant={'outlined'}
                  select
                  value={field.value}
                  onChange={field.onChange}
                  fullWidth
                  label="Country*"
                  error={!!props.errors.country}
                  helperText={props.errors.country?.message}
                >
                  {['CA', 'MX', 'US'].map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }}
          />
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
              onClick={props.onCancel}
              variant={'outlined'}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              variant="contained"
              type={'submit'}
              disabled={props.isSubmitting}
            >
              Save
              {props.isSubmitting && (
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
  );
}
