'use client';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Lock01Icon from '@untitled-ui/icons-react/build/esm/Lock01';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { FormProvider } from 'react-hook-form';

import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { CheckoutBilling } from 'src/sections/checkout/checkout-billing';
import { CheckoutSummary } from 'src/sections/checkout/checkout-summary';
import { useProducts } from 'src/hooks/use-products';
import { useCheckout } from 'src/hooks/use-checkout';
import React, { useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from 'src/hooks/use-auth';
import { AuthContextType } from 'src/contexts/auth/jwt';
import { SplashScreen } from 'src/components/splash-screen';
import { useRouter } from 'src/hooks/use-router';
import { useOrganizationStore } from 'src/hooks/use-organization';
import { Status } from '@prisma/client';

const Page = () => {
  const router = useRouter();
  const organization = useOrganizationStore();
  const { user } = useAuth<AuthContextType>();
  const {
    handleQuantityChange,
    products,
    plans,
    onPlanChange,
    onApplyDiscountCode,
    handleDiscountCodeChange,
    couponIsLoading,
    percentOff,
  } = useProducts(false, true);

  const { methods, onSubmit } = useCheckout(percentOff);

  useEffect(() => {
    if (percentOff) {
      methods.setValue('stripePaymentMethodId', undefined);
    }

    if (products) {
      const standardProduct = products.find((product) => product.type === 'plan');
      if (standardProduct) {
        methods.setValue('subscriptionId', standardProduct?.id);
      }
      const additionalProduct = products.find((product) => product.type === 'additional_users');
      if (additionalProduct) {
        methods.setValue('additionalUsers', additionalProduct?.quantity);
      }
    }
  }, [percentOff, products]);

  useEffect(() => {
    if (!user) {
      router.replace(paths.login);
    }

    if (user && organization.data?.status === Status.COMPLETED) {
      router.replace(paths.dashboard.index);
    }

  }, [user, organization.data]);

  usePageView();

  if (!user || organization.isLoading || (user && organization.data?.status === Status.COMPLETED)) {
    return <SplashScreen />;
  }

  return (
    <>
      <Seo title="Checkout " />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <div>
                  <Link
                    color="text.primary"
                    component={RouterLink}
                    href={paths.index}
                    sx={{
                      alignItems: 'center',
                      display: 'inline-flex',
                    }}
                    underline="hover"
                  >
                    <SvgIcon sx={{ mr: 1 }}>
                      <ArrowLeftIcon />
                    </SvgIcon>
                    <Typography variant="subtitle2">Home</Typography>
                  </Link>
                </div>
                <Typography variant="h3">Checkout</Typography>
              </Stack>
              <Box mt={6}>
                <Grid
                  container
                  spacing={6}
                >
                  <Grid
                    md={7}
                    xs={12}
                  >
                    <CheckoutBilling percentOff={percentOff} />
                  </Grid>
                  <Grid
                    md={5}
                    xs={12}
                  >
                    <CheckoutSummary
                      onQuantityChange={handleQuantityChange}
                      products={products}
                      plans={plans}
                      onPlanChange={onPlanChange}
                      onApplyDiscountCode={onApplyDiscountCode}
                      handleDiscountCodeChange={handleDiscountCodeChange}
                      couponIsLoading={couponIsLoading}
                      percentOff={percentOff}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ mt: 6 }}>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <SvgIcon sx={{ color: 'success.main' }}>
                    <Lock01Icon />
                  </SvgIcon>
                  <Typography variant="subtitle2">Secure Checkout</Typography>
                </Stack>
                <Typography
                  color="text.secondary"
                  sx={{ mt: 2 }}
                  variant="body2"
                >
                  Your purchases are secured by an industry best encryption service – Braintree
                </Typography>
                <Button
                  color="primary"
                  endIcon={
                    <SvgIcon>
                      <ArrowRightIcon />
                    </SvgIcon>
                  }
                  size="large"
                  sx={{ mt: 3 }}
                  type="submit"
                  variant="contained"
                  disabled={methods.formState.isSubmitting}
                >
                  Complete order
                  {methods.formState.isSubmitting && (
                    <CircularProgress
                      sx={{ ml: 1 }}
                      size={20}
                    />
                  )}
                </Button>
              </Box>
            </form>
          </FormProvider>
        </Container>
      </Box>
    </>
  );
};
export default Page;
