import { BodyChart } from '@prisma/client';
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
import Box from '@mui/material/Box';
import debounce from 'lodash.debounce';
import { CanvasPath } from 'react-sketch-canvas/src/types';
import { compress, decompress } from 'compress-json';
import { Scrollbar } from '../../../components/scrollbar';
import { useTheme } from '@mui/material/styles';
import ImageIcon from '@mui/icons-material/Image';
import { useFileInput } from '../../../hooks/use-file-input';
import { FileInput } from '../../../utils/zod-schemas/file-upload';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useSketchToolbars } from '../../../hooks/use-sketch-toolbars';
import SketchToolbars from './sketch-toolbars';
import BodyChartPoint from './body-chart-point';
import { newObjectId } from '../../../utils/new-object-id';
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

type BodyChartPointType = {
  id: string;
  x: number;
  y: number;
  notes: string;
};

type Props = {
  chartId: string;
  itemId: string;
  bodyChart: BodyChart & {
    signedUrl?: string | null;
  };
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  removeMoveItemRef?: () => void;
  provided?: DraggableProvided;
  readOnly?: boolean;
  printMode?: boolean;
};

export default function BodyChartItem({
                                        bodyChart,
                                        chartId,
                                        itemId,
                                        removeMoveItemRef,
                                        readOnly,
                                        printMode,
                                        ...otherProps
                                      }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const { handleFileInput, fileInput, setFileInput } = useFileInput();
  const imageInputFileRef = React.useRef<HTMLInputElement>(null);
  const imageDialogInputFileRef = React.useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(
    trpc.chart.get,
    {
      id: chartId,
    },
    'query',
  );
  const [pointListItems, setPointListItems] = useState<BodyChartPointType[]>([]);
  const [isPathsLoaded, setIsPathsLoaded] = useState(false);
  const theme = useTheme();
  const [alertVisibility, setAlertVisibility] = useState(false);
  const dialog = useDialog<any>();
  const mutation = trpc.chart.saveBodyChart.useMutation({
    // When mutate is called:
    onMutate: async (newData) => {
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
              BodyChart: {
                ...item.BodyChart,
                ...newData,
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
  const deleteMutation = trpc.chart.deleteBodyChart.useMutation({
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
  const onSave = async (value: string, image?: FileInput) => {
    if (readOnly) return;
    removeMoveItemRef?.();
    try {
      await mutation.mutateAsync({
        id: bodyChart.id,
        canvas: value,
        image,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };
  const handleEditSketch = async () => {
    removeMoveItemRef?.();
    setBackgroundImage(dialog.data?.image || '/assets/body-chart.png');
    dialog.handleClose();
    try {
      await mutation.mutateAsync({
        id: bodyChart.id,
        label: dialog.data?.label,
        image: fileInput || {
          name: 'sketch-image',
          size: 0,
          type: 'image/png',
          base64: '/assets/body-chart.png',
        },
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };
  const handleCloseEditSketch = () => {
    setFileInput(null);
    dialog.handleClose();
  };
  const handleDelete = async () => {
    removeMoveItemRef?.();
    try {
      await deleteMutation.mutateAsync({
        id: bodyChart.id,
      });

      toast.success('Sketch deleted successfully');
    } catch (e) {
      toast.error('Unable to delete sketch. Please try again later.');
    }
  };
  const sketchToolbars = useSketchToolbars();
  const handleSketchOnChange = debounce((updatedPaths: CanvasPath[]) => {
    // Ignore the initial load on change
    setIsPathsLoaded(true);
    if (!isPathsLoaded) {
      return;
    }
    const compressedPaths = JSON.stringify(compress(updatedPaths));
    onSave(compressedPaths);
  }, 1000);
  const [backgroundImage, setBackgroundImage] = useState('/assets/body-chart.png');
  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileInput(e, async (file: FileInput) => {
      if (file.base64) {
        setBackgroundImage(file.base64);
        const canvasPaths = (await sketchToolbars.canvasRef.current?.exportPaths()) || [];
        const compressedPaths = JSON.stringify(compress(canvasPaths));
        onSave(compressedPaths, file);
      }
    });
  };

  const handleDialogBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileInput(e, async (file: FileInput) => {
      if (file.base64) {
        dialog.handleOpen({
          ...dialog.data,
          image: file.base64,
        });
      }
    });
  };

  const clearBackgroundImage = () => {
    setFileInput(null);
    dialog.handleOpen({
      ...dialog.data,
      image: '/assets/body-chart.png',
    });
  };

  const loadCanvas = useCallback(() => {
    sketchToolbars.setTool('pointer');
    if (bodyChart.canvas) {
      sketchToolbars.canvasRef.current?.loadPaths(decompress(JSON.parse(bodyChart.canvas)));
    }

    if (bodyChart.signedUrl) {
      setBackgroundImage(bodyChart.signedUrl);
    }
    setPointListItems(bodyChart.points as BodyChartPointType[]);
  }, [bodyChart.canvas]);

  const handleClickCanvas = async (event: React.MouseEvent) => {
    if (readOnly) return;

    removeMoveItemRef?.();
    if (isDragging) {
      event.stopPropagation();
      return;
    }

    if (sketchToolbars.tool !== 'pointer') return;

    const boundingRect = event.currentTarget.getBoundingClientRect();
    const x = boundingRect.x;
    const y = boundingRect.y;
    // Get the x and y coordinates of the click
    const clientX = event.clientX;
    const clientY = event.clientY;
    const xCoordinate = clientX - x - 15;
    const yCoordinate = clientY - y - 15;

    const newPoints = [
      ...(bodyChart.points as BodyChartPointType[]),
      {
        id: newObjectId(),
        x: xCoordinate,
        y: yCoordinate,
        notes: '',
      },
    ];
    setPointListItems(newPoints);
    try {
      await mutation.mutateAsync({
        id: bodyChart.id,
        points: newPoints as BodyChartPointType[],
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };

  const onSavePosition = async (position: { x: number; y: number }, id: string) => {
    removeMoveItemRef?.();
    const points = bodyChart.points as BodyChartPointType[];
    // Update the point
    const newPoints = points.map((point) => {
      if (point.id === id) {
        return {
          ...point,
          x: position.x,
          y: position.y,
        };
      }

      return point;
    });

    // Timeout to prevent the sketch from being saved multiple times
    setTimeout(() => {
      setIsDragging(false);
    }, 1500);

    try {
      await mutation.mutateAsync({
        id: bodyChart.id,
        points: newPoints as BodyChartPointType[],
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };

  const debounceSavePointNotes = debounce(async (newPoints: BodyChartPointType[]) => {
    removeMoveItemRef?.();
    try {
      await mutation.mutateAsync({
        id: bodyChart.id,
        points: newPoints,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  }, 1000);

  const noteOnChange = (pointId: string, notes: string) => {
    setPointListItems((prevState) => {
      const newPoints = prevState.map((p) => {
        if (p.id === pointId) {
          return {
            ...p,
            notes: notes,
          };
        }
        return p;
      });
      debounceSavePointNotes(newPoints);
      return newPoints;
    });
  };

  const handleRemovePoint = async (id: string) => {
    removeMoveItemRef?.();
    const points = bodyChart.points as BodyChartPointType[];
    // Remove the point
    const newPoints = points.filter((point) => point.id !== id);
    setPointListItems(newPoints);
    try {
      await mutation.mutateAsync({
        id: bodyChart.id,
        points: newPoints,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };

  useEffect(() => {
    loadCanvas();
  }, []);

  return (
    <ChartCardItemContainer
      {...otherProps}
      readOnly={readOnly}
      title={
        <ChartCardItemTitle
          label={bodyChart.label || 'Sketch'}
          isLoading={mutation.isLoading}
          alertVisibility={alertVisibility}
          setAlertVisibility={setAlertVisibility}
          handleOpen={
            readOnly
              ? undefined
              : () =>
                dialog.handleOpen({
                  image: backgroundImage,
                  label: bodyChart.label,
                })
          }
        />
      }
      sectionLabel={bodyChart.label || 'Sketch'}
      handleDelete={handleDelete}
      handleEdit={
        readOnly
          ? undefined
          : () =>
            dialog.handleOpen({
              image: backgroundImage,
              label: bodyChart.label,
            })
      }
    >
      <Grid
        container
        direction={'row'}
      >
        {!readOnly && (
          <Grid
            item
            xs={2}
            sm={1}
          >
            <SketchToolbars
              sketchToolbars={sketchToolbars}
              showPointerTool
            />
          </Grid>
        )}

        <Grid
          item
          xs={printMode ? 12 : 10}
          sm={printMode ? 12 : 11}
          sx={{
            px: printMode ? 1 : 0,
          }}
        >
          {printMode ? (
            <Box>
              {/* Body chart points */}
              {(bodyChart.points as BodyChartPointType[])?.map((point, index) => (
                <BodyChartPoint
                  key={point.id}
                  id={point.id}
                  positionIndex={index}
                  defaultPosition={{
                    x: point.x,
                    y: point.y,
                  }}
                  readOnly={readOnly}
                />
              ))}

              <ReactSketchCanvas
                id={bodyChart.id}
                ref={sketchToolbars.canvasRef}
                style={{
                  border: `0.0625rem solid ${theme.palette.neutral[200]}`,
                  borderRadius: '0.25rem',
                }}
                readOnly={sketchToolbars.tool === 'pointer' || readOnly}
                width="780px"
                height="580px"
                strokeWidth={sketchToolbars.strokeWidth}
                strokeColor={sketchToolbars.color}
                backgroundImage={backgroundImage}
                preserveBackgroundImageAspectRatio={'none'}
                withViewBox
                onChange={(updatedPaths: CanvasPath[]) => handleSketchOnChange(updatedPaths)}
              />
            </Box>
          ) : (
            <Scrollbar
              sx={{
                maxHeight: '600px',
                maxWidth: '800px',
                border: `0.0625rem solid ${theme.palette.neutral[200]}`,
                borderRadius: '0.25rem',
                p: 1,
                position: 'relative',
              }}
              onClick={handleClickCanvas}
            >
              {/* Body chart points */}
              {(bodyChart.points as BodyChartPointType[])?.map((point, index) => (
                <BodyChartPoint
                  key={point.id}
                  id={point.id}
                  positionIndex={index}
                  onStart={() => setIsDragging(true)}
                  onSavePosition={onSavePosition}
                  defaultPosition={{
                    x: point.x,
                    y: point.y,
                  }}
                  readOnly={readOnly}
                />
              ))}

              <ReactSketchCanvas
                id={bodyChart.id}
                ref={sketchToolbars.canvasRef}
                style={{
                  border: 'none',
                }}
                readOnly={sketchToolbars.tool === 'pointer' || readOnly}
                width="780px"
                height="580px"
                strokeWidth={sketchToolbars.strokeWidth}
                strokeColor={sketchToolbars.color}
                backgroundImage={backgroundImage}
                preserveBackgroundImageAspectRatio={'none'}
                withViewBox
                onChange={(updatedPaths: CanvasPath[]) => handleSketchOnChange(updatedPaths)}
              />
            </Scrollbar>
          )}
        </Grid>
        <Grid
          item
          xs={2}
          sm={1}
        />
        {!readOnly && (
          <Grid item>
            <input
              ref={imageInputFileRef}
              type={'file'}
              name={'sketch-image'}
              id="image-file-button"
              value={''}
              onChange={handleBackgroundImageChange}
              style={{
                display: 'none',
              }}
              accept="image/*"
            />
            <label htmlFor="image-file-button">
              <Button
                variant={'outlined'}
                startIcon={<ImageIcon />}
                sx={{
                  borderColor: theme.palette.neutral[200],
                  color: 'inherit',
                  '&:hover': {
                    borderColor: theme.palette.neutral[400],
                  },
                  mt: 1,
                }}
                onClick={() => imageInputFileRef.current?.click()}
              >
                Change Image
              </Button>
            </label>
          </Grid>
        )}
        <Grid
          item
          xs={12}
        >
          <List sx={{ mt: 1, width: '100%' }}>
            <TransitionGroup>
              {pointListItems.map((point, index) => (
                <Collapse
                  key={point.id}
                  timeout={500}
                  easing={'ease-in-out'}
                >
                  <ListItem>
                    <Stack
                      direction={'row'}
                      alignItems={'start'}
                      sx={{
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: (theme) => theme.palette.primary.main,
                          color: (theme) => theme.palette.primary.contrastText,
                          borderRadius: '50%', // This makes the box appear as a circle
                          width: 25, // Specify a fixed width
                          height: 25, // Specify a fixed height
                          display: 'flex', // Set display to flex
                          justifyContent: 'center', // Center items horizontally
                          alignItems: 'center', // Center items vertically
                        }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {index + 1}
                      </Box>
                      <FormControl
                        fullWidth
                        sx={{
                          mx: 1,
                        }}
                      >
                        {readOnly ? (
                          <Box
                            component={'div'}
                            dangerouslySetInnerHTML={{ __html: point.notes || '' }}
                          />
                        ) : (
                          <OutlinedInput
                            id={`point-${point.id}`}
                            sx={{
                              width: '100%',
                            }}
                            placeholder={'Notes'}
                            defaultValue={point.notes}
                            onChange={(e) => noteOnChange(point.id, e.target.value)}
                            multiline
                            rows={3}
                          />
                        )}
                      </FormControl>
                      {!readOnly && (
                        <IconButton
                          size={'small'}
                          onClick={() => handleRemovePoint(point.id)}
                        >
                          <SvgIcon fontSize={'small'}>
                            <XIcon />
                          </SvgIcon>
                        </IconButton>
                      )}
                    </Stack>
                  </ListItem>
                </Collapse>
              ))}
            </TransitionGroup>
          </List>
        </Grid>
      </Grid>

      {/*Edit Sketch dialog*/}
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
            <Typography variant="h6">Edit Body Chart</Typography>
            <IconButton
              color="inherit"
              onClick={handleCloseEditSketch}
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
              defaultValue={dialog.data?.label || 'Sketch'}
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
              Default Image
            </FormLabel>
            <img
              src={dialog.data?.image || '/assets/body-chart.png'}
              alt={'Sketch Image'}
              style={{
                width: '100%',
                height: '450px',
                borderRadius: '0.25rem',
                border: `2px dotted ${theme.palette.neutral[400]}`,
                padding: 2,
              }}
            />
            <Box
              sx={{
                pt: 1,
              }}
            >
              <input
                ref={imageDialogInputFileRef}
                type={'file'}
                name={'sketch-image'}
                id="image-file-button-dialog"
                value={''}
                onChange={handleDialogBackgroundImageChange}
                style={{
                  display: 'none',
                }}
                accept="image/*"
              />
              <label htmlFor="image-file-button-dialog">
                <Button
                  variant={'outlined'}
                  startIcon={<ImageIcon />}
                  sx={{
                    borderColor: theme.palette.neutral[200],
                    color: 'inherit',
                    '&:hover': {
                      borderColor: theme.palette.neutral[400],
                    },
                  }}
                  onClick={() => imageDialogInputFileRef.current?.click()}
                >
                  Choose File
                </Button>
              </label>
              <Tooltip title={'Remove File'}>
                <IconButton
                  onClick={clearBackgroundImage}
                  size={'small'}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize={'inherit'} />
                </IconButton>
              </Tooltip>
            </Box>
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
              onClick={handleCloseEditSketch}
              variant={'outlined'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSketch}
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
