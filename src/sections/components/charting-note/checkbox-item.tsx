import { ChartCheckBox } from '@prisma/client';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';
import * as React from 'react';
import { useEffect, useState } from 'react';
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
import DeleteSectionPrompt from './delete-section-prompt';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import debounce from 'lodash.debounce';

type CheckBoxValue = {
  key: string;
  notes: string;
  checked: boolean;
};

type Props = {
  chartId: string;
  itemId: string;
  chartCheckBox: ChartCheckBox;
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  removeMoveItemRef?: () => void;
  provided?: DraggableProvided;
  readOnly?: boolean;
};

export default function CheckboxItem({
                                       chartCheckBox,
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
    options?: string[] | null;
    layout?: 'horizontal' | 'vertical' | 'columns' | null;
    include_note?: boolean | null;
    hide_unchecked_after_signing?: boolean | null;
    required?: boolean | null;
    value?: CheckBoxValue[] | null;
  }>();

  const mutation = trpc.chart.saveCheckbox.useMutation({
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
              ChartCheckBox: {
                ...item.ChartCheckBox,
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
  const deleteMutation = trpc.chart.deleteCheckBox.useMutation({
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

  const [value, setValue] = useState<CheckBoxValue[]>(chartCheckBox.value as CheckBoxValue[]);
  const [state, setState] = useState<Record<string, boolean>>({});

  const handleSaveCheckBoxChanges = async (newState: Record<string, boolean>) => {
    if (readOnly) return;
    try {
      await mutation.mutateAsync({
        id: chartCheckBox.id,
        value: Object.entries(newState).map(([key]) => ({
          key,
          notes:
            (chartCheckBox.value as CheckBoxValue[])?.find((item) => item.key === key)?.notes || '',
          checked: newState[key],
        })),
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    setState({
      ...state,
      [event.target.name]: event.target.checked,
    });

    handleSaveCheckBoxChanges({ ...state, [event.target.name]: event.target.checked });
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
        id: chartCheckBox.id,
        label: dialog.data?.label || 'Check Box',
        options: dialog.data?.options || ['1', '2', '3', '4', '5'],
        layout: dialog.data?.layout || 'horizontal',
        include_note: dialog.data?.include_note || false,
        hide_unchecked_after_signing: dialog.data?.hide_unchecked_after_signing || false,
        required: dialog.data?.required || false,
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
        id: chartCheckBox.id,
      });

      toast.success('Check Box section deleted successfully');
    } catch (e) {
      toast.error('Unable to delete Check Box section. Please try again later.');
    }
  };
  const handleDialogClose = () => {
    setOptionsErrors(null);
    dialog.handleClose();
  };

  const handleEdit = () => {
    dialog.handleOpen({
      label: chartCheckBox.label,
      options: chartCheckBox.options,
      layout: chartCheckBox.layout as 'horizontal' | 'vertical' | 'columns',
      include_note: chartCheckBox.include_note,
      hide_unchecked_after_signing: chartCheckBox.hide_unchecked_after_signing,
      required: chartCheckBox.required,
      value: chartCheckBox.value as CheckBoxValue[],
    });
  };

  const handleChangeLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    dialog.handleOpen({
      ...dialog.data,
      layout: event.target.value as 'horizontal' | 'vertical' | 'columns',
      include_note: event.target.value !== 'vertical' ? false : dialog.data?.include_note,
    });
  };

  const handleNoteChange = debounce(async (newNotes: string, key: string, checked: boolean) => {
    let oldValue = Array.from(value);
    let newValue = [];
    if (!oldValue || oldValue.length === 0) {
      // initialize value
      newValue.push({
        key,
        notes: newNotes,
        checked,
      });
    } else {
      newValue = oldValue.map((item) => {
        if (item.key === key) {
          return {
            key,
            notes: newNotes,
            checked,
          };
        }
        return item;
      });
    }
    setValue(newValue);
    try {
      await mutation.mutateAsync({
        id: chartCheckBox.id,
        value: newValue,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  }, 1500);

  useEffect(() => {
    if (chartCheckBox) {
      const selectedValues = chartCheckBox.value as CheckBoxValue[];
      let newState: Record<string, boolean> = {};
      chartCheckBox.options.forEach((option) => {
        newState[option] = selectedValues.some((value) => value.key === option && value.checked);
      });
      setState(newState);
    }
  }, [chartCheckBox]);

  return (
    <ChartCardItemContainer
      {...otherProps}
      readOnly={readOnly}
      title={
        <ChartCardItemTitle
          label={chartCheckBox.label || 'Check Box'}
          isLoading={mutation.isLoading}
          alertVisibility={alertVisibility}
          setAlertVisibility={setAlertVisibility}
          handleOpen={readOnly ? undefined : handleEdit}
        />
      }
      sectionLabel={'Check Box'}
      handleDelete={handleDelete}
      handleEdit={readOnly ? undefined : handleEdit}
    >
      <FormControl
        component="fieldset"
        variant="standard"
        sx={{
          ml: 2,
        }}
      >
        <FormGroup>
          {chartCheckBox.layout === 'horizontal' && (
            <Stack direction="row">
              {chartCheckBox.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      name={option}
                      onChange={handleCheckboxChange}
                      checked={Boolean(state[option]) ? state[option] : false}
                      readOnly={readOnly}
                    />
                  }
                  label={option}
                />
              ))}
            </Stack>
          )}

          {chartCheckBox.layout === 'vertical' && (
            <Stack spacing={6}>
              {chartCheckBox.options?.map((option, index) => (
                <Stack
                  key={index}
                  direction={'row'}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                >
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        name={option}
                        onChange={handleCheckboxChange}
                        checked={Boolean(state[option]) ? state[option] : false}
                        readOnly={readOnly}
                      />
                    }
                    label={option}
                  />
                  {chartCheckBox.include_note && (
                    <FormControl
                      fullWidth
                      sx={{
                        maxWidth: '80%',
                      }}
                    >
                      {readOnly ? (
                        <Typography
                          variant={'body2'}
                          sx={{
                            minHeight: 50,
                          }}
                        >
                          {value.find((item) => item.key === option)?.notes}
                        </Typography>
                      ) : (
                        <OutlinedInput
                          defaultValue={value.find((item) => item.key === option)?.notes}
                          fullWidth
                          multiline
                          size={'small'}
                          onChange={(e) => handleNoteChange(e.target.value, option, state[option])}
                        />
                      )}
                    </FormControl>
                  )}
                </Stack>
              ))}
            </Stack>
          )}

          {chartCheckBox.layout === 'columns' && (
            <Grid container>
              {chartCheckBox.options?.map((option, index) => (
                <Grid
                  item
                  key={index}
                  xs={4}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        name={option}
                        onChange={handleCheckboxChange}
                        checked={Boolean(state[option]) ? state[option] : false}
                        readOnly={readOnly}
                      />
                    }
                    label={option}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </FormGroup>
      </FormControl>

      {!readOnly && (
        <>
          {/** Edit Section Dialog **/}
          <Dialog
            fullWidth
            maxWidth="sm"
            open={dialog.open}
          >
            <form
              id={`checkbox-form-${chartCheckBox.id}`}
              onSubmit={handleSaveFormDialog}
            >
              <DialogTitle>
                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between"
                  spacing={3}
                >
                  <Typography variant="h6">Edit Check Box</Typography>
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

                  <FormControl
                    disabled={
                      dialog?.data?.value?.some((item) => item.notes !== '') ||
                      !!dialog.data?.include_note
                    }
                  >
                    <FormLabel id="checkbox-layout-group-label">Check Box Layout</FormLabel>
                    <RadioGroup
                      row
                      aria-labelledby="checkbox-layout-group-label"
                      name="checkbox-layout-group-label"
                      value={dialog.data?.layout}
                      onChange={handleChangeLayout}
                    >
                      <FormControlLabel
                        value="horizontal"
                        control={<Radio />}
                        label="Horizontal"
                      />
                      <FormControlLabel
                        value="vertical"
                        control={<Radio />}
                        label="Vertical"
                      />
                      <FormControlLabel
                        value="columns"
                        control={<Radio />}
                        label="Columns"
                      />
                    </RadioGroup>
                  </FormControl>

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
                    columnLabel={'Options'}
                  />

                  <FormControl disabled={dialog?.data?.value?.some((item) => item.notes !== '')}>
                    <Stack
                      direction={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <FormLabel id="switch-include-notes-label">Include Notes</FormLabel>
                      <FormControlLabel
                        label={''}
                        aria-labelledby="checkbox-layout-group-label"
                        control={
                          <Switch
                            checked={dialog.data?.include_note || false}
                            onChange={(event) =>
                              dialog.handleOpen({
                                ...dialog.data,
                                include_note: event.target.checked,
                                layout: event.target.checked ? 'vertical' : dialog.data?.layout,
                              })
                            }
                          />
                        }
                      />
                    </Stack>
                  </FormControl>

                  <Divider />

                  <FormControl>
                    <Stack
                      direction={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <FormLabel id="switch-unchecked-checkboxes-label">
                        Hide unchecked checkboxes after signing
                      </FormLabel>
                      <FormControlLabel
                        label={''}
                        aria-labelledby="switch-unchecked-checkboxes-label"
                        control={
                          <Switch
                            checked={dialog.data?.hide_unchecked_after_signing || false}
                            onChange={(event) =>
                              dialog.handleOpen({
                                ...dialog.data,
                                hide_unchecked_after_signing: event.target.checked,
                              })
                            }
                          />
                        }
                      />
                    </Stack>
                  </FormControl>
                  <Divider />
                  <FormControl>
                    <Stack
                      direction={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <FormLabel id="switch-required-label">Required</FormLabel>
                      <FormControlLabel
                        label={''}
                        aria-labelledby="switch-required-label"
                        control={
                          <Switch
                            checked={dialog.data?.required || false}
                            onChange={(event) =>
                              dialog.handleOpen({
                                ...dialog.data,
                                required: event.target.checked,
                              })
                            }
                          />
                        }
                      />
                    </Stack>
                  </FormControl>

                  <Divider />
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
            sectionLabel={'Check Box'}
            onClose={deleteDialog.handleClose}
            onDelete={handleDelete}
          />
        </>
      )}
    </ChartCardItemContainer>
  );
}
