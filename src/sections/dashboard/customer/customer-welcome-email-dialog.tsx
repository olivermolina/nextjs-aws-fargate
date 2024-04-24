import { FC } from 'react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { Patient } from 'src/types/patient';
import { getUserFullName } from 'src/utils/get-user-full-name';
import { getPatientWelcomeEmail } from 'src/utils/email';

const CustomerWelcomeEmailValidationSchema = z.object({
  id: z.string(),
  to: z.string().email({
    message: 'Invalid email. Please enter a valid email address',
  }),
  subject: z.string().min(1, { message: 'This is required' }),
  body: z.string().min(1, { message: 'This is required' }),
});

export type CustomerWelcomeEmailInput = z.infer<typeof CustomerWelcomeEmailValidationSchema>;

interface CustomerWelcomeEmailProps {
  open: boolean;
  handleClose: () => void;
  patient?: Patient;
  onSubmit: (data: CustomerWelcomeEmailInput) => void;
  isLoading: boolean;
}

export const CustomerWelcomeEmailDialog: FC<CustomerWelcomeEmailProps> = (props) => {
  const { patient } = props;

  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<CustomerWelcomeEmailInput>({
    resolver: zodResolver(CustomerWelcomeEmailValidationSchema),
    defaultValues: {
      id: patient?.id,
      to: patient?.email,
      subject: 'Welcome',
      body: getPatientWelcomeEmail(
        patient?.first_name || '',
        getUserFullName(patient?.staffs?.[0]?.staff) || patient?.organization?.name!
      ),
    },
  });
  return (
    <Dialog open={props.open}>
      <form onSubmit={handleSubmit(props.onSubmit)}>
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
            Send intake to John
          </Typography>
          <IconButton onClick={props.handleClose}>
            <SvgIcon>
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Stack>

        <DialogContent>
          <Typography
            variant={'body1'}
            sx={{ mb: 2 }}
          >
            An intake email will be sent to your client asking them to complete their profile,
            upload relevant medical or referral documents and sign privacy and consent documents.
            They will be given Client Portal access.
          </Typography>
          <Grid
            container
            spacing={3}
          >
            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Subject*
              </Typography>
              <FormControl
                error={!!errors?.subject}
                variant="standard"
                fullWidth
              >
                <OutlinedInput
                  fullWidth
                  {...register('subject')}
                  aria-describedby="component-error-text"
                />
                <FormHelperText>{errors?.subject?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                To*
              </Typography>
              <FormControl
                error={!!errors?.to}
                variant="standard"
                fullWidth
              >
                <OutlinedInput
                  fullWidth
                  {...register('to')}
                  disabled
                />
                <FormHelperText>{errors?.to?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Body
              </Typography>
              <FormControl
                error={!!errors?.body}
                variant="standard"
                fullWidth
              >
                <OutlinedInput
                  fullWidth
                  multiline
                  rows={10}
                  {...register('body')}
                />
                <FormHelperText>{errors?.body?.message}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            variant={'outlined'}
            onClick={props.handleClose}
          >
            Skip
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={props.isLoading}
          >
            Send
            {props.isLoading && (
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
