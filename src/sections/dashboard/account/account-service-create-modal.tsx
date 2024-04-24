import { FC, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';
import DialogContent from '@mui/material/DialogContent';
import { DialogActions } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import InfoCircleIcon from '@mui/icons-material/InfoRounded';
import FormLabel from '@mui/material/FormLabel';
import UserAutocomplete, { AutoCompleteUser } from 'src/components/user-autocomplete';
import { ServiceWithStaff } from 'src/types/service';
import { ServiceInput, ServiceValidationSchema } from '../../../utils/zod-schemas/service';
import { User } from '@prisma/client';

interface AccountServiceCreateModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (data: ServiceInput) => void;
  isLoading: boolean;
  service?: ServiceWithStaff;
  addDisplayName: boolean;
  addDescription: boolean;
  showAddDisplayName: () => void;
  showAddDescription: () => void;
  staffOptions: User[];
  currency: string;
}

export const AccountServiceCreateModal: FC<AccountServiceCreateModalProps> = (props) => {
  const { service } = props;
  const [selectedStaffs, setSelectedStaffs] = useState<AutoCompleteUser[]>([]);

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    setValue,
    reset,
    control,
  } = useForm<ServiceInput>({
    mode: 'onChange',
    resetOptions: {
      keepIsSubmitted: false,
    },
    reValidateMode: 'onSubmit',
    resolver: zodResolver(ServiceValidationSchema),
    defaultValues: {},
  });

  const handleSelectStaff = (staffs: AutoCompleteUser[]) => {
    setSelectedStaffs(staffs);
    setValue(
      'staffIds',
      staffs.map((staff) => staff.id),
    );
  };

  const overrideOnSubmit = async (data: ServiceInput) => {
    await props.onSubmit(data);
    reset();
    setSelectedStaffs([]);
  };

  const onClose = () => {
    props.handleClose();
    reset();
    setSelectedStaffs([]);
  };

  useEffect(() => {
    setSelectedStaffs(service?.staffs.map((staff) => staff.Staff as unknown as User) || []);
    const assignStaffIds = service?.staffs.map((staff) => staff.Staff.id) || [];
    reset({
      ...service,
      code: service?.code || '',
      displayName: service?.display_name || '',
      description: service?.description || '',
      staffIds: assignStaffIds,
    });
  }, [service, props.open]);

  return (
    <Dialog open={props.open}>
      <form onSubmit={handleSubmit(overrideOnSubmit)}>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
          sx={{
            px: 2,
            py: 1,
          }}
        >
          <SvgIcon>
            <AssignmentIcon />
          </SvgIcon>
          <Typography
            sx={{ flexGrow: 1 }}
            variant="h6"
          >
            {service?.id ? 'Update ' : 'New '} Service
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
            <Grid xs={6}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Service Name*
              </Typography>
              <FormControl
                error={!!errors?.name}
                variant="standard"
                fullWidth
              >
                <OutlinedInput
                  fullWidth
                  {...register('name')}
                  aria-describedby="component-error-text"
                />
                <FormHelperText>{errors?.name?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Code
              </Typography>
              <FormControl
                variant="standard"
                fullWidth
              >
                <OutlinedInput
                  fullWidth
                  {...register('code')}
                />
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Duration
              </Typography>
              <FormControl
                error={!!errors?.duration}
                variant="standard"
                fullWidth
              >
                <OutlinedInput
                  fullWidth
                  rows={10}
                  {...register('duration')}
                  type={'number'}
                  inputProps={{
                    min: 0,
                  }}
                  endAdornment={<InputAdornment position="end">mins</InputAdornment>}
                />
                <FormHelperText>{errors?.duration?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Price
              </Typography>
              <FormControl
                error={!!errors?.price}
                variant="standard"
                fullWidth
              >
                <OutlinedInput
                  fullWidth
                  rows={10}
                  {...register('price')}
                  type={'number'}
                  inputProps={{
                    min: 0,
                    step: 0.5,
                  }}
                  startAdornment={
                    <InputAdornment position="start">{props.currency}</InputAdornment>
                  }
                />
                <FormHelperText>{errors?.price?.message}</FormHelperText>
              </FormControl>
            </Grid>
            {!props.addDisplayName ? (
              <Grid xs={6}>
                <Button
                  startIcon={
                    <SvgIcon>
                      <AddIcon />
                    </SvgIcon>
                  }
                  onClick={props.showAddDisplayName}
                >
                  Add Display Name
                </Button>
              </Grid>
            ) : (
              <Grid xs={12}>
                <Typography
                  sx={{ mb: 1 }}
                  variant="subtitle2"
                >
                  Display Name
                </Typography>
                <FormControl
                  variant="standard"
                  fullWidth
                >
                  <OutlinedInput
                    fullWidth
                    rows={10}
                    {...register('displayName')}
                  />
                </FormControl>
              </Grid>
            )}
            {!props.addDescription ? (
              <Grid xs={6}>
                <Button
                  startIcon={
                    <SvgIcon>
                      <AddIcon />
                    </SvgIcon>
                  }
                  onClick={props.showAddDescription}
                >
                  Add Description
                </Button>
              </Grid>
            ) : (
              <Grid xs={12}>
                <Typography
                  sx={{ mb: 1 }}
                  variant="subtitle2"
                >
                  Description
                </Typography>
                <FormControl
                  variant="standard"
                  fullWidth
                >
                  <OutlinedInput
                    fullWidth
                    rows={10}
                    {...register('description')}
                  />
                </FormControl>
              </Grid>
            )}

            <Grid xs={12}>
              <FormControl
                fullWidth
                error={!!errors.staffIds}
                size={'small'}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Assign Staff
                </FormLabel>
                <UserAutocomplete
                  error={false}
                  helperText=""
                  onChange={handleSelectStaff}
                  options={props.staffOptions}
                  selectedOptions={selectedStaffs}
                  label={''}
                  showAvatarColor={false}
                  size={'medium'}
                  variant={'outlined'}
                />
                <FormHelperText>{errors?.staffIds?.message}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12}>
              <Stack
                direction={'row'}
                alignItems={'center'}
                sx={{ ml: 1.5 }}
              >
                <Controller
                  control={control}
                  name="telemedicine"
                  render={({ field }) => {
                    return (
                      <FormControlLabel
                        control={
                          <Switch
                            color="primary"
                            checked={field.value || false}
                            edge="start"
                            name="telemedicine"
                            onChange={(event, val) => {
                              return field.onChange(val);
                            }}
                          />
                        }
                        label="Telemedicine"
                      />
                    );
                  }}
                />
              </Stack>
            </Grid>

            <Grid xs={12}>
              <Stack
                direction={'row'}
                alignItems={'center'}
                sx={{ ml: 1.5 }}
              >
                <Controller
                  control={control}
                  name="taxable"
                  defaultValue={service?.taxable}
                  render={({ field }) => {
                    return (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value || false}
                            color="primary"
                            edge="start"
                            onChange={(event, val) => {
                              return field.onChange(val);
                            }}
                          />
                        }
                        label="Taxable"
                      />
                    );
                  }}
                />
                <Tooltip
                  title="The service rate includes sales tax, it will be included in the generated invoice.">
                  <SvgIcon>
                    <InfoCircleIcon color={'disabled'} />
                  </SvgIcon>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            variant={'outlined'}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {service?.id ? 'Save' : 'Create new service'}
            {isSubmitting && (
              <CircularProgress
                sx={{ ml: 1 }}
                size={20}
              />
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
