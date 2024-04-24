import React, { FC, useEffect, useState } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import UserAutocomplete, { AutoCompleteUser } from 'src/components/user-autocomplete';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { InvoiceCreateItemsTable } from './invoice-create-items-table';
import { useServiceStore } from 'src/hooks/use-services-store';
import { findIndex } from 'lodash';
import {
  InvoiceCreateInput,
  InvoiceCreateValidationSchema,
  InvoiceItemInput,
} from 'src/utils/zod-schemas/invoice';
import { useRouter } from 'src/hooks/use-router';
import { paths } from 'src/paths';
import UserAvatar from '../../../components/user-avatar';
import { User } from '@prisma/client';

interface InvoiceCreateDialogProps {
  open: boolean;
  handleClose: () => void;
  patient?: User;
  staff?: User;
  onSubmit: (data: InvoiceCreateInput) => Promise<any>;
  isLoading: boolean;
  staffOptions: User[];
  patientOptions: User[];
  invoiceNumber?: string;
}

export const InvoiceCreateDialog: FC<InvoiceCreateDialogProps> = (props) => {
  const router = useRouter();
  const serviceStore = useServiceStore();
  const { patient, staff, staffOptions, patientOptions, invoiceNumber } = props;
  const [selectedIssueDate, setSelectedIssueDate] = useState(dayjs());
  const [selectedDueDate, setSelectedDueDate] = useState(dayjs());
  const [selectedStaffs, setSelectedStaffs] = useState<AutoCompleteUser[]>([]);
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    setValue,
    reset,
    control,
  } = useForm<InvoiceCreateInput>({
    resolver: zodResolver(InvoiceCreateValidationSchema),
    defaultValues: {
      patientId: patient?.id,
      staffIds: staff ? [staff?.id] : [],
      issueDate: new Date(),
      dueDate: new Date(),
      invoiceNumber,
      invoiceItems: [],
    },
  });
  const { append, remove, fields } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'invoiceItems', // unique name for your Field Array
  });

  const handleSelectStaff = (staffs: AutoCompleteUser[]) => {
    setSelectedStaffs(staffs);
    setValue(
      'staffIds',
      staffs.map((staff) => staff.id),
    );
  };

  const handleSaveInvoiceItem = (invoiceItem: InvoiceItemInput) => {
    append(invoiceItem);
  };

  const handleDeleteInvoiceItem = (invoiceItemId: string) => {
    const index = findIndex(fields, { id: invoiceItemId });
    remove(index);
    return 'removed';
  };

  const onClose = () => {
    props.handleClose();
    reset();
    setSelectedStaffs([]);
    setSelectedDueDate(dayjs());
    setSelectedIssueDate(dayjs());
  };

  const onSubmit = async (data: InvoiceCreateInput) => {
    const invoice = await props.onSubmit(data);
    if (invoice) {
      onClose();
      router.push(paths.dashboard.invoices.details.replace(':invoiceId', invoice.id));
    }
  };

  useEffect(() => {
    reset({
      patientId: patient?.id,
      staffIds: staff ? [staff?.id] : [],
      issueDate: new Date(),
      dueDate: new Date(),
      invoiceNumber,
      invoiceItems: [],
    });
  }, [patient, staff, invoiceNumber]);

  return (
    <Dialog
      open={props.open}
      fullWidth
      maxWidth={'md'}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
          sx={{
            px: 2,
            py: 1,
          }}
        >
          <CreditCardIcon />
          <Typography
            sx={{ flexGrow: 1 }}
            variant="h6"
          >
            New Invoice
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
            spacing={2}
          >
            <Grid xs={6}>
              <FormControl
                fullWidth
                error={!!errors.title}
                size={'small'}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Title
                </FormLabel>
                <OutlinedInput {...register('title')} />
                <FormHelperText>{errors?.title?.message}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={6}>
              <FormControl
                fullWidth
                error={!!errors.invoiceNumber}
                size={'small'}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Invoice #*
                </FormLabel>
                <OutlinedInput {...register('invoiceNumber')} />
                <FormHelperText>{errors?.invoiceNumber?.message}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={6}>
              <FormControl
                fullWidth
                error={!!errors.vatNumber}
                size={'small'}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  VAT Number
                </FormLabel>
                <OutlinedInput {...register('vatNumber')} />
                <FormHelperText>{errors?.vatNumber?.message}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={6}>
              <FormControl
                fullWidth
                error={!!errors.orderNumber}
                size={'small'}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  PO/SO Number
                </FormLabel>
                <OutlinedInput {...register('orderNumber')} />
                <FormHelperText>{errors?.orderNumber?.message}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogContent sx={{ backgroundColor: '#f8f8f8' }}>
          <Grid
            container
            spacing={1}
          >
            <Grid xs={12}>
              <Typography variant="subtitle1">Invoice Details</Typography>
            </Grid>

            <Grid xs={6}>
              <FormControl
                fullWidth
                error={!!errors.patientId}
                size={'small'}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Patient
                </FormLabel>
                <TextField
                  {...register('patientId')}
                  select
                  variant={'outlined'}
                  size={'small'}
                  label={null}
                  defaultValue={patient?.id || ''}
                >
                  {patientOptions.map((patientOption) => (
                    <MenuItem
                      key={patientOption.id}
                      value={patientOption.id}
                    >
                      <UserAvatar
                        userId={patientOption.id}
                        height={25}
                        width={25}
                        includeFullName={true}
                        justifyContent={'flex-start'}
                      />
                    </MenuItem>
                  ))}
                </TextField>
                <FormHelperText>{errors?.patientId?.message}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={6}>
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
                  Staff
                </FormLabel>
                <UserAutocomplete
                  error={false}
                  helperText=""
                  onChange={handleSelectStaff}
                  options={staffOptions}
                  selectedOptions={selectedStaffs}
                  label={''}
                  showAvatarColor={false}
                  size={'small'}
                  variant={'outlined'}
                />
                <FormHelperText>
                  {errors?.staffIds?.message || errors?.staffIds?.[0]?.message}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={6}>
              <FormControl
                fullWidth
                size={'small'}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Issue Date
                </FormLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={selectedIssueDate}
                    onChange={(newValue) => {
                      const newDate = newValue ?? dayjs();
                      setSelectedIssueDate(newDate);
                      setValue('issueDate', newDate.toDate());
                    }}
                    slotProps={{ textField: { size: 'small', variant: 'outlined' } }}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>

            <Grid xs={6}>
              <FormControl
                fullWidth
                size={'small'}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Due Date
                </FormLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={selectedDueDate}
                    label={null}
                    onChange={(newValue) => {
                      const newDate = newValue ?? dayjs();
                      setSelectedDueDate(newDate);
                      setValue('dueDate', newDate.toDate());
                    }}
                    slotProps={{ textField: { size: 'small', variant: 'outlined' } }}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>

            <Grid xs={12}>
              <FormControl
                fullWidth
                error={!!errors.description}
                size={'small'}
              >
                <FormLabel
                  sx={{
                    color: 'text.primary',
                    mb: 1,
                  }}
                >
                  Description
                </FormLabel>
                <OutlinedInput {...register('description')} />
                <FormHelperText>{errors?.description?.message}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />
        <DialogContent>
          <Grid
            container
            spacing={1}
          >
            <Grid xs={12}>
              <Typography variant="subtitle1">Select services</Typography>
            </Grid>
            <Grid xs={12}>
              <InvoiceCreateItemsTable
                invoiceItems={fields as InvoiceItemInput[]}
                handleSaveInvoiceItem={handleSaveInvoiceItem}
                handleDeleteInvoiceItem={handleDeleteInvoiceItem}
                isLoading={false}
                services={serviceStore.services}
              />
              <FormControl
                fullWidth
                error={!!errors.invoiceItems}
                size={'small'}
              >
                <FormHelperText>
                  {errors?.invoiceItems?.message || errors.invoiceItems?.[0]?.service?.message}
                </FormHelperText>
              </FormControl>
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
            Create
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
