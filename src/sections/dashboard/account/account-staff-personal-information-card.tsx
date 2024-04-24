import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { trpc } from 'src/app/_trpc/client';
import toast from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';
import { UpdateUserInput } from '../../../utils/zod-schemas/user';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import z from 'zod';
import Typography from '@mui/material/Typography';

const StaffInformationValidationSchema = z.object({
  id: z.string().min(1, { message: 'ID is required.' }),
  first_name: z.string().min(1, { message: 'First name is required.' }),
  last_name: z.string().min(1, { message: 'Last name is required.' }),
  phone: z.string().optional(),
  email: z
    .string()
    .email({
      message: 'Invalid email. Please enter a valid email address.',
    })
    .optional(),
});

const useStaff = (staffId: string, refetchMembers: any) => {
  const mutation = trpc.user.update.useMutation();

  const {
    formState: { isSubmitting, errors },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<UpdateUserInput>({
    mode: 'onChange',
    resetOptions: {
      keepIsSubmitted: false,
    },
    reValidateMode: 'onSubmit',
    resolver: zodResolver(StaffInformationValidationSchema),
  });

  const [edit, setEdit] = useState(false);

  const toggleEdit = () => {
    setEdit((prevState) => !prevState);
  };

  const {
    data: staff,
    isLoading,
    refetch,
  } = trpc.user.get.useQuery({
    id: staffId,
  }, {
    refetchOnWindowFocus: false,
  });

  const onSubmit = async (data: UpdateUserInput) => {
    try {
      await mutation.mutateAsync(data);
      refetchMembers();
      await refetch();
      toast.success('Successfully updated staff details.');
      toggleEdit();
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    reset({
      id: staff?.id,
      first_name: staff?.first_name || '',
      last_name: staff?.last_name || '',
      email: staff?.email || '',
      phone: staff?.phone || '',
    });
  }, [staff]);

  return {
    edit,
    toggleEdit,
    staff,
    isLoading,
    register,
    handleSubmit,
    isSubmitting,
    control,
    onSubmit,
    errors,
  };
};

interface AccountStaffPersonalInformationCardProps {
  staffId: string;
  refetchMembers: any;
}

export default function AccountStaffPersonalInformationCard(
  props: AccountStaffPersonalInformationCardProps
) {
  const {
    edit,
    toggleEdit,
    staff,
    handleSubmit,
    onSubmit,
    isSubmitting,
    errors,
    register,
  } = useStaff(props.staffId, props.refetchMembers);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader
          title={'Personal Information'}
          action={<Button onClick={toggleEdit}>{edit ? 'Cancel' : 'Edit'}</Button>}
        />
        <CardContent>
          <Grid
            container
            spacing={2}
          >
            <Grid
              xs={6}
              item
            >
              <FormControl
                fullWidth
                error={!!errors.first_name}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  First Name{edit && '*'}
                </FormLabel>
                {edit ? (
                  <OutlinedInput {...register('first_name')} />
                ) : (
                  <Typography variant={'body2'}>{staff?.first_name || '-'}</Typography>
                )}
                <FormHelperText>{errors?.first_name?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid
              xs={6}
              item
            >
              <FormControl
                fullWidth
                error={!!errors.last_name}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Last Name{edit && '*'}
                </FormLabel>
                {edit ? (
                  <OutlinedInput {...register('last_name')} />
                ) : (
                  <Typography variant={'body2'}>{staff?.last_name || '-'}</Typography>
                )}

                <FormHelperText>{errors?.last_name?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid
              xs={6}
              item
            >
              <FormControl
                fullWidth
                error={!!errors.email}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Email
                </FormLabel>
                {edit ? (
                  <OutlinedInput
                    {...register('email')}
                    disabled
                  />
                ) : (
                  <Typography variant={'body2'}>{staff?.email || '-'}</Typography>
                )}

                <FormHelperText>{errors?.email?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid
              xs={6}
              item
            >
              <FormControl
                fullWidth
                error={!!errors.phone}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Phone Number
                </FormLabel>
                {edit ? (
                  <OutlinedInput
                    type="tel"
                    {...register('phone')}
                  />
                ) : (
                  <Typography variant={'body2'}>{staff?.phone || '-'}</Typography>
                )}

                <FormHelperText>{errors?.phone?.message}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>

        {edit && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
            }}
          >
            <Button
              type={'submit'}
              size="small"
              variant={'contained'}
              disabled={isSubmitting}
            >
              Save{' '}
              {isSubmitting && (
                <CircularProgress
                  sx={{ ml: 1 }}
                  size={20}
                />
              )}
            </Button>
          </Box>
        )}
      </Card>
    </form>
  );
}
