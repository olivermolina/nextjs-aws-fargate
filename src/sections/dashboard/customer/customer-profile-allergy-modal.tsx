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
import CircularProgress from '@mui/material/CircularProgress';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AllergyInput, AllergyValidationSchema } from '../../../utils/zod-schemas/allergy';
import Grid from '@mui/material/Unstable_Grid2';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { trpc } from '../../../app/_trpc/client';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Allergy, AllergyStatus } from '@prisma/client';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useDeleteAllergy } from '../../../hooks/use-delete-allergy';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';

interface Props {
  userId: string;
  open: boolean;
  handleClose: () => void;
  defaultValues?: AllergyInput;
  handleNewAllergy: () => void;
}

export const CustomerProfileAllergyModal: FC<Props> = ({ userId, defaultValues, ...props }) => {
  const { data: options, refetch } = trpc.allergy.listOptions.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const [selectedOnsetDate, setSelectedOnsetDate] = useState(
    dayjs(defaultValues?.onset_date || new Date()),
  );
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(
    trpc.allergy.list,
    {
      userId,
    },
    'query',
  );

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
    register,
    setValue,
    reset,
    watch,
  } = useForm<AllergyInput>({
    resolver: zodResolver(AllergyValidationSchema),
  });

  const onClose = () => {
    props.handleClose();
  };

  const mutation = trpc.allergy.save.useMutation({
    // When mutate is called:
    onMutate: async (newAllergy) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey, {
        exact: true,
      });
      const allergy: Allergy = {
        ...newAllergy,
        name: newAllergy.name || '',
        reaction: newAllergy.reaction || '',
        status: newAllergy.status || AllergyStatus.ACTIVE,
        onset_date: newAllergy.onset_date || new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      let newData: Allergy[] = [];
      if (newAllergy.id === 'new') {
        newData =
          previousData && Array.isArray(previousData)
            ? [...(previousData as Allergy[]), allergy]
            : [allergy];
      } else {
        newData =
          previousData && Array.isArray(previousData)
            ? (previousData as Allergy[]).map((p) => {
              if (p.id === newAllergy.id) {
                return allergy;
              }
              return p;
            })
            : [allergy];
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
  const onSubmit = async (input: AllergyInput) => {
    try {
      await mutation.mutateAsync(input);
      await refetch();
      toast.success(input.id === 'new' ? 'Allergy has been added.' : 'Allergy has been updated');
      onClose();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const watchId = watch('id');
  const deleteAllergy = useDeleteAllergy(userId);

  const submit = async (saveAndAddNew: boolean) => {
    await handleSubmit(onSubmit)();
    if (!saveAndAddNew) {
      return;
    }

    reset({
      id: 'new',
      user_id: defaultValues?.user_id,
      name: '',
      reaction: '',
      status: AllergyStatus.ACTIVE,
      onset_date: new Date(),
    });

    props.handleNewAllergy();
  };

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues]);

  return (
    <Dialog open={props.open}>
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
            {defaultValues?.id === 'new' ? 'Add' : 'Edit'} Patient Allergy
          </Typography>
          <IconButton onClick={onClose}>
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
                Allergy*
              </Typography>
              <Controller
                control={control}
                name="name"
                render={({ field }) => {
                  return (
                    <Autocomplete
                      freeSolo
                      options={options?.map((option) => option.name) || []}
                      forcePopupIcon
                      onChange={(e, value) => {
                        if (value) {
                          setValue('name', value);
                        }
                      }}
                      value={field.value}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          onChange={field.onChange}
                          value={field.value}
                          variant={'outlined'}
                          size={'small'}
                          error={Boolean(errors.name)}
                          helperText={errors.name?.message}
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>
            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Reaction
              </Typography>
              <OutlinedInput
                fullWidth
                {...register('reaction')}
              />
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
                      <MenuItem value={AllergyStatus.ACTIVE}>Active</MenuItem>
                      <MenuItem value={AllergyStatus.INACTIVE}>Inactive</MenuItem>
                      <MenuItem value={AllergyStatus.RESOLVED}>Resolve</MenuItem>
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
                Onset Date
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={selectedOnsetDate}
                  onChange={(newValue) => {
                    const newDate = newValue ?? dayjs();
                    setSelectedOnsetDate(newDate);
                    setValue('onset_date', newDate.toDate());
                  }}
                  slotProps={{ textField: { size: 'small', variant: 'outlined', fullWidth: true } }}
                />
              </LocalizationProvider>
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
            disabled={isSubmitting || deleteAllergy.mutation.isLoading}
            onClick={() => submit(false)}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            disabled={isSubmitting || deleteAllergy.mutation.isLoading}
            onClick={() => submit(true)}
          >
            Save and add another
          </Button>
          <Button
            variant="outlined"
            onClick={() => deleteAllergy.onDiscard(watchId, onClose)}
            disabled={deleteAllergy.mutation.isLoading || mutation.isLoading}
          >
            Discard
          </Button>
          {(isSubmitting || deleteAllergy.mutation.isLoading) && (
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
