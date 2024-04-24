import { Problem, ProblemStatus } from '@prisma/client';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';
import * as React from 'react';
import { useEffect, useState } from 'react';
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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import { Scrollbar } from '../../../components/scrollbar';
import ECTReactComponent from '../../dashboard/customer/who-icd-ect';
import { useSearchProblem } from '../../../hooks/use-search-problem';
import Typography from '@mui/material/Typography';

type Props = {
  chartId: string;
  itemId: string;
  problem: Problem;
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  removeMoveItemRef?: () => void;
  provided?: DraggableProvided;
  readOnly?: boolean;
};

export default function ProblemItem({
                                      problem,
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
  const params = useParams();
  const listQueryKey = getQueryKey(
    trpc.problem.list,
    {
      userId: params.customerId as string,
    },
    'query',
  );
  const [alertVisibility, setAlertVisibility] = useState(false);
  const mutation = trpc.problem.save.useMutation({
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
  const deleteMutation = trpc.problem.delete.useMutation({
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
        id: problem.id,
      });

      toast.success('Problem deleted successfully');
    } catch (e) {
      toast.error('Unable to delete the problem. Please try again later.');
    }
  };
  const onSave = async (key: string, value: string | number | Date | string[]) => {
    removeMoveItemRef?.();
    try {
      await mutation.mutateAsync({
        id: problem.id,
        user_id: problem.user_id,
        [key]: value,
      });
      setAlertVisibility(true);
    } catch (e) {
      toast.error('Something went wrong!');
    }
  };
  const handleInputChange = debounce((key: string, value: string | number | Date | string[]) => {
    onSave(key, value);
  }, 1000);

  const {
    searchRef,
    searchQuery,
    searchFocused,
    onChange,
    showSearchResults,
    handleSearchClickAway,
    handleSearchFocus,
    getToken,
    handleSelectProblem,
    setSearchQuery,
  } = useSearchProblem();

  useEffect(() => {
    setSearchQuery(problem.title);
  }, [problem]);

  return (
    <ChartCardItemContainer
      {...otherProps}
      readOnly={readOnly}
      title={
        <ChartCardItemTitle
          label={'Problem'}
          isLoading={mutation.isLoading}
          alertVisibility={alertVisibility}
          setAlertVisibility={setAlertVisibility}
        />
      }
      sectionLabel={'Problem'}
      handleDelete={handleDelete}
    >
      <Grid
        container
        spacing={2}
        sx={{
          p: 1,
        }}
      >
        {/* Title */}
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
              Title
            </FormLabel>
            {readOnly ? (
              <Typography variant={'body1'}>{problem.title}</Typography>
            ) : (
              <ClickAwayListener onClickAway={handleSearchClickAway}>
                <Box sx={{ mr: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Search problem or enter manually"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onChange(e, () => {
                        setSearchQuery(e.target.value);
                      })
                    }
                    onFocus={handleSearchFocus}
                    ref={searchRef}
                    autoComplete={'off'}
                    size={'small'}
                  />

                  {showSearchResults && (
                    <Popper
                      anchorEl={searchRef.current}
                      open={searchFocused}
                      placement="bottom-start"
                      sx={{ zIndex: 9999 }}
                    >
                      <Paper
                        elevation={16}
                        sx={{
                          display: 'flex',
                          borderColor: 'divider',
                          borderStyle: 'solid',
                          borderWidth: 1,
                          height: '100%',
                          minWidth: searchRef.current?.offsetWidth || 600,
                          width: '100%', // Set width to 100%
                        }}
                      >
                        <Scrollbar sx={{ maxHeight: 500, width: '100%' }}>
                          <ECTReactComponent
                            getToken={getToken}
                            value={searchQuery}
                            handleSelectProblem={(problem: any) =>
                              handleSelectProblem(problem, (problem: any) => {
                                setSearchQuery(problem.title);
                                onSave('title', problem.title);
                                onSave('code', [problem.code]);
                              })
                            }
                          />
                        </Scrollbar>
                      </Paper>
                    </Popper>
                  )}
                </Box>
              </ClickAwayListener>
            )}
          </FormControl>
        </Grid>

        {/* Dx Date */}
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
              Dx Date*
            </FormLabel>

            {readOnly ? (
              <Typography variant={'body1'}>
                {dayjs(problem.diagnostic_date).format('YYYY-MM-DD')}
              </Typography>
            ) : (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  defaultValue={dayjs(problem.diagnostic_date)}
                  onChange={(newValue) =>
                    handleInputChange('diagnostic_date', newValue ? newValue?.toDate() : new Date())
                  }
                  slotProps={{ textField: { size: 'small', variant: 'outlined', fullWidth: true } }}
                />
              </LocalizationProvider>
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
              Status
            </FormLabel>
            {readOnly ? (
              <Typography variant={'body1'}>{problem.status}</Typography>
            ) : (
              <Select
                size={'small'}
                fullWidth
                value={problem.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value={ProblemStatus.ACTIVE}>Active</MenuItem>
                <MenuItem value={ProblemStatus.CONTROLLED}>Controlled</MenuItem>
                <MenuItem value={ProblemStatus.RESOLVED}>Resolved</MenuItem>
              </Select>
            )}
          </FormControl>
        </Grid>

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
              Codes
            </FormLabel>

            {!!problem.code?.length && (
              <Typography variant={'caption'}>[{problem.code?.join(' ,')}]</Typography>
            )}
          </FormControl>
        </Grid>

        {/* Synopsis */}
        <Grid
          item
          xs={12}
        >
          <FormControl fullWidth>
            <FormLabel
              sx={{
                color: 'text.secondary',
                mb: 1,
              }}
            >
              Synopsis
            </FormLabel>

            {readOnly ? (
              <Typography variant={'body1'}>{problem.synopsis}</Typography>
            ) : (
              <TextField
                multiline
                rows={4}
                defaultValue={problem.synopsis}
                size={'small'}
                variant={'outlined'}
                fullWidth
                onChange={(e) => handleInputChange('synopsis', e.target.value)}
              />
            )}
          </FormControl>
        </Grid>
      </Grid>
    </ChartCardItemContainer>
  );
}
