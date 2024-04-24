'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { paths } from 'src/paths';

interface Values {
  email: string;
  password: string;
  submit: null;
}

const initialValues: Values = {
  email: 'demo@devias.io',
  password: 'Password123!',
  submit: null,
};

const validationSchema = Yup.object({
  email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
  password: Yup.string().max(255).required('Password is required'),
});

const Page = () => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (): void => {},
  });

  return (
    <>
      <Seo title="Login" />
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
        <Card elevation={16}>
          <CardHeader
            subheader={
              <Typography
                color="text.secondary"
                variant="body2"
              >
                Don&apos;t have an account? &nbsp;
                <Link
                  href="#"
                  underline="hover"
                  variant="subtitle2"
                >
                  Register
                </Link>
              </Typography>
            }
            sx={{ pb: 0 }}
            title="Log in"
          />
          <CardContent>
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
              <Button
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                type="submit"
                variant="contained"
              >
                Log In
              </Button>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 3,
                }}
              >
                <Link
                  href="#"
                  underline="hover"
                  variant="subtitle2"
                >
                  Forgot password?
                </Link>
              </Box>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Page;
