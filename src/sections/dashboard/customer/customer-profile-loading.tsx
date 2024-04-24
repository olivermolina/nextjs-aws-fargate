import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';


export default function CustomerProfileLoading() {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        paddingTop: 0,
        pt: 0, // Reduced top padding
        pb: 1,
        px: { xs: 2, lg: 4 },
      }}
    >
      <Stack
        spacing={2}
        sx={{ mt: 0, height: '100%' }}
      >
        <Stack
          sx={{ mt: 0, height: '100%' }}
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch"
          spacing={2}
        >
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
              <Skeleton
                variant="circular"
                width={64}
                height={64}
              />

              <Stack spacing={1}>
                <Typography variant="h4">
                  <Skeleton width={150} />
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    <Skeleton width={40} />
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    <Skeleton width={20} />
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    <Skeleton width={30} />
                  </Typography>
                </Box>
              </Stack>
            </Stack>
            <Stack
              alignItems="center"
              direction="row"
              spacing={2}
            >
              <Skeleton
                variant="rectangular"
                width={150}
                height={40}
              />
            </Stack>
          </Stack>
          <Stack
            direction={'row'}
            spacing={4}
            sx={{ mt: 2 }}
          >
            <Skeleton width={40} />
            <Skeleton width={40} />
            <Skeleton width={40} />
            <Skeleton width={40} />
            <Skeleton width={40} />
            <Skeleton width={40} />
          </Stack>

          <Skeleton
            variant="rectangular"
            sx={{
              width: '100%',
              height: '100%',
            }}
          />

        </Stack>
      </Stack>
    </Box>
  );
}
