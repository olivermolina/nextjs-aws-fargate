import type { FC } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { paths } from 'src/paths';
import { Issuer } from 'src/utils/auth';

const issuers: Record<Issuer, string> = {
  Amplify: '/assets/logos/logo-amplify.svg',
  Auth0: '/assets/logos/logo-auth0.svg',
  Firebase: '/assets/logos/logo-firebase.svg',
  JWT: '/assets/logos/logo-jwt.svg',
};

interface AuthPlatformProps {
  issuer: Issuer;
}

export const AuthIssuer: FC<AuthPlatformProps> = (props) => {
  const { issuer: currentIssuer } = props;

  return (
    <Box
      sx={{
        borderColor: 'divider',
        borderRadius: 2.5,
        borderStyle: 'solid',
        borderWidth: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
      }}
    >

      {/*}
      <Typography variant="body2">
        Visit our{' '}
        <Link
          component="a"
          href={paths.docs}
          target="_blank"
          underline="hover"
          variant="subtitle2"
        >
          docs
        </Link>{' '}
        and find out how to switch between
      </Typography>

      */}
      <Stack
        alignItems="center"
        direction="row"
        gap={3}
        sx={{ mt: 2 }}
      >
         {/*
        {Object.keys(issuers).map((issuer) => {
          const isCurrent = issuer === currentIssuer;
          const icon = issuers[issuer as Issuer];

          return (
            <Tooltip
              key={issuer}
              title={issuer}
            >
              <Box
                component="img"
                src={icon}
                sx={{
                  height: 30,
                  '&:not(:hover)': {
                    ...(!isCurrent && {
                      filter: 'grayscale(100%)',
                    }),
                  },
                }}
              />
            </Tooltip>
          );
        })}
*/}

      </Stack>
    </Box>
  );
};

AuthIssuer.propTypes = {
  // @ts-ignore
  issuer: PropTypes.string.isRequired,
};
