import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import React, { useCallback, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Skeleton } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import { useForm } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';
import { trpc } from '../../../app/_trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import InfoIcon from '@mui/icons-material/Info';
import { SrFaxInput, SrFaxValidationSchema } from '../../../utils/zod-schemas/srfax';

type Props = {
  hasEditAccess: boolean;
};

export default function AccountOrganizationFaxCard({ hasEditAccess }: Props) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const mutation = trpc.extension.saveSrFaxSettings.useMutation();
  const { data, isLoading, refetch } = trpc.extension.getSrFaxSettings.useQuery();
  const toggleEditMode = () => setEditMode(!editMode);

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    reset,
  } = useForm<SrFaxInput>({
    mode: 'onBlur',
    resolver: zodResolver(SrFaxValidationSchema),
    defaultValues: {
      account_number: '',
      access_password: '',
      fax_number: useMemo(() => data?.fax_number || '', [data?.fax_number]),
    },
  });

  const onSubmit = useCallback(
    async (input: SrFaxInput) => {
      try {
        await mutation.mutateAsync(input);
        await refetch();
        setEditMode(false);
        reset({
          account_number: '',
          access_password: '',
          fax_number: input.fax_number,
        });
        toast.success('eFax settings updated');
      } catch (e) {
        toast.error(e.message);
      }
    },
    [],
  );

  return (
    <>
      <Card sx={{
        minHeight: 400,
      }}>
        <CardHeader
          title={
            <Stack spacing={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600 }}
              >
                eFax
              </Typography>
              <Typography variant={'caption'}>Send and receive faxes online</Typography>
              <Stack
                direction={'row'}
                justifyContent="flex-start"
                alignItems="center"
                spacing={2}
                sx={{ backgroundColor: '#ece6fb', p: 1, borderRadius: 0.5 }}
              >
                <InfoIcon color={'primary'} />
                <Typography variant={'caption'}>
                  eFax is a service that lets you send and receive faxes online. You can use it to
                  send and receive faxes from your computer, tablet, or smartphone.
                </Typography>
              </Stack>
            </Stack>
          }
          action={
            hasEditAccess && (
              <Button onClick={toggleEditMode}>
                <Typography
                  sx={{
                    color: (theme) => theme.palette.primary.main,
                    textTransform: 'none',
                  }}
                  variant={'button'}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Typography>
              </Button>
            )
          }
        />
        <CardContent>
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            id={'efax-form'}
          >
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                lg={4}
                item
              >
                <FormControl
                  error={editMode && !!errors?.account_number}
                  variant="standard"
                  fullWidth
                >
                  <FormLabel
                    sx={{
                      color: 'text.primary.light',
                      mb: 1,
                    }}
                  >
                    SRFax Account Number {editMode && '*'}
                  </FormLabel>
                  {isLoading ? (
                    <Skeleton sx={{ width: '50%' }} />
                  ) : editMode ? (
                    <>
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('account_number')}
                        aria-describedby="component-error-text"
                        placeholder={data?.account_number}
                      />
                      <FormHelperText>{errors?.account_number?.message}</FormHelperText>
                    </>
                  ) : (
                    <Typography>{data?.account_number || '-'} </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid
                xs={12}
                lg={4}
                item
              >
                <FormControl
                  error={editMode && !!errors?.access_password}
                  variant="standard"
                  fullWidth
                >
                  <FormLabel
                    sx={{
                      color: 'text.primary.light',
                      mb: 1,
                    }}
                  >
                    SRFax Password {editMode && '*'}
                  </FormLabel>
                  {isLoading ? (
                    <Skeleton sx={{ width: '50%' }} />
                  ) : editMode ? (
                    <>
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('access_password')}
                        aria-describedby="component-error-text"
                        placeholder={'******'}
                      />
                      <FormHelperText>{errors?.access_password?.message}</FormHelperText>
                    </>
                  ) : (
                    <Typography> {data?.account_number ? '**********' : '-'} </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid
                xs={12}
                lg={4}
                item
              >
                <FormControl
                  error={editMode && !!errors?.fax_number}
                  variant="standard"
                  fullWidth
                >
                  <FormLabel
                    sx={{
                      color: 'text.primary.light',
                      mb: 1,
                    }}
                  >
                    SRFax # {editMode && '*'}
                  </FormLabel>
                  {isLoading ? (
                    <Skeleton sx={{ width: '50%' }} />
                  ) : editMode ? (
                    <>
                      <OutlinedInput
                        size={'small'}
                        fullWidth
                        {...register('fax_number')}
                        aria-describedby="component-error-text"
                        type={'number'}
                      />

                      <FormHelperText>{errors?.fax_number?.message}</FormHelperText>
                    </>
                  ) : (
                    <Typography> {data?.fax_number || '-'} </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            {editMode && (
              <Stack direction="row-reverse">
                <Button
                  sx={{ mt: 3, width: 100 }}
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  Save
                  {isSubmitting && (
                    <CircularProgress
                      sx={{ ml: 1 }}
                      size={20}
                    />
                  )}
                </Button>
              </Stack>
            )}
          </form>
        </CardContent>
      </Card>
    </>
  );
}
