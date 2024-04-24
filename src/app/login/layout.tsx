'use client';

import { FC, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = (props: LayoutProps) => {
  const { children } = props;

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: {
          xs: 'column-reverse',
          md: 'row',
        },
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: 'neutral.800',
          backgroundImage: 'url("/assets/gradient-bg.svg")',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          color: 'common.white',
          display: 'flex',
          flex: {
            xs: '0 0 auto',
            md: '1 1 auto',
          },
          justifyContent: 'center',
          p: {
            xs: 4,
            md: 8,
          },
        }}
      >
        <Box maxWidth="md">
          <Typography
            sx={{ mb: 1 }}
            variant="h4"
          >
            Welcome to Luna Health
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Software for the next generation of healthcare, made simple for anyone
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{ mb: 2 }}
          >
            Join us in making health more accessible for everyone
          </Typography>

          <Stack
            alignItems="center"
            direction="row"
            flexWrap="wrap"
            gap={4}
            sx={{
              color: 'text.primary',
              '& > *': {
                color: 'neutral.400',
                flex: '0 0 auto',
              },
            }}
          ></Stack>
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          display: 'flex',
          flex: {
            xs: '1 1 auto',
            md: '0 0 auto',
          },
          flexDirection: 'column',
          justifyContent: {
            md: 'center',
          },
          maxWidth: '100%',
          p: {
            xs: 4,
            md: 8,
          },
          width: {
            md: 600,
          },
        }}
      >
        <div>
          <Box sx={{ mb: 4 }}>
            <Stack
              alignItems="center"
              component={RouterLink}
              direction="row"
              display="inline-flex"
              href={paths.index}
              spacing={1}
              sx={{ textDecoration: 'none' }}
            ></Stack>
          </Box>
          {children}
        </div>
      </Box>
    </Box>
  );
};

export default Layout;
