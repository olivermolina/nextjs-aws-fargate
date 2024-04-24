import type { FC } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export const Form15: FC = () => (
  <Box
    sx={{
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100'),
      p: 3,
    }}
  >
    <Container maxWidth="sm">
      <Card>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 400,
            p: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <Typography variant="h4">Log in</Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
                variant="body2"
              >
                Log in on the internal platform
              </Typography>
            </div>
            <img
              alt="Amplify"
              src="/assets/logos/logo-amplify.svg"
              style={{
                maxWidth: '53.62px',
                width: '100%',
              }}
            />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              mt: 3,
            }}
          >
            <form onSubmit={(event) => event.preventDefault()}>
              <TextField
                fullWidth
                label="Email Address"
                margin="normal"
                name="email"
                type="email"
              />
              <TextField
                fullWidth
                label="Password"
                margin="normal"
                name="password"
                type="password"
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                >
                  Log In
                </Button>
              </Box>
            </form>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Link
            color="text.secondary"
            href="#"
            variant="body2"
          >
            Create new account
          </Link>
        </CardContent>
      </Card>
    </Container>
  </Box>
);
