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
import { useRouter } from 'src/hooks/use-router';
import { useStytchB2BClient, useStytchMember } from '@stytch/nextjs/b2b';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SplashScreen } from 'src/components/splash-screen';
import CircularProgress from '@mui/material/CircularProgress';
import toast from 'react-hot-toast';
import Alert from '@mui/material/Alert';

interface Values {
  password: string;
  passwordConfirm: string;
}

const initialValues: Values = {
  password: '',
  passwordConfirm: '',
};

const validationSchema = Yup.object({
  password: Yup.string().min(7, 'Must be at least 7 characters').max(255).required('Required'),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Required'),
});

const TOKEN_TYPE = 'multi_tenant_passwords';
const TOKEN_RESET_PASSWORD = 'reset_password';

const Page = () => {
  const [updatePasswordSuccess, setUpdatePasswordSuccess] = useState(false);
  const { member, isInitialized } = useStytchMember();
  const stytch = useStytchB2BClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (input) => {
      const token = searchParams.get('token');
      const stytch_token_type = searchParams.get('stytch_token_type');
      if (token && stytch_token_type === TOKEN_TYPE) {
        stytch.passwords
          .strengthCheck({
            password: input.password,
          })
          .then((response) => {
            if (!response.valid_password) {
              toast.error('Password is too weak. ');
              return;
            }
            stytch.passwords
              .resetByEmail({
                password_reset_token: token,
                password: input.password,
                session_duration_minutes: 60,
              })
              .then((response) => console.log(response))
              .catch((e) => toast.error('Password reset failed. Please try again later.'));
          });
      } else if (token && stytch_token_type === TOKEN_RESET_PASSWORD) {
        const organizationId = searchParams.get('organizationId') || '';
        const email = searchParams.get('email') || '';
        stytch.passwords
          .resetByEmailStart({
            organization_id: organizationId,
            email_address: email,
          })
          .then((response) => {
            toast.success('Please check your email for a link to ');
          })
          .catch((e) => toast.error('Password reset failed. Please try again later.'));
      }
    },
  });

  useEffect(() => {
    const token = searchParams.get('token');
    const stytch_token_type = searchParams.get('stytch_token_type');
    if (isInitialized && token && stytch_token_type) {
      if (![TOKEN_TYPE, TOKEN_RESET_PASSWORD].includes(stytch_token_type)) {
        router.replace(paths.login);
      }
    }

    if (stytch && member && isInitialized) {
      router.replace(paths.dashboard.index);
    }
  }, [isInitialized, router, searchParams, stytch, member]);

  if (!isInitialized) {
    return (
      <>
        <SplashScreen />
      </>
    );
  }

  return (
    <>
      <Seo title="Reset Password" />
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
          <Typography variant="h5">Reset password</Typography>
        </Stack>

        {updatePasswordSuccess && (
          <Alert
            sx={{ mt: 3 }}
            severity="success"
          >
            Password successfully updated.
          </Alert>
        )}
        <form
          noValidate
          onSubmit={formik.handleSubmit}
        >
          <Stack spacing={3}>
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
            <TextField
              error={!!(formik.touched.passwordConfirm && formik.errors.passwordConfirm)}
              fullWidth
              helperText={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
              label="Password (Confirm)"
              name="passwordConfirm"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.passwordConfirm}
            />
          </Stack>
          <Button
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            Reset
            {formik.isSubmitting && (
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
