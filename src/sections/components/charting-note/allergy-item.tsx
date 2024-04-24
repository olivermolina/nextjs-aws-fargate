import { Allergy, AllergyStatus } from '@prisma/client';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';
import * as React from 'react';
import { useState } from 'react';
import debounce from 'lodash.debounce';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import {
  ChartWithProfileChartItemType,
} from '../../dashboard/customer/customer-profile-chart-item';
import ChartCardItemContainer from './chart-card-item-container';
import ChartCardItemTitle from './chart-card-item-title';
import { DraggableProvided } from 'react-beautiful-dnd';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { useParams } from 'next/navigation';
import Autocomplete from '@mui/material/Autocomplete';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Typography from '@mui/material/Typography';

type Props = {
  chartId: string;
  itemId: string;
  allergy: Allergy;
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  removeMoveItemRef?: () => void;
  provided?: DraggableProvided;
  readOnly?: boolean;
};

export default function AllergyItem({
                                      allergy,
                                      chartId,
                                      itemId,
                                      removeMoveItemRef,
                                      readOnly,
                                      ...otherProps
                                    }: Props) {
  const { data: options, refetch } = trpc.allergy.listOptions.useQuery();

  const queryClient = useQueryClient();
  const queryKey = getQueryKey(
    trpc.chart.get,
    {
      id: chartId,
    },
    'query',
  );
  const params = useParams();
  const listQueryKey = getQueryKey(
    trpc.allergy.list,
    {
      userId: params.customerId as string,
    },
    'query',
  );
  const [alertVisibility, setAlertVisibility] = useState(false);
  const mutation = trpc.allergy.save.useMutation({
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
              Allergy: {
                ...item.Allergy,
                ...inputs,
              },
            };
          }
          return item;
        }),
      };

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newChartData);
      queryClient.invalidateQueries({ queryKey: listQueryKey });

      // // Return a context object with the snapshotted value
      return { previousChartData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousChartData);
      queryClient.invalidateQueries({ queryKey: listQueryKey });
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: listQueryKey });
    },
  });
  const deleteMutation = trpc.allergy.delete.useMutation({
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

      queryClient.invalidateQueries({ queryKey: listQueryKey });
      return { previousChartData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousChartData);
      queryClient.invalidateQueries({ queryKey: listQueryKey });
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: listQueryKey });
    },
  });

  const handleDelete = async () => {
    removeMoveItemRef?.();
    try {
      await deleteMutation.mutateAsync({
        id: allergy.id,
      });

      toast.success('Allergy deleted successfully');
    } catch (e) {
      toast.error('Unable to delete the allergy. Please try again later.');
    }
  };
  const onSave = async (key: string, value: string | number | Date) => {
    removeMoveItemRef?.();
    try {
      await mutation.mutateAsync({
        id: allergy.id,
        user_id: allergy.user_id,
        [key]: value,
      });
      refetch();
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };
  const handleInputChange = debounce((key: string, value: string | number | Date) => {
    onSave(key, value);
  }, 1000);

  return (
    <ChartCardItemContainer
      {...otherProps}
      readOnly={readOnly}
      title={
        <ChartCardItemTitle
          label={'Allergy'}
          isLoading={mutation.isLoading}
          alertVisibility={alertVisibility}
          setAlertVisibility={setAlertVisibility}
        />
      }
      sectionLabel={'Allergy'}
      handleDelete={handleDelete}
    >
      <Grid
        container
        spacing={2}
        sx={{
          p: 1,
        }}
      >
        {/* Name */}
        <Grid
          item
          xs={12}
          lg={6}
        >
          <FormControl fullWidth>
            <FormLabel
              sx={{
                color: 'text.secondary',
                mb: 1,
              }}
            >
              Allergy Name
            </FormLabel>
            {readOnly ? (
              <Typography variant={'body1'}>{allergy.name}</Typography>
            ) : (
              <Autocomplete
                freeSolo
                options={
                  options?.filter((option) => option.name).map((option) => option.name) || []
                }
                forcePopupIcon
                value={allergy.name}
                onChange={(e, value) => handleInputChange('name', value ?? '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    value={allergy.name}
                    variant={'outlined'}
                    size={'small'}
                  />
                )}
              />
            )}
          </FormControl>
        </Grid>

        {/* Reaction */}
        <Grid
          item
          xs={12}
          lg={6}
        >
          <FormControl fullWidth>
            <FormLabel
              sx={{
                color: 'text.secondary',
                mb: 1,
              }}
            >
              Reaction
            </FormLabel>
            {readOnly ? (
              <Typography variant={'body1'}>{allergy.reaction}</Typography>
            ) : (
              <TextField
                defaultValue={allergy.reaction}
                size={'small'}
                variant={'outlined'}
                fullWidth
                onChange={(e) => handleInputChange('reaction', e.target.value)}
              />
            )}
          </FormControl>
        </Grid>

        {/* Status */}
        <Grid
          item
          xs={12}
          lg={6}
        >
          <FormControl fullWidth>
            <FormLabel
              sx={{
                color: 'text.secondary',
                mb: 1,
              }}
            >
              Reaction
            </FormLabel>

            {readOnly ? (
              <Typography variant={'body1'}>{allergy.status}</Typography>
            ) : (
              <Select
                size={'small'}
                fullWidth
                value={allergy.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value={AllergyStatus.ACTIVE}>Active</MenuItem>
                <MenuItem value={AllergyStatus.INACTIVE}>Inactive</MenuItem>
                <MenuItem value={AllergyStatus.RESOLVED}>Resolve</MenuItem>
              </Select>
            )}
          </FormControl>
        </Grid>

        {/* Onset Date */}
        <Grid
          item
          xs={12}
          lg={6}
        >
          <FormControl fullWidth>
            <FormLabel
              sx={{
                color: 'text.secondary',
                mb: 1,
              }}
            >
              Onset Date
            </FormLabel>

            {readOnly ? (
              <Typography variant={'body1'}>
                {dayjs(allergy.onset_date).format('YYYY-MM-DD')}
              </Typography>
            ) : (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  defaultValue={dayjs(allergy.onset_date)}
                  onChange={(newValue) =>
                    handleInputChange('onset_date', newValue ? newValue?.toDate() : new Date())
                  }
                  slotProps={{ textField: { size: 'small', variant: 'outlined', fullWidth: true } }}
                />
              </LocalizationProvider>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </ChartCardItemContainer>
  );
}
