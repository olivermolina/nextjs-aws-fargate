'use client';

import { useCallback, useEffect, useState } from 'react';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { customersApi } from 'src/api/customers';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { CustomerEditForm } from 'src/sections/dashboard/customer/customer-edit-form';
import type { Customer } from 'src/types/customer';
import UserAvatar from '../../../../../components/user-avatar';

const useCustomer = (): Customer | null => {
  const isMounted = useMounted();
  const [customer, setCustomer] = useState<Customer | null>(null);

  const handleCustomerGet = useCallback(async () => {
    try {
      const response = await customersApi.getCustomer();

      if (isMounted()) {
        setCustomer(response);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      handleCustomerGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return customer;
};

const Page = () => {
  const customer = useCustomer();

  usePageView();

  if (!customer) {
    return null;
  }

  return (
    <>
      <Seo title="Dashboard: Customer Edit" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4}>
            <Stack spacing={4}>
              <div>
                <Link
                  color="text.primary"
                  component={RouterLink}
                  href={paths.dashboard.customers.index}
                  sx={{
                    alignItems: 'center',
                    display: 'inline-flex',
                  }}
                  underline="hover"
                >
                  <SvgIcon sx={{ mr: 1 }}>
                    <ArrowLeftIcon />
                  </SvgIcon>
                  <Typography variant="subtitle2">Customers</Typography>
                </Link>
              </div>
              <Stack
                alignItems="flex-start"
                direction={{
                  xs: 'column',
                  md: 'row',
                }}
                justifyContent="space-between"
                spacing={4}
              >
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <UserAvatar
                    userId={customer.id}
                    height={64}
                    width={64}
                  />
                  <Stack spacing={1}>
                    <Typography variant="h4">{customer.email}</Typography>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                    >
                      <Typography variant="subtitle2">user_id:</Typography>
                      <Chip
                        label={customer.id}
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
            <CustomerEditForm customer={customer} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
