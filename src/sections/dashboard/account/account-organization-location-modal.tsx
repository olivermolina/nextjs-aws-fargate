import * as React from 'react';
import { useEffect } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { LocationInput, LocationSchema } from '../../../utils/zod-schemas/location';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MenuItem from '@mui/material/MenuItem';
import { LocationType } from '@prisma/client';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Stack from '@mui/material/Stack';

export interface Props {
  open: boolean;
  handleClose: () => void;
  isLoading: boolean;
  location?: LocationInput;
  onSubmit: (data: LocationInput) => void;
  handleDelete: (id: string) => void;
}

export default function AccountOrganizationLocationModal(props: Props) {
  const { handleClose, open, onSubmit, isLoading, location, handleDelete } = props;

  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<LocationInput>({
    resolver: zodResolver(LocationSchema),
  });

  useEffect(() => {
    if (location) {
      reset(location);
    }
  }, [location]);

  return (
    <Dialog
      maxWidth="sm"
      open={open}
      fullWidth
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 1,
          }}
        >
          {location?.id === 'new' ? <AddLocationAltIcon /> : <EditLocationAltIcon />}
          <Typography
            sx={{
              flexGrow: 1,
            }}
            variant={'h6'}
          >
            {location?.id === 'new' ? 'Create a new location' : 'Edit location'}
          </Typography>

          <IconButton onClick={handleClose}>
            <SvgIcon>
              <CloseIcon />
            </SvgIcon>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              xs={6}
            >
              <FormControl
                fullWidth
                error={!!errors?.type}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Location Type
                </FormLabel>
                <Controller
                  control={control}
                  name="type"
                  defaultValue={LocationType.IN_PERSON}
                  render={({ field }) => {
                    return (
                      <TextField
                        aria-describedby="component-error-text"
                        variant={'outlined'}
                        select
                        value={field.value}
                        onChange={field.onChange}
                        fullWidth
                        error={!!errors.type}
                        helperText={errors.type?.message}
                      >
                        <MenuItem value={LocationType.IN_PERSON}>
                          <Stack
                            direction="row"
                            alignItems={'center'}
                            spacing={1}
                          >
                            <LocationOnIcon />
                            <Typography>In-person meeting</Typography>
                          </Stack>
                        </MenuItem>
                      </TextField>
                    );
                  }}
                />
                <FormHelperText>{errors?.type?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={6}
            >
              <FormControl
                fullWidth
                error={!!errors?.display_name}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Display Name *
                </FormLabel>
                <OutlinedInput {...register('display_name')} />
                <FormHelperText>{errors?.display_name?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
            >
              <FormControl
                fullWidth
                error={!!errors?.value}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Physical Address *
                </FormLabel>
                <OutlinedInput {...register('value')} />
                <FormHelperText>{errors?.value?.message}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            gap: 1,
            padding: 2,
          }}
        >
          <Button
            autoFocus
            onClick={() => handleDelete(location?.id || '')}
            variant={'outlined'}
            color={'error'}
            disabled={isLoading}
          >
            Delete
          </Button>
          <Typography
            sx={{
              flexGrow: 1,
            }}
          />
          {isLoading && (
            <CircularProgress
              sx={{ ml: 1 }}
              size={20}
            />
          )}
          <Button
            autoFocus
            onClick={handleClose}
            variant={'outlined'}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type={'submit'}
            variant={'contained'}
            color={'primary'}
            disabled={isLoading}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
