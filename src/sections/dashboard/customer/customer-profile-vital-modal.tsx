import React, { FC, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { DialogActions } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Grid from '@mui/material/Unstable_Grid2';
import { trpc } from '../../../app/_trpc/client';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { VitalInput, VitalValidationSchema } from '../../../utils/zod-schemas/vital';
import {
  mapBMIUnit,
  mapHeightCountryUnit,
  mapTemperatureCountryUnit,
  mapWeightCountryUnit,
} from '../../../utils/vitals-utils';
import { useDeleteVitals } from '../../../hooks/use-delete-vitals';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';

interface Props {
  userId: string;
  open: boolean;
  handleClose: () => void;
  defaultValues?: VitalInput;
  handleNew: () => void;
  refetchCurrentVitals?: () => void;
  country?: string | null;
}

export const CustomerProfileVitalModal: FC<Props> = ({
                                                       userId,
                                                       defaultValues,
                                                       refetchCurrentVitals,
                                                       country,
                                                       ...props
                                                     }) => {
  const [selectedOnsetDate, setSelectedOnsetDate] = useState(
    dayjs(defaultValues?.date || new Date()),
  );

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    register,
    setValue,
    reset,
    watch,
    trigger,
  } = useForm<VitalInput>({
    resolver: zodResolver(VitalValidationSchema),
  });

  const onClose = () => {
    props.handleClose();
    refetchCurrentVitals?.();
  };

  const mutation = trpc.vitals.save.useMutation();
  const onSubmit = async (input: VitalInput) => {
    try {
      await mutation.mutateAsync(input);
      await refetchCurrentVitals?.();
      toast.success(input.id === 'new' ? 'New vitals has been added.' : 'Vitals has been updated');
      onClose();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const watchId = watch('id');
  const deleteVitals = useDeleteVitals();

  const submit = async (saveAndAddNew: boolean) => {
    const result = await trigger();
    await handleSubmit(onSubmit)();
    if (!saveAndAddNew || !result) {
      return;
    }

    reset({
      id: 'new',
      user_id: userId,
      date: new Date(),
      height_unit: mapHeightCountryUnit(country),
      weight_unit: mapWeightCountryUnit(country),
      temperature_unit: mapTemperatureCountryUnit(country),
      bmi: undefined,
      height: undefined,
      weight: undefined,
      temperature: undefined,
      systolic: undefined,
      diastolic: undefined,
      respiratory_rate: undefined,
      heart_rate: undefined,
      oxygen_saturation: undefined,
    });
    props.handleNew();
  };

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues]);

  return (
    <Dialog open={props.open}>
      <form>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
          sx={{
            px: 2,
            py: 1,
          }}
        >
          <Typography
            sx={{ flexGrow: 1 }}
            variant="h6"
          >
            {defaultValues?.id === 'new' ? 'Add' : 'Edit'} Patient Vitals
          </Typography>
          <IconButton onClick={onClose}>
            <SvgIcon>
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
        <DialogContent>
          <Grid
            container
            spacing={3}
          >
            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Date
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={selectedOnsetDate}
                  onChange={(newValue) => {
                    const newDate = newValue ?? dayjs();
                    setSelectedOnsetDate(newDate);
                    setValue('date', newDate.toDate());
                  }}
                  slotProps={{ textField: { size: 'small', variant: 'outlined' } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              xs={12}
              md={6}
            >
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Height
              </Typography>
              <TextField
                type="number"
                variant={'outlined'}
                fullWidth
                {...register('height')}
                error={!!errors.height}
                helperText={errors.height?.message}
                inputProps={{
                  min: 0,
                  step: 0.1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>{mapHeightCountryUnit(country)}</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              xs={12}
              md={6}
            >
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Weight
              </Typography>
              <TextField
                type="number"
                variant={'outlined'}
                fullWidth
                {...register('weight')}
                error={!!errors.weight}
                helperText={errors.weight?.message}
                inputProps={{
                  min: 0,
                  step: 0.1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>{mapWeightCountryUnit(country)}</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              xs={12}
              md={6}
            >
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                BMI
              </Typography>
              <TextField
                type="number"
                variant={'outlined'}
                fullWidth
                {...register('bmi')}
                error={!!errors.bmi}
                helperText={errors.bmi?.message}
                inputProps={{
                  min: 0,
                  step: 0.1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>{mapBMIUnit(country)}</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              xs={12}
              md={6}
            >
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Temperature
              </Typography>
              <TextField
                type="number"
                variant={'outlined'}
                fullWidth
                {...register('temperature')}
                error={!!errors.temperature}
                helperText={errors.temperature?.message}
                inputProps={{
                  min: 0,
                  step: 0.1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>
                        {mapTemperatureCountryUnit(country)}
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              xs={12}
              md={6}
            >
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Respiratory Rate
              </Typography>
              <TextField
                type="number"
                variant={'outlined'}
                fullWidth
                {...register('respiratory_rate')}
                error={!!errors.respiratory_rate}
                helperText={errors.respiratory_rate?.message}
                inputProps={{
                  min: 0,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>bpm</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              xs={12}
              md={6}
            >
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Blood Pressure
              </Typography>
              <TextField
                variant={'outlined'}
                fullWidth
                error={!!errors.systolic || !!errors.diastolic}
                helperText={errors.systolic?.message || errors.diastolic?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>mmHg</Typography>
                    </InputAdornment>
                  ),
                  inputComponent: () => (
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <OutlinedInput
                        type="number"
                        style={{ width: '45%' }}
                        {...register('systolic')}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                          },
                        }}
                        inputProps={{
                          min: 0,
                          step: 0.1,
                        }}
                      />
                      <Typography variant={'caption'}>/</Typography>
                      <OutlinedInput
                        type="number"
                        style={{ width: '45%' }}
                        {...register('diastolic')}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                          },
                        }}
                        inputProps={{
                          min: 0,
                          step: 0.1,
                        }}
                      />
                    </Box>
                  ),
                }}
              />
            </Grid>
            <Grid
              xs={12}
              md={6}
            >
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Heart Rate
              </Typography>
              <TextField
                type="number"
                variant={'outlined'}
                fullWidth
                {...register('heart_rate')}
                error={!!errors.heart_rate}
                helperText={errors.heart_rate?.message}
                inputProps={{
                  min: 0,
                  step: 0.1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>bpm</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              xs={12}
              md={6}
            >
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Oxygen Saturation
              </Typography>
              <TextField
                type="number"
                variant={'outlined'}
                fullWidth
                {...register('oxygen_saturation')}
                error={!!errors.oxygen_saturation}
                helperText={errors.oxygen_saturation?.message}
                inputProps={{
                  min: 0,
                  step: 0.1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>%</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Stack
            alignItems={'center'}
            justifyContent={'center'}
            direction={defaultValues?.id === 'new' ? 'row' : 'row-reverse'}
            spacing={1}
          >
            <Button
              variant="contained"
              disabled={isSubmitting || deleteVitals.mutation.isLoading}
              onClick={() => submit(false)}
            >
              Save
            </Button>
            {defaultValues?.id === 'new' && (
              <Button
                variant="outlined"
                disabled={isSubmitting || deleteVitals.mutation.isLoading}
                onClick={() => submit(true)}
              >
                Save and add another
              </Button>
            )}

            <Button
              variant="outlined"
              onClick={() => deleteVitals.onDiscard(watchId, onClose)}
              disabled={deleteVitals.mutation.isLoading || mutation.isLoading}
            >
              {defaultValues?.id !== 'new' ? 'Delete' : 'Discard'}
            </Button>
          </Stack>
          {(isSubmitting || deleteVitals.mutation.isLoading) && (
            <CircularProgress
              sx={{ ml: 1 }}
              size={20}
            />
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};
