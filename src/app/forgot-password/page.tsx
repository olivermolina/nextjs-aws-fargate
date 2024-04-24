'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { paths } from 'src/paths';
import { useStytchB2BClient } from '@stytch/nextjs/b2b';
import { trpc } from '../_trpc/client';
import toast from 'react-hot-toast';
import { getBaseUrl } from 'src/utils/get-base-url';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useState } from 'react';

interface Values {
  email: string;
}

const initialValues: Values = {
  email: '',
};

const validationSchema = Yup.object({
  email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
});

const Page = () => {
  const stytch = useStytchB2BClient();
  const mutation = trpc.auth.verifyEmail.useMutation();
  const [successReset, setSuccessReset] = useState(false);
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (input: Values) => {
      try {
        const user = await mutation.mutateAsync(input);
        if (user) {
          await stytch.passwords.resetByEmailStart({
            organization_id: user.organization_stytch_id,
            email_address: input.email,
            login_redirect_url: getBaseUrl() + '/authenticate',
            reset_password_redirect_url: getBaseUrl() + '/reset-password',
            reset_password_expiration_minutes: 60,
          });
          setSuccessReset(true);
        }
      } catch (e) {
        toast.error(e.error_message || e.message);
        setSuccessReset(false);
      }
    },
  });

  return (
    <>
      <Seo title="Forgot Password" />
      <div>
        <Box sx={{ mb: 4 }}>
          <Link
            color="text.primary"
            component={RouterLink}
            href={paths.dashboard.index}
            sx={{
              alignItems: 'center',
              display: 'inline-flex',
            }}
            underline="hover"
          >
            <SvgIcon sx={{ mr: 1 }}>
              <ArrowLeftIcon />
            </SvgIcon>
            <Typography variant="subtitle2">Dashboard</Typography>
          </Link>
        </Box>
        <Stack
          sx={{ mb: 4 }}
          spacing={1}
        >
          <Typography variant="h5">Forgot password</Typography>
        </Stack>
        {mutation.data && successReset && (
          <Alert
            severity={'success'}
            sx={{ mb: 1 }}
          >
            <Typography>We have e-mailed your password reset link!</Typography>
          </Alert>
        )}
        <form
          noValidate
          onSubmit={formik.handleSubmit}
        >
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
          <Button
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            type="submit"
            variant="contained"
            disabled={mutation.isLoading}
          >
            Send reset link
            {mutation.isLoading && (
              <CircularProgress
                sx={{ ml: 1 }}
                size={20}
              />
            )}
          </Button>
        </form>
      </div>
    </>
  );
};

export default Page;
