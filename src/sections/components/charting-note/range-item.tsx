import { ChartRange } from '@prisma/client';
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
import DraggableTableRow from '../../../components/draggable-table-row';
import Alert from '@mui/material/Alert';
import { AlertTitle } from '@mui/material';
import DeleteSectionPrompt from './delete-section-prompt';
import Slider from '@mui/material/Slider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';

type Props = {
  chartId: string;
  itemId: string;
  chartRange: ChartRange;
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  removeMoveItemRef?: () => void;
  provided?: DraggableProvided;
  readOnly?: boolean;
};

export default function RangeItem({
                                    chartRange,
                                    chartId,
                                    itemId,
                                    removeMoveItemRef,
                                    readOnly,
                                    ...otherProps
                                  }: Props) {
  const deleteDialog = useDialog();
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(
    trpc.chart.get,
    {
      id: chartId,
    },
    'query',
  );

  const [alertVisibility, setAlertVisibility] = useState(false);
  const [optionsErrors, setOptionsErrors] = useState<
    { [key: string]: string | boolean | number }[] | null
  >(null);
  const dialog = useDialog<{
    label?: string | null;
    default_value?: string | null;
    options?: string[] | null;
  }>();
  const mutation = trpc.chart.saveRange.useMutation({
    // When mutate is called:
    onMutate: async (newItem) => {
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
              ChartRange: {
                ...item.ChartRange,
                ...newItem,
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
  const deleteMutation = trpc.chart.deleteRange.useMutation({
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
    if (readOnly) return;
    removeMoveItemRef?.();
    try {
      await mutation.mutateAsync({
        id: chartRange.id,
        value,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };
  const handleSaveFormDialog = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeMoveItemRef?.();

    if (dialog.data?.options?.length === 0) {
      setOptionsErrors([
        {
          index: 0,
          error: true,
          message: 'Please add at least one option',
        },
      ]);
      return;
    }

    let newErrors: { [key: string]: string | boolean | number }[] = [];
    let seenValues = new Set<string>();

    dialog.data?.options?.forEach((option, index) => {
      if (option === '') {
        newErrors.push({
          index,
          error: true,
          message: `Row ${index + 1}: Value missing on Options`,
        });
      } else if (seenValues.has(option)) {
        newErrors.push({
          index,
          error: true,
          message: `Row ${index + 1}: Duplicate value found`,
        });
      } else {
        seenValues.add(option);
      }
    });

    if (newErrors.length > 0) {
      setOptionsErrors(newErrors);
      return;
    }

    dialog.handleClose();
    setOptionsErrors(null);

    try {
      await mutation.mutateAsync({
        id: chartRange.id,
        label: dialog.data?.label || 'Range / Scale',
        options: dialog.data?.options || ['1', '2', '3', '4', '5'],
        default_value: dialog.data?.default_value,
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
        id: chartRange.id,
      });

      toast.success('Range / Scale section deleted successfully');
    } catch (e) {
      toast.error('Unable to delete Range / Scale section. Please try again later.');
    }
  };
  const handleDialogClose = () => {
    setOptionsErrors(null);
    dialog.handleClose();
  };

  const handleEdit = () => {
    dialog.handleOpen({
      label: chartRange.label,
      default_value: chartRange.default_value,
      options: chartRange.options,
    });
  };

  return (
    <ChartCardItemContainer
      {...otherProps}
      readOnly={readOnly}
      title={
        <ChartCardItemTitle
          label={chartRange.label || 'Range / Scale'}
          isLoading={mutation.isLoading}
          alertVisibility={alertVisibility}
          setAlertVisibility={setAlertVisibility}
          handleOpen={readOnly ? undefined : handleEdit}
        />
      }
      sectionLabel={'Range / Scale'}
      handleDelete={handleDelete}
      handleEdit={readOnly ? undefined : handleEdit}
    >
      <Box
        sx={{
          px: readOnly ? 2 : 1,
        }}
      >
        <Slider
          aria-label="Range / Scale"
          defaultValue={
            chartRange.default_value
              ? chartRange.options?.indexOf(chartRange.default_value)
              : undefined
          }
          step={1}
          marks={chartRange.options?.map((option, index) => ({
            value: index,
            label: option,
          }))}
          min={0}
          max={chartRange.options?.length - 1}
          onChange={(e, value) => {
            if (readOnly) return;
            if (typeof value === 'number') {
              onSave(chartRange.options?.[value] || '');
            }
          }}
          getAriaLabel={(value) => chartRange.options?.[value as number] || ''}
          getAriaValueText={(value) => chartRange.options?.[value as number] || ''}
          valueLabelDisplay="off"
          disabled={readOnly}
          sx={{
            '&.Mui-disabled': {
              color: theme => theme.palette.primary.main,
            },
          }}
        />
      </Box>

      {!readOnly && (
        <>
          {/** Edit Section Dialog **/}
          <Dialog
            fullWidth
            maxWidth="sm"
            open={dialog.open}
          >
            <form
              id={`range-scale-form-${chartRange.id}`}
              onSubmit={handleSaveFormDialog}
            >
              <DialogTitle>
                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between"
                  spacing={3}
                >
                  <Typography variant="h6">Edit Range / Scale</Typography>
                  <IconButton
                    color="inherit"
                    onClick={handleDialogClose}
                  >
                    <SvgIcon>
                      <XIcon />
                    </SvgIcon>
                  </IconButton>
                </Stack>
              </DialogTitle>
              <DialogContent dividers>
                <Stack spacing={1}>
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      Label
                    </FormLabel>
                    <OutlinedInput
                      required
                      value={dialog.data?.label}
                      onChange={(e) =>
                        dialog.handleOpen({
                          ...dialog.data,
                          label: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      Default Selected Option
                    </FormLabel>
                    <Select
                      variant={'outlined'}
                      labelId={`${chartRange.id}-select-label`}
                      id={`${chartRange.id}-select`}
                      defaultValue={dialog.data?.default_value}
                      onChange={(e) =>
                        dialog.handleOpen({
                          ...dialog.data,
                          default_value: e.target.value as string,
                        })
                      }
                    >
                      {dialog.data?.options?.map((option, index) => (
                        <MenuItem
                          key={`option-${index}`}
                          value={option}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {optionsErrors && optionsErrors.length > 0 && (
                    <Alert
                      variant="filled"
                      severity="error"
                    >
                      <AlertTitle>Error</AlertTitle>
                      {optionsErrors.map((error, index) => (
                        <Typography key={`error-${index}`}>{error.message}</Typography>
                      ))}
                    </Alert>
                  )}
                  <DraggableTableRow
                    items={dialog.data?.options || []}
                    onSetItems={(options: string[]) =>
                      dialog.handleOpen({
                        ...dialog.data,
                        options,
                      })
                    }
                    errors={optionsErrors}
                    clearErrors={() => setOptionsErrors(null)}
                    columnLabel={'Labels'}
                  />
                </Stack>
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
                  onClick={deleteDialog.handleOpen}
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
                    onClick={handleDialogClose}
                    variant={'outlined'}
                  >
                    Cancel
                  </Button>
                  <Button
                    type={'submit'}
                    variant={'contained'}
                    disabled={mutation.isLoading}
                  >
                    Save
                  </Button>
                </Stack>
              </DialogActions>
            </form>
          </Dialog>

          {/** Delete sectionDialog**/}
          <DeleteSectionPrompt
            open={deleteDialog.open}
            sectionLabel={'Range / Scale'}
            onClose={deleteDialog.handleClose}
            onDelete={handleDelete}
          />
        </>
      )}
    </ChartCardItemContainer>
  );
}
