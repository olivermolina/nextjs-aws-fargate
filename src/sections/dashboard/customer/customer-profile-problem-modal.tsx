import React, { FC, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { DialogActions } from '@mui/material';
import ECTReactComponent from './who-icd-ect';
import { trpc } from '../../../app/_trpc/client';
import { Scrollbar } from '../../../components/scrollbar';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import TextField from '@mui/material/TextField';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProblemInput, ProblemValidationSchema } from '../../../utils/zod-schemas/problem';
import { Problem, ProblemStatus } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import toast from 'react-hot-toast';
import { useDeleteProblem } from '../../../hooks/use-delete-problem';
import CircularProgress from '@mui/material/CircularProgress';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Grid from '@mui/material/Unstable_Grid2';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useSearchProblem } from '../../../hooks/use-search-problem';

interface Props {
  userId: string;
  open: boolean;
  handleClose: () => void;
  defaultValues?: any;
  handleNew: () => void;
}

export const CustomerProfileProblemModal: FC<Props> = ({ userId, defaultValues, ...props }) => {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(
    trpc.problem.list,
    {
      userId,
    },
    'query',
  );
  const [selectedDiagnosticDate, setSelectedDiagnosticDate] = useState(
    dayjs(defaultValues?.diagnostic_date || new Date()),
  );

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
    register,
    setValue,
    reset,
    watch,
  } = useForm<ProblemInput>({
    resolver: zodResolver(ProblemValidationSchema),
  });

  const onClose = () => {
    props.handleClose();
  };

  const mutation = trpc.problem.save.useMutation({
    // When mutate is called:
    onMutate: async (newProblem) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey, {
        exact: true,
      });
      1;
      const problem: Problem = {
        ...newProblem,
        title: newProblem.title || '',
        synopsis: newProblem.synopsis || '',
        status: newProblem.status || ProblemStatus.ACTIVE,
        code: [],
        diagnostic_date: newProblem.diagnostic_date || new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      let newData: Problem[] = [];
      if (newProblem.id === 'new') {
        newData =
          previousData && Array.isArray(previousData)
            ? [...(previousData as Problem[]), problem]
            : [problem];
      } else {
        newData =
          previousData && Array.isArray(previousData)
            ? (previousData as Problem[]).map((p) => {
              if (p.id === newProblem.id) {
                return problem;
              }
              return p;
            })
            : [problem];
      }
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newData);

      // // Return a context object with the snapshotted value
      return { previousData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const onSubmit = async (input: ProblemInput) => {
    try {
      await mutation.mutateAsync(input);
      toast.success(
        input.id === 'new' ? 'New diagnosis has been added.' : 'Diagnosis problem has been updated',
      );
      onClose();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const watchId = watch('id');
  const deleteProblem = useDeleteProblem(userId);

  const submit = async (saveAndAddNew: boolean) => {
    await handleSubmit(onSubmit)();
    if (!saveAndAddNew) {
      return;
    }

    reset({
      id: 'new',
      user_id: defaultValues?.user_id,
      title: '',
      synopsis: '',
      status: ProblemStatus.ACTIVE,
      diagnostic_date: new Date(),
    });

    props.handleNew();
  };

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
    if (defaultValues) {
      reset(defaultValues);
      setSearchQuery(defaultValues.title);
      setSelectedDiagnosticDate(dayjs(defaultValues.diagnostic_date));
    }
  }, [defaultValues]);

  return (
    <Dialog
      open={props.open}
      fullWidth
      maxWidth={'md'}
    >
      <form>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
          sx={{
            px: 2,
            py: 1,
          }}
        >
          <Typography
            sx={{ flexGrow: 1 }}
            variant="h6"
          >
            {defaultValues?.id === 'new' ? 'Add' : 'Edit'} Patient Problem
          </Typography>
          <IconButton onClick={props.handleClose}>
            <SvgIcon>
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
        <DialogContent>
          <Grid
            container
            spacing={3}
          >
            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Title*
              </Typography>
              <ClickAwayListener onClickAway={handleSearchClickAway}>
                <Box sx={{ mr: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Search problem or enter manually"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onChange(e, () => {
                        setValue('title', e.target.value);
                      })
                    }
                    onFocus={handleSearchFocus}
                    ref={searchRef}
                    autoComplete={'off'}
                    helperText={errors.title?.message}
                    error={Boolean(errors.title)}
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
                              handleSelectProblem(problem, () => {
                                setValue('title', problem.title);
                                setValue('code', [problem.code]);
                              })
                            }
                          />
                        </Scrollbar>
                      </Paper>
                    </Popper>
                  )}
                </Box>
              </ClickAwayListener>
            </Grid>
            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Dx Date*
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={selectedDiagnosticDate}
                  onChange={(newValue) => {
                    const newDate = newValue ?? dayjs();
                    setSelectedDiagnosticDate(newDate);
                    setValue('diagnostic_date', newDate.toDate());
                  }}
                  slotProps={{ textField: { size: 'small', variant: 'outlined', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Status
              </Typography>
              <Controller
                name={'status'}
                control={control}
                render={({ field }) => {
                  return (
                    <Select
                      fullWidth
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <MenuItem value={ProblemStatus.ACTIVE}>Active</MenuItem>
                      <MenuItem value={ProblemStatus.CONTROLLED}>Controlled</MenuItem>
                      <MenuItem value={ProblemStatus.RESOLVED}>Resolve</MenuItem>
                    </Select>
                  );
                }}
              />
            </Grid>

            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Synopsis
              </Typography>
              <OutlinedInput
                fullWidth
                multiline
                rows={4}
                {...register('synopsis')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Button
            variant="contained"
            disabled={isSubmitting || deleteProblem.mutation.isLoading}
            onClick={() => submit(false)}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            disabled={isSubmitting || deleteProblem.mutation.isLoading}
            onClick={() => submit(true)}
          >
            Save and add another
          </Button>
          <Button
            variant="outlined"
            onClick={() => deleteProblem.onDiscard(watchId, onClose)}
            disabled={deleteProblem.mutation.isLoading || mutation.isLoading}
          >
            Discard
          </Button>
          {(isSubmitting || deleteProblem.mutation.isLoading) && (
            <CircularProgress
              sx={{ ml: 1 }}
              size={20}
            />
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};
