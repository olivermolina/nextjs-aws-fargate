import { ChartDropdown } from '@prisma/client';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';
import * as React from 'react';
import { useState } from 'react';
import debounce from 'lodash.debounce';
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
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import DraggableTableRow from '../../../components/draggable-table-row';
import Alert from '@mui/material/Alert';
import { AlertTitle } from '@mui/material';
import DeleteSectionPrompt from './delete-section-prompt';
import Box from '@mui/material/Box';

type Props = {
  chartId: string;
  itemId: string;
  chartDropdown: ChartDropdown;
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  removeMoveItemRef?: () => void;
  provided?: DraggableProvided;
  readOnly?: boolean;
};

export default function DropdownItem({
                                       chartDropdown,
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
    prompt?: string | null;
    options?: string[] | null;
  }>();
  const mutation = trpc.chart.saveDropdown.useMutation({
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
              ChartDropdown: {
                ...item.ChartDropdown,
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
  const [value, setValue] = useState(chartDropdown.value);
  const deleteMutation = trpc.chart.deleteDropdown.useMutation({
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
      setValue(value);
      await mutation.mutateAsync({
        id: chartDropdown.id,
        value,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };
  const handleSaveDropdown = async (e: React.FormEvent) => {
    if (readOnly) return;
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
        id: chartDropdown.id,
        label: dialog.data?.label || 'Drop Down',
        options: dialog.data?.options || ['1', '2', '3', '4', '5'],
        prompt: dialog.data?.prompt || 'Select an option..',
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
        id: chartDropdown.id,
      });

      toast.success('Dropdown section deleted successfully');
    } catch (e) {
      toast.error('Unable to delete Dropdown section. Please try again later.');
    }
  };
  const handleDialogClose = () => {
    setOptionsErrors(null);
    dialog.handleClose();
  };

  const handleInputChange = debounce((value: string) => {
    onSave(value);
  }, 1000);

  const handleEdit = () => {
    dialog.handleOpen({
      label: chartDropdown.label,
      prompt: chartDropdown.prompt,
      options: chartDropdown.options,
    });
  };

  return (
    <ChartCardItemContainer
      {...otherProps}
      title={
        <ChartCardItemTitle
          label={chartDropdown.label || 'Drop Down'}
          isLoading={mutation.isLoading}
          alertVisibility={alertVisibility}
          setAlertVisibility={setAlertVisibility}
          handleOpen={readOnly ? undefined : handleEdit}
        />
      }
      sectionLabel={'Drop Down'}
      handleDelete={readOnly ? undefined : handleDelete}
      handleEdit={readOnly ? undefined : handleEdit}
      readOnly={readOnly}
    >
      {readOnly ? (
        <Box
          sx={{
            px: 1,
          }}
          component={'div'}
          dangerouslySetInnerHTML={{ __html: value || '' }}
        />
      ) : (
        <FormControl fullWidth>
          <InputLabel
            id={`${chartDropdown.id}-select-label`}
            sx={{
              fontSize: 18,
            }}
            shrink
          >
            {chartDropdown.prompt}
          </InputLabel>
          <Select
            defaultValue={value}
            fullWidth
            labelId={`${chartDropdown.id}-select-label`}
            id={`${chartDropdown.id}-select`}
            onChange={(e) => {
              setValue(e.target.value as string);
              handleInputChange(e.target.value as string);
            }}
            label={chartDropdown.prompt}
            notched
            sx={{
              fontSize: 20,
            }}
          >
            {chartDropdown.options.map((option) => (
              <MenuItem
                key={option}
                value={option}
              >
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {!readOnly && (
        <>
          {/** Edit Section Dialog **/}
          <Dialog
            fullWidth
            maxWidth="sm"
            open={dialog.open}
          >
            <form
              id={`dropdown-form-${chartDropdown.id}`}
              onSubmit={handleSaveDropdown}
            >
              <DialogTitle>
                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between"
                  spacing={3}
                >
                  <Typography variant="h6">Edit Drop Down</Typography>
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
                      Prompt
                    </FormLabel>
                    <OutlinedInput
                      required
                      value={dialog.data?.prompt}
                      onChange={(e) =>
                        dialog.handleOpen({
                          ...dialog.data,
                          prompt: e.target.value,
                        })
                      }
                    />
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
            sectionLabel={'Drop Down'}
            onClose={deleteDialog.handleClose}
            onDelete={handleDelete}
          />
        </>
      )}
    </ChartCardItemContainer>
  );
}
