import React, { FC, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import FormHelperText from '@mui/material/FormHelperText';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Gender } from '@prisma/client';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const OnboardPatientValidationSchema = z
  .object({
    id: z.string(),
    first_name: z.string().min(1, { message: 'This is required' }),
    last_name: z.string().min(1, { message: 'This is required' }),
    phone: z.string().min(1, { message: 'This is required' }),
    email: z.string().email({
      message: 'Invalid email. Please enter a valid email address',
    }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    birthdate: z.date(),
    gender: z.nativeEnum(Gender),
    address_line1: z.string().min(1, { message: 'This is required' }),
    address_line2: z.string().optional(),
    city: z.string().min(1, { message: 'This is required' }),
    state: z.string().min(1, { message: 'This is required' }),
    postal_code: z.string().min(1, { message: 'This is required' }),
    country: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // field that the error is attached to
  });

export type OnboardPatientInput = z.infer<typeof OnboardPatientValidationSchema>;

interface OnboardFormProps {
  defaultValues?: OnboardPatientInput;
  onSubmit: (data: OnboardPatientInput) => void;
  isLoading: boolean;
}

export const OnboardForm: FC<OnboardFormProps> = ({ defaultValues, onSubmit, isLoading }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showPassword, setShowPassword] = useState(false);
  const {
    formState: { errors },
    register,
    handleSubmit,
    setValue,
    reset,
    control,
  } = useForm<OnboardPatientInput>({
    resolver: zodResolver(OnboardPatientValidationSchema),
    defaultValues,
  });

  useEffect(() => {
    // Reset form when patient changes
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues]);

  return (
    <Stack
      spacing={2}
      sx={{ p: 2 }}
    >
      <Typography
        sx={{ pb: 3 }}
        variant="h6"
      >
        Fill the form below
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid
          container
          spacing={3}
        >
          <Grid xs={6}>
            <FormControl
              fullWidth
              error={!!errors.first_name}
            >
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                First Name *
              </FormLabel>
              <OutlinedInput {...register('first_name')} />
              <FormHelperText>{errors?.first_name?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={6}>
            <FormControl
              fullWidth
              error={!!errors.last_name}
            >
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Last Name*
              </FormLabel>
              <OutlinedInput {...register('last_name')} />

              <FormHelperText>{errors?.last_name?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={6}>
            <FormControl
              fullWidth
              error={!!errors.phone}
            >
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Phone Number *
              </FormLabel>
              <OutlinedInput
                type="tel"
                {...register('phone')}
              />
              <FormHelperText>{errors?.phone?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={6}>
            <FormControl
              fullWidth
              error={!!errors.email}
            >
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Email *
              </FormLabel>
              <OutlinedInput
                {...register('email')}
                disabled
              />

              <FormHelperText>{errors?.email?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={6}>
            <FormControl
              fullWidth
              error={!!errors.password}
            >
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Password *
              </FormLabel>
              <OutlinedInput
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText>{errors?.password?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={6}>
            <FormControl
              fullWidth
              error={!!errors.confirmPassword}
            >
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Password (Confirm) *
              </FormLabel>
              <OutlinedInput
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText>{errors?.confirmPassword?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={6}>
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Date of birth*
              </FormLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={selectedDate}
                  label="Add date"
                  onChange={(newValue) => {
                    const newDate = newValue ?? dayjs();
                    setSelectedDate(newDate);
                    setValue('birthdate', newDate.toDate());
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </Grid>
          <Grid xs={6}>
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Gender*
              </FormLabel>
              <TextField
                fullWidth
                variant="outlined"
                {...register('gender')}
                select
              >
                <MenuItem
                  value={Gender.OTHER}
                  disabled
                />
                <MenuItem value={Gender.MALE}>Male</MenuItem>
                <MenuItem value={Gender.FEMALE}>Female</MenuItem>
              </TextField>
            </FormControl>
          </Grid>
          <Grid
            xs={12}
            sm={6}
          >
            <FormControl
              fullWidth
              error={!!errors.address_line1}
            >
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Address Line 1*
              </FormLabel>
              <OutlinedInput {...register('address_line1')} />
              <FormHelperText>{errors?.address_line1?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid
            xs={12}
            sm={6}
          >
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Address Line 2
              </FormLabel>
              <OutlinedInput {...register('address_line2')} />
            </FormControl>
          </Grid>

          <Grid xs={6}>
            <FormControl
              fullWidth
              error={!!errors.city}
            >
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                City*
              </FormLabel>
              <OutlinedInput {...register('city')} />

              <FormHelperText>{errors?.city?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={6}>
            <FormControl
              fullWidth
              error={!!errors.state}
            >
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                State*
              </FormLabel>
              <OutlinedInput {...register('state')} />
              <FormHelperText>{errors?.state?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={6}>
            <FormControl
              fullWidth
              error={!!errors.postal_code}
            >
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Postal*
              </FormLabel>
              <OutlinedInput {...register('postal_code')} />

              <FormHelperText>{errors?.postal_code?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid xs={6}>
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Country
              </FormLabel>
              <Controller
                control={control}
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
                      error={!!errors.country}
                      helperText={errors.country?.message}
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
            </FormControl>
          </Grid>
        </Grid>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 3,
          }}
        >
          <Button
            type={'submit'}
            size="large"
            variant="contained"
            disabled={isLoading}
          >
            Next
            {isLoading && (
              <CircularProgress
                sx={{ ml: 1 }}
                size={20}
              />
            )}
          </Button>
        </Box>
      </form>
    </Stack>
  );
};
