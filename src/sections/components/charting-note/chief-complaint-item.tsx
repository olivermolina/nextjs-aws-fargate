import { ChiefComplaint } from '@prisma/client';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';
import * as React from 'react';
import { useState } from 'react';
import debounce from 'lodash.debounce';
import {
  ChartWithProfileChartItemType,
} from '../../dashboard/customer/customer-profile-chart-item';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import OutlinedInput from '@mui/material/OutlinedInput';
import ChartCardItemTitle from './chart-card-item-title';
import ChartCardItemContainer from './chart-card-item-container';
import { DraggableProvided } from 'react-beautiful-dnd';
import Box from '@mui/material/Box';

type Props = {
  chartId: string;
  itemId: string;
  chiefComplaint: ChiefComplaint;
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  removeMoveItemRef?: () => void;
  provided?: DraggableProvided;
  readOnly?: boolean;
};

export default function ChiefComplaintItem({
                                             chartId,
                                             itemId,
                                             chiefComplaint,
                                             removeMoveItemRef,
                                             readOnly,
                                             ...otherProps
                                           }: Props) {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(
    trpc.chart.get,
    {
      id: chartId,
    },
    'query',
  );
  const [alertVisibility, setAlertVisibility] = useState(false);
  const mutation = trpc.chart.saveChiefComplaint.useMutation({
    // When mutate is called:
    onMutate: async (newChiefComplaint) => {
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
              ChiefComplaint: {
                ...item.ChiefComplaint,
                ...newChiefComplaint,
              },
            };
          }
          return item;
        }),
      };

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newChartData);

      // // Return a context object with the snapshotted value
      return { previousChartData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousChartData);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
  const deleteMutation = trpc.chart.deleteChiefComplaint.useMutation({
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
      return { previousChartData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousChartData);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const onSave = async (value: string) => {
    removeMoveItemRef?.();
    try {
      await mutation.mutateAsync({
        id: chiefComplaint.id,
        value,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };

  const handleInputChange = debounce((value: string) => {
    onSave(value);
  }, 1000);

  const handleDelete = async () => {
    removeMoveItemRef?.();
    try {
      removeMoveItemRef?.();
      await deleteMutation.mutateAsync({
        id: chiefComplaint.id,
      });
      toast.success('Chief complaint deleted successfully');
    } catch (e) {
      toast.error('Unable to delete note. Please try again later.');
    }
  };

  return (
    <ChartCardItemContainer
      {...otherProps}
      title={
        <ChartCardItemTitle
          label={'Chief Complaint'}
          isLoading={mutation.isLoading}
          alertVisibility={alertVisibility}
          setAlertVisibility={setAlertVisibility}
        />
      }
      sectionLabel={'Chief Complaint'}
      handleDelete={handleDelete}
      readOnly={readOnly}
    >
      {readOnly ? (
        <Box
          component={'div'}
          sx={{
            px: 1,
          }}
          dangerouslySetInnerHTML={{ __html: chiefComplaint.value || '' }}
        />
      ) : (
        <OutlinedInput
          onChange={(event) => handleInputChange(event.target.value)}
          sx={{
            flexGrow: 1,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
          defaultValue={chiefComplaint.value}
          multiline
          rows={4}
          placeholder={'Start writing'}
        />
      )}
    </ChartCardItemContainer>
  );
}
