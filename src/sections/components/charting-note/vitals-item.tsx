import { Vital } from '@prisma/client';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';
import * as React from 'react';
import { useState } from 'react';
import debounce from 'lodash.debounce';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import {
  ChartWithProfileChartItemType,
} from '../../dashboard/customer/customer-profile-chart-item';
import ChartCardItemContainer from './chart-card-item-container';
import ChartCardItemTitle from './chart-card-item-title';
import { DraggableProvided } from 'react-beautiful-dnd';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import {
  mapBMIUnit,
  mapHeightCountryUnit,
  mapTemperatureCountryUnit,
  mapWeightCountryUnit,
} from '../../../utils/vitals-utils';
import { useOrganizationStore } from '../../../hooks/use-organization';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useParams } from 'next/navigation';
import CustomerProfileVitals from '../../dashboard/customer/customer-profile-vitals';

type Props = {
  chartId: string;
  itemId: string;
  vital: Vital;
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  removeMoveItemRef?: () => void;
  provided?: DraggableProvided;
  readOnly?: boolean;
};

export default function VitalsItem({
                                     vital,
                                     chartId,
                                     itemId,
                                     removeMoveItemRef,
                                     readOnly,
                                     ...otherProps
                                   }: Props) {
  const { data: organization } = useOrganizationStore();
  const country = organization?.address?.country;
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(
    trpc.chart.get,
    {
      id: chartId,
    },
    'query',
  );
  const params = useParams();
  const currentVitalQueryKey = getQueryKey(
    trpc.vitals.current,
    {
      userId: params.customerId as string,
    },
    'query',
  );
  const [alertVisibility, setAlertVisibility] = useState(false);
  const mutation = trpc.vitals.save.useMutation({
    // When mutate is called:
    onMutate: async (inputs) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      // Snapshot the previous value
      const previousChartData = queryClient.getQueryData(queryKey, {
        exact: true,
      }) as ChartWithProfileChartItemType;
      const newChartData = {
        ...previousChartData,
        items: previousChartData.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              Vital: {
                ...item.Vital,
                ...inputs,
              },
            };
          }
          return item;
        }),
      };

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newChartData);
      queryClient.invalidateQueries({ queryKey: currentVitalQueryKey });

      // // Return a context object with the snapshotted value
      return { previousChartData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousChartData);
      queryClient.invalidateQueries({ queryKey: currentVitalQueryKey });
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: currentVitalQueryKey });
    },
  });
  const deleteMutation = trpc.vitals.delete.useMutation({
    // When mutate is called:
    onMutate: async () => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      // Snapshot the previous value
      const previousChartData = queryClient.getQueryData(queryKey, {
        exact: true,
      }) as ChartWithProfileChartItemType;
      const newChartData = {
        ...previousChartData,
        items: previousChartData.items.filter((item) => item.id !== itemId),
      };
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newChartData);
      // // Return a context object with the snapshotted value

      queryClient.invalidateQueries({ queryKey: currentVitalQueryKey });
      return { previousChartData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousChartData);
      queryClient.invalidateQueries({ queryKey: currentVitalQueryKey });
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: currentVitalQueryKey });
    },
  });
  const handleDelete = async () => {
    removeMoveItemRef?.();
    try {
      await deleteMutation.mutateAsync({
        id: vital.id,
      });

      toast.success('Vitals deleted successfully');
    } catch (e) {
      toast.error('Unable to delete vitals. Please try again later.');
    }
  };
  const onSave = async (key: string, value: string | number) => {
    removeMoveItemRef?.();
    try {
      await mutation.mutateAsync({
        id: vital.id,
        date: vital.date || new Date(),
        user_id: vital.user_id,
        [key]: value,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };
  const handleInputChange = debounce((key: string, value: string | number) => {
    onSave(key, value);
  }, 1000);

  return (
    <ChartCardItemContainer
      {...otherProps}
      readOnly={readOnly}
      title={
        <ChartCardItemTitle
          label={'Vitals'}
          isLoading={mutation.isLoading}
          alertVisibility={alertVisibility}
          setAlertVisibility={setAlertVisibility}
        />
      }
      sectionLabel={'Vitals'}
      handleDelete={handleDelete}
    >
      {readOnly ? (
        <CustomerProfileVitals
          id={vital.user_id}
          readOnly
          vital={vital}
          country={country}
        />
      ) : (
        <Grid
          container
          spacing={1}
          sx={{
            p: 1,
          }}
        >
          {/* Height */}
          <Grid
            item
            xs={6}
            lg={3}
          >
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Height
              </FormLabel>
              <TextField
                defaultValue={vital.height}
                size={'small'}
                type="number"
                variant={'outlined'}
                fullWidth
                inputProps={{
                  min: 0,
                  step: 1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>{mapHeightCountryUnit(country)}</Typography>
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => handleInputChange('height', e.target.value)}
              />
            </FormControl>
          </Grid>

          {/* Weight */}
          <Grid
            item
            xs={6}
            lg={3}
          >
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Weight
              </FormLabel>
              <TextField
                defaultValue={vital.weight}
                size={'small'}
                type="number"
                variant={'outlined'}
                fullWidth
                inputProps={{
                  min: 0,
                  step: 1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>{mapWeightCountryUnit(country)}</Typography>
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </FormControl>
          </Grid>

          {/* BMI */}
          <Grid
            item
            xs={6}
            lg={3}
          >
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                BMI
              </FormLabel>
              <TextField
                defaultValue={vital.bmi}
                size={'small'}
                type="number"
                variant={'outlined'}
                fullWidth
                inputProps={{
                  min: 0,
                  step: 1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>{mapBMIUnit(country)}</Typography>
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => handleInputChange('bmi', e.target.value)}
              />
            </FormControl>
          </Grid>

          {/* Temperature */}
          <Grid
            item
            xs={6}
            lg={3}
          >
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Temperature
              </FormLabel>
              <TextField
                defaultValue={vital.temperature}
                size={'small'}
                type="number"
                variant={'outlined'}
                fullWidth
                inputProps={{
                  min: 0,
                  step: 1,
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
                onChange={(e) => handleInputChange('temperature', e.target.value)}
              />
            </FormControl>
          </Grid>

          {/* Respiratory Rate */}
          <Grid
            item
            xs={6}
            lg={3}
          >
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Respiratory Rate
              </FormLabel>
              <TextField
                defaultValue={vital.respiratory_rate}
                size={'small'}
                type="number"
                variant={'outlined'}
                fullWidth
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
                onChange={(e) => handleInputChange('respiratory_rate', e.target.value)}
              />
            </FormControl>
          </Grid>

          {/* Blood Pressure */}
          <Grid
            item
            xs={6}
            lg={3}
          >
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Blood Pressure
              </FormLabel>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
                  '&:focus-within': {
                    borderColor: 'primary.main',
                    boxShadow: (theme) => `0 0 0 0.1rem ${theme.palette.primary.main}`,
                  },
                  borderRadius: 1,
                  pr: 1,
                  gap: 1,
                }}
              >
                <OutlinedInput
                  defaultValue={vital.systolic}
                  size={'small'}
                  type="number"
                  style={{ width: '45%' }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                  inputProps={{
                    min: 0,
                    step: 1,
                  }}
                  onChange={(e) => handleInputChange('systolic', e.target.value)}
                />
                <Typography variant={'caption'}>/</Typography>
                <OutlinedInput
                  defaultValue={vital.diastolic}
                  size={'small'}
                  type="number"
                  style={{ width: '45%' }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                  inputProps={{
                    min: 0,
                    step: 1,
                  }}
                  onChange={(e) => handleInputChange('diastolic', e.target.value)}
                />
                <Typography variant={'caption'}>mmHg</Typography>
              </Box>
            </FormControl>
          </Grid>

          {/* Heart Rate */}
          <Grid
            item
            xs={6}
            lg={3}
          >
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Heart Rate
              </FormLabel>
              <TextField
                defaultValue={vital.heart_rate}
                size={'small'}
                type="number"
                variant={'outlined'}
                fullWidth
                inputProps={{
                  min: 0,
                  step: 1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>bpm</Typography>
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => handleInputChange('heart_rate', e.target.value)}
              />
            </FormControl>
          </Grid>

          {/* Oxygen Saturation */}
          <Grid
            item
            xs={6}
            lg={3}
          >
            <FormControl fullWidth>
              <FormLabel
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Oxygen Saturation
              </FormLabel>
              <TextField
                defaultValue={vital.oxygen_saturation}
                size={'small'}
                type="number"
                variant={'outlined'}
                fullWidth
                inputProps={{
                  min: 0,
                  step: 1,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'caption'}>%</Typography>
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => handleInputChange('oxygen_saturation', e.target.value)}
              />
            </FormControl>
          </Grid>
        </Grid>
      )}
    </ChartCardItemContainer>
  );
}
