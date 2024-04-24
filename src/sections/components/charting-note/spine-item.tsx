import { ChartSpine } from '@prisma/client';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
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
import DeleteIcon from '@mui/icons-material/Delete';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import {
  ChartWithProfileChartItemType,
} from '../../dashboard/customer/customer-profile-chart-item';
import ChartCardItemContainer from './chart-card-item-container';
import ChartCardItemTitle from './chart-card-item-title';
import { DraggableProvided } from 'react-beautiful-dnd';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import debounce from 'lodash.debounce';
import { CanvasPath } from 'react-sketch-canvas/src/types';
import { compress, decompress } from 'compress-json';
import OutlinedInput from '@mui/material/OutlinedInput';
import SketchToolbars from './sketch-toolbars';
import { useSketchToolbars } from '../../../hooks/use-sketch-toolbars';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { SPINE_OPTIONS } from '../../../constants/spine-default-value';
import Box from '@mui/material/Box';

type Props = {
  chartId: string;
  itemId: string;
  spine: ChartSpine;
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  removeMoveItemRef?: () => void;
  provided?: DraggableProvided;
  readOnly?: boolean;
};

export default function SpineItem({
                                    spine,
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
  const [dialogData, setDialogData] = useState<Record<string, string>>({});
  const noteRef = React.useRef<HTMLInputElement>(null);
  const [isPathsLoaded, setIsPathsLoaded] = useState(false);
  const [alertVisibility, setAlertVisibility] = useState(false);
  const dialog = useDialog<any>();
  const mutation = trpc.chart.saveSpine.useMutation({
    // When mutate is called:
    onMutate: async (newSpine) => {
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
              ChartSpine: {
                ...item.ChartSpine,
                ...newSpine,
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
  const deleteMutation = trpc.chart.deleteSpine.useMutation({
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
        id: spine.id,
        canvas: value,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };
  const sketchToolbars = useSketchToolbars();
  const [checkboxState, setCheckboxState] = useState<Record<string, boolean>>({});

  const handleEditSpineLabel = async () => {
    removeMoveItemRef?.();
    dialog.handleClose();
    try {
      if (noteRef.current) {
        noteRef.current.defaultValue = dialogData.notes;
        noteRef.current.value = dialogData.notes;
      }
      await mutation.mutateAsync({
        id: spine.id,
        label: dialogData.label,
        notes: dialogData.notes,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };
  const handleCloseEditSpine = () => {
    dialog.handleClose();
  };

  const handleDelete = async () => {
    removeMoveItemRef?.();
    try {
      await deleteMutation.mutateAsync({
        id: spine.id,
      });

      toast.success('Deleted successfully');
    } catch (e) {
      toast.error('Unable to delete the spine section. Please try again later.');
    }
  };

  const handleSpineSketchOnChange = debounce((updatedPaths: CanvasPath[]) => {
    // Ignore the initial load on change
    setIsPathsLoaded(true);
    if (!isPathsLoaded) {
      return;
    }
    const compressedPaths = JSON.stringify(compress(updatedPaths));
    onSave(compressedPaths);
  }, 1000);

  const loadCanvas = useCallback(() => {
    if (spine.canvas) {
      sketchToolbars.canvasRef.current?.loadPaths(decompress(JSON.parse(spine.canvas)));
    }

    if (Array.isArray(spine.value)) {
      const newState: Record<string, boolean> = {};
      const selectedOptions = spine.value;
      for (const key of selectedOptions) {
        newState[key as string] = true;
      }
      setCheckboxState(newState);
    }
  }, [spine.canvas]);

  const onSaveSelectedOptions = async (newState: Record<string, boolean>) => {
    removeMoveItemRef?.();
    try {
      await mutation.mutateAsync({
        id: spine.id,
        value: Object.entries(newState)
          .filter(([key, value]) => value)
          .map(([key]) => key),
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const newState = {
      ...checkboxState,
      [event.target.name]: event.target.checked,
    };
    setCheckboxState(newState);
    onSaveSelectedOptions(newState);
  };

  const handleNoteChange = debounce(async (event: React.ChangeEvent<HTMLInputElement>) => {
    removeMoveItemRef?.();
    try {
      await mutation.mutateAsync({
        id: spine.id,
        notes: event.target.value,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  }, 1500);

  useEffect(() => {
    loadCanvas();
  }, []);

  return (
    <ChartCardItemContainer
      {...otherProps}
      readOnly={readOnly}
      title={
        <ChartCardItemTitle
          label={spine.label || 'Spine'}
          isLoading={mutation.isLoading}
          alertVisibility={alertVisibility}
          setAlertVisibility={setAlertVisibility}
          handleOpen={
            readOnly
              ? undefined
              : () => {
                setDialogData({
                  label: spine.label || 'Spine',
                  notes: spine.notes || '',
                });
                dialog.handleOpen();
              }
          }
        />
      }
      sectionLabel={spine.label || 'Spine'}
      handleDelete={handleDelete}
      handleEdit={
        readOnly
          ? undefined
          : () => {
            setDialogData({
              label: spine.label || 'Spine',
              notes: spine.notes || '',
            });
            dialog.handleOpen();
          }
      }
    >
      <Grid
        container
        spacing={2}
      >
        <Grid
          item
          xs={readOnly ? 6 : 12}
          lg={6}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
            maxWidth={350}
          >
            {!readOnly && <SketchToolbars sketchToolbars={sketchToolbars} />}
            <FormControl>
              <FormLabel
                component="legend"
                sx={{
                  textAlign: 'right',
                }}
                id={'spine-label-left'}
              >
                Left
              </FormLabel>
              <FormGroup>
                {SPINE_OPTIONS.map((option) => (
                  <FormControlLabel
                    key={`${option} L`}
                    sx={{
                      p: 0,
                      mx: 0,
                    }}
                    control={
                      <Checkbox
                        sx={{
                          p: 0.2,
                          '& .MuiSvgIcon-root': { fontSize: 8 },
                        }}
                        checked={
                          Boolean(checkboxState[`${option} L`])
                            ? checkboxState[`${option} L`]
                            : false
                        }
                        onChange={handleCheckboxChange}
                        name={`${option} L`}
                      />
                    }
                    label={<Typography variant={'caption'}> {option}</Typography>}
                    labelPlacement="start"
                  />
                ))}
              </FormGroup>
            </FormControl>
            <ReactSketchCanvas
              id={spine.id}
              ref={sketchToolbars.canvasRef}
              style={{
                border: 'none',
                maxWidth: '180px',
              }}
              width="180px"
              height="800px"
              strokeWidth={sketchToolbars.strokeWidth}
              strokeColor={sketchToolbars.color}
              backgroundImage={'/assets/chart-spine.png'}
              preserveBackgroundImageAspectRatio={'none'}
              withViewBox
              onChange={(updatedPaths: CanvasPath[]) => handleSpineSketchOnChange(updatedPaths)}
              readOnly={readOnly}
            />
            <FormControl>
              <FormLabel
                component="legend"
                id={'spine-label-right'}
              >
                Right
              </FormLabel>
              <FormGroup>
                {SPINE_OPTIONS.map((option) => (
                  <FormControlLabel
                    sx={{
                      p: 0,
                      mx: 0,
                    }}
                    key={`${option} R`}
                    control={
                      <Checkbox
                        sx={{
                          p: 0.2,
                          '& .MuiSvgIcon-root': { fontSize: 8 },
                        }}
                        checked={
                          Boolean(checkboxState[`${option} R`])
                            ? checkboxState[`${option} R`]
                            : false
                        }
                        onChange={handleCheckboxChange}
                        name={`${option} R`}
                      />
                    }
                    label={<Typography variant={'caption'}> {option}</Typography>}
                    labelPlacement="end"
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Stack>
        </Grid>
        <Grid
          item
          xs={readOnly ? 6 : 12}
          lg={6}
        >
          <FormControl
            fullWidth
            sx={{
              height: '100%',
              width: '100%',
            }}
          >
            <FormLabel
              sx={{
                color: 'text.primary',
                mb: 1,
              }}
            >
              Spine notes
            </FormLabel>
            {readOnly ? (
              <Box
                component={'div'}
                dangerouslySetInnerHTML={{ __html: spine.notes || '' }}
              />
            ) : (
              <OutlinedInput
                inputRef={noteRef}
                defaultValue={spine.notes}
                onChange={handleNoteChange}
                sx={{
                  height: '100%',
                  width: '100%',
                }}
                multiline
                rows={10}
                inputProps={{
                  style: {
                    height: '100%',
                  },
                }}
              />
            )}
          </FormControl>
        </Grid>
      </Grid>

      {/*Edit Spine dialog*/}
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
            <Typography variant="h6">Edit Spine</Typography>
            <IconButton
              color="inherit"
              onClick={handleCloseEditSpine}
            >
              <SvgIcon>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
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
              defaultValue={dialogData.label || 'Spine'}
              onChange={(e) =>
                setDialogData({
                  ...dialogData,
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
              Notes
            </FormLabel>
            <OutlinedInput
              defaultValue={dialogData.notes || ''}
              onChange={(e) =>
                setDialogData({
                  ...dialogData,
                  notes: e.target.value,
                })
              }
              sx={{
                height: '100%',
                width: '100%',
              }}
              multiline
              rows={10}
              inputProps={{
                style: {
                  height: '100%',
                },
              }}
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
          <Tooltip title={'Remove item'}>
            <IconButton
              size="small"
              onClick={handleDelete}
            >
              <DeleteIcon color={'error'} />
            </IconButton>
          </Tooltip>
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
              onClick={handleCloseEditSpine}
              variant={'outlined'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSpineLabel}
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
