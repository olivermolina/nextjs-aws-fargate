import { ChartHeading } from '@prisma/client';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';
import * as React from 'react';
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useDialog } from '../../../hooks/use-dialog';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import OutlinedInput from '@mui/material/OutlinedInput';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import {
  ChartWithProfileChartItemType,
} from '../../dashboard/customer/customer-profile-chart-item';
import ChartCardItemContainer from './chart-card-item-container';
import ChartCardItemTitle from './chart-card-item-title';
import { DraggableProvided } from 'react-beautiful-dnd';

type Props = {
  chartId: string;
  itemId: string;
  chartHeading: ChartHeading;
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  removeMoveItemRef?: () => void;
  provided?: DraggableProvided;
  readOnly?: boolean;
};

export default function HeadingItem({
                                      chartHeading,
                                      chartId,
                                      itemId,
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
  const dialog = useDialog();
  const mutation = trpc.chart.saveHeading.useMutation({
    // When mutate is called:
    onMutate: async (newNote) => {
      removeMoveItemRef?.();
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
              ChartHeading: {
                ...item.ChartHeading,
                ...newNote,
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
  const [value, setValue] = useState(chartHeading.value);
  const deleteMutation = trpc.chart.deleteHeading.useMutation({
    // When mutate is called:
    onMutate: async () => {
      removeMoveItemRef?.();
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

  const handleEditHeadingValue = async () => {
    removeMoveItemRef?.();
    dialog.handleClose();
    try {
      await mutation.mutateAsync({
        id: chartHeading.id,
        value,
      });

      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };
  const handleDelete = async () => {
    removeMoveItemRef?.();
    try {
      await deleteMutation.mutateAsync({
        id: chartHeading.id,
      });

      toast.success('Heading deleted successfully');
    } catch (e) {
      toast.error('Unable to delete heading. Please try again later.');
    }
  };

  return (
    <ChartCardItemContainer
      {...otherProps}
      readOnly={readOnly}
      title={
        <ChartCardItemTitle
          label={chartHeading.value || 'Heading'}
          isLoading={mutation.isLoading}
          alertVisibility={alertVisibility}
          setAlertVisibility={setAlertVisibility}
          handleOpen={readOnly ? undefined : dialog.handleOpen}
          titleVariant={'h5'}
        />
      }
      sectionLabel={'Heading'}
      handleDelete={handleDelete}
      handleEdit={readOnly ? undefined : dialog.handleOpen}
    >
      <Dialog
        fullWidth
        maxWidth="sm"
        open={dialog.open}
      >
        <DialogTitle>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={3}
          >
            <Typography variant="h6">Edit Heading</Typography>
            <IconButton
              color="inherit"
              onClick={dialog.handleClose}
            >
              <SvgIcon>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth>
            <FormLabel
              sx={{
                color: 'text.primary',
                mb: 1,
              }}
            >
              Heading
            </FormLabel>
            <OutlinedInput
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'space-between',
            display: 'flex',
            alignItems: 'center',
            mx: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={handleDelete}
          >
            <DeleteIcon color={'error'} />
          </IconButton>
          <Stack
            direction={'row'}
            spacing={1}
            alignItems={'center'}
          >
            {mutation.isLoading && (
              <CircularProgress
                sx={{ ml: 1 }}
                size={20}
              />
            )}
            <Button
              autoFocus
              onClick={dialog.handleClose}
              variant={'outlined'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditHeadingValue}
              variant={'contained'}
              disabled={mutation.isLoading}
            >
              Save
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </ChartCardItemContainer>
  );
}
