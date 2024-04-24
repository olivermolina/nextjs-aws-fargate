'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { paths } from 'src/paths';
import { trpc } from 'src/app/_trpc/client';
import { useRouter } from 'src/hooks/use-router';
import { useMounted } from 'src/hooks/use-mounted';
import CircularProgress from '@mui/material/CircularProgress';
import { useStytchB2BClient, useStytchMember } from '@stytch/nextjs/b2b';
import { useCallback, useEffect } from 'react';
import Divider from '@mui/material/Divider';
import { getBaseUrl } from '../../utils/get-base-url';
import { useTimezone } from '../../hooks/use-timezone';
import MenuItem from '@mui/material/MenuItem';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { useAuth } from 'src/hooks/use-auth';
import { AuthContextType } from 'src/contexts/auth/jwt';
import { AuthUser } from 'src/contexts/auth/jwt/auth-context';

interface Values {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  policy: boolean;
  organization_name: string;
  category: string;
  size: string;
}

const initialValues: Values = {
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  policy: false,
  organization_name: '',
  category: '',
  size: '',
};

const validationSchema = Yup.object({
  email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
  first_name: Yup.string().max(255).required('First Name is required'),
  last_name: Yup.string().max(255).required('Last Name is required'),
  password: Yup.string().min(7).max(255).required('Password is required'),
  policy: Yup.boolean().oneOf([true], 'This field must be checked'),
  organization_name: Yup.string().max(255).required('Organization name is required'),
  category: Yup.string().min(1).max(255).required('Category is required'),
  size: Yup.string().max(255).required('Organization size is required'),
});

const useSignup = () => {
  const { setAuthUser } = useAuth<AuthContextType>();
  const { member, isInitialized } = useStytchMember();
  const stytch = useStytchB2BClient();
  const router = useRouter();
  const timezone = useTimezone();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const isMounted = useMounted();
  const { data, isLoading, mutateAsync } = trpc.auth.signup.useMutation();

  const handleSubmit = useCallback(
    async (inputs: Values) => {
      try {
        const result = await mutateAsync({
          ...inputs,
          timezone: timezone.value,
        });
        if (result && isMounted()) {
          await setAuthUser(result as unknown as AuthUser);
          await stytch.passwords.authenticate({
            organization_id: result.organization.stytch_id,
            email_address: inputs.email,
            password: inputs.password,
            session_duration_minutes: 60,
          });
        }
      } catch (e) {
        toast.error(e.error_message || e.message);
      }
    },
    [timezone],
  );

  useEffect(() => {
    if (member && isInitialized) {
      router.push(paths.checkout + `?plan=${plan}`);
    }
  }, [member, isInitialized, plan]);

  return {
    handleSubmit,
    data,
    isLoading,
  };
};

const Page = () => {
  const signup = useSignup();
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (data) => {
      await signup.handleSubmit(data);
    },
  });
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const stytch = useStytchB2BClient();
  const googleLogin = useCallback(() =>
    stytch.oauth.google.discovery.start({
      discovery_redirect_url: `${getBaseUrl()}/authenticate?next_route=${paths.checkout}?plan=${plan}`,
      custom_scopes: ['email', 'profile'],
    }), [plan]);

  return (
    <>
      <Seo title="Register" />
      <div>
        <Stack
          sx={{ mb: 4 }}
          spacing={1}
        >
          <Typography variant="h5">Register</Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            Already have an account? &nbsp;
            <Link
              component={RouterLink}
              href={paths.login}
              underline="hover"
              variant="subtitle2"
            >
              Log in
            </Link>
          </Typography>
        </Stack>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
        >
          <Stack spacing={3}>
            <Stack
              spacing={3}
              direction={'row'}
            >
              <TextField
                error={!!(formik.touched.first_name && formik.errors.first_name)}
                fullWidth
                helperText={formik.touched.first_name && formik.errors.first_name}
                label="First Name"
                name="first_name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.first_name}
              />
              <TextField
                error={!!(formik.touched.last_name && formik.errors.last_name)}
                fullWidth
                helperText={formik.touched.last_name && formik.errors.last_name}
                label="Last Name"
                name="last_name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.last_name}
              />
            </Stack>
            <TextField
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
            <TextField
              error={!!(formik.touched.organization_name && formik.errors.organization_name)}
              fullWidth
              helperText={formik.touched.organization_name && formik.errors.organization_name}
              label="Organization Name"
              name="organization_name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.organization_name}
            />
            <Stack
              spacing={3}
              direction={'row'}
            >
              <TextField
                error={!!(formik.touched.category && formik.errors.category)}
                fullWidth
                helperText={formik.touched.category && formik.errors.category}
                label="Category"
                name="category"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.category}
              />
              <TextField
                error={!!(formik.touched.size && formik.errors.size)}
                fullWidth
                helperText={formik.touched.size && formik.errors.size}
                label="Organization Size"
                name="size"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.size}
                select
              >
                {['1-10', '11-50', '51-250', '250+'].map((option) => (
                  <MenuItem
                    key={option}
                    value={option}
                  >
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              ml: -1,
              mt: 1,
            }}
          >
            <Checkbox
              checked={formik.values.policy}
              name="policy"
              onChange={formik.handleChange}
            />
            <Typography
              color="text.secondary"
              variant="body2"
            >
              I have read the{' '}
              <Link
                component="a"
                href="#"
              >
                Terms and Conditions
              </Link>
            </Typography>
          </Box>
          {!!(formik.touched.policy && formik.errors.policy) && (
            <FormHelperText error>{formik.errors.policy}</FormHelperText>
          )}
          <Button
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            type="submit"
            variant="contained"
            disabled={signup.isLoading}
          >
            Register
            {signup.isLoading && (
              <CircularProgress
                sx={{ ml: 1 }}
                size={20}
              />
            )}
          </Button>
        </form>
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
      </div>
    </>
  );
};

export default Page;
