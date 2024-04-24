'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from 'src/hooks/use-auth';
import { AuthContextType } from 'src/contexts/auth/jwt';
import { trpc } from 'src/app/_trpc/client';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import { useStytchB2BClient } from '@stytch/nextjs/b2b';
import { getBaseUrl } from 'src/utils/get-base-url';
import { useCallback } from 'react';
import { slice } from 'src/slices/schedule';
import { useDispatch } from 'src/store';
import { AuthUser } from 'src/contexts/auth/jwt/auth-context';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { UserType } from '@prisma/client';
import { usePathname } from 'src/hooks/use-pathname';

interface Values {
  email: string;
  password: string;
  submit: null;
}

const initialValues: Values = {
  email: '',
  password: '',
  submit: null,
};

const validationSchema = Yup.object({
  email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
  password: Yup.string().max(255).required('Password is required'),
});

type AppointmentLoginModalProps = {
  open: boolean;
  handleClose: () => void;
};

const AppointmentLoginModal = (props: AppointmentLoginModalProps) => {
  const { setAuthUser, user } = useAuth<AuthContextType>();
  const pathname = usePathname();
  const mutation = trpc.auth.login.useMutation();
  const dispatch = useDispatch();

  const stytch = useStytchB2BClient();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (inputs) => {
      const user = await mutation.mutateAsync({
        email: inputs.email,
        password: inputs.password,
      });
      if (user) {
        await stytch.passwords.authenticate({
          organization_id: user.organization.stytch_id,
          email_address: inputs.email,
          password: inputs.password,
          session_duration_minutes: 60,
        });
        await setAuthUser(user as AuthUser);
        dispatch(slice.actions.setScheduleActiveStep(2));
        props.handleClose();
      }
    },
  });
  const googleLogin = useCallback(async () => {
    // If the user is a staff member, revoke their session and login with patient account instead
    if (user?.type === UserType.STAFF) {
      try {
        await stytch.session.revoke();
      } catch (e) {}
    }

    dispatch(slice.actions.setAuthenticateRedirectPath(pathname));

    return stytch.oauth.google.discovery.start({
      discovery_redirect_url: `${getBaseUrl()}/authenticate-schedule`,
    });
  }, [pathname, user]);

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogContent>
        <Stack
          sx={{ mb: 4 }}
          spacing={1}
        >
          <Typography variant="h5">Log in</Typography>
        </Stack>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
        >
          <Stack spacing={3}>
            <TextField
              autoFocus
              error={!!(formik.touched.email && formik.errors.email)}
              fullWidth
              helperText={formik.touched.email && formik.errors.email}
              label="Email Address"
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="email"
              value={formik.values.email}
            />
            <TextField
              error={!!(formik.touched.password && formik.errors.password)}
              fullWidth
              helperText={formik.touched.password && formik.errors.password}
              label="Password"
              name="password"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.password}
            />
          </Stack>
          {mutation.error && (
            <Alert
              sx={{ mt: 3 }}
              severity="error"
            >
              {mutation.error.message}
            </Alert>
          )}

          <Button
            fullWidth
            sx={{ mt: 3 }}
            size="large"
            type="submit"
            variant="contained"
            disabled={mutation.isLoading}
          >
            Continue
            {mutation.isLoading && (
              <CircularProgress
                sx={{ ml: 1 }}
                size={20}
              />
            )}
          </Button>
          <Divider sx={{ my: 2 }}>OR</Divider>
          <Box sx={{ mb: 4 }}>
            <Button
              variant={'outlined'}
              fullWidth
              onClick={googleLogin}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="45"
                height="45"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                ></path>
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                ></path>
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                ></path>
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                ></path>
              </svg>
              <Typography variant="subtitle2">Continue with Google</Typography>
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentLoginModal;
