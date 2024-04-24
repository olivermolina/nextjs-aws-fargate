import type { FC } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

type Option = {
  text: string;
  value: string;
};

const countries: Option[] = [
  { text: 'Jersey', value: 'JE' },
  { text: 'Jordan', value: 'JO' },
  { text: 'Kazakhstan', value: 'KZ' },
  { text: 'Kenya', value: 'KE' },
  { text: 'Kiribati', value: 'KI' },
  { text: "Korea, Democratic People'S Republic of", value: 'KP' },
  { text: 'Korea, Republic of', value: 'KR' },
  { text: 'Kuwait', value: 'KW' },
  { text: 'Kyrgyzstan', value: 'KG' },
  { text: "Lao People'S Democratic Republic", value: 'LA' },
];

export const Form5: FC = () => (
  <Box sx={{ p: 3 }}>
    <form onSubmit={(event) => event.preventDefault()}>
      <CardHeader title="Profile" />
      <CardContent>
        <Grid
          container
          spacing={4}
        >
          <Grid
            xs={12}
            md={6}
          >
            <TextField
              fullWidth
              label="Name"
              name="name"
            />
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <TextField
              fullWidth
              helperText="We will use this email to contact you"
              label="Email Address"
              name="email"
              required
              type="email"
            />
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
            />
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <Autocomplete
              getOptionLabel={(option: Option) => option.text}
              options={countries}
              renderInput={(params): JSX.Element => (
                <TextField
                  {...params}
                  fullWidth
                  label="Country"
                  name="country"
                />
              )}
            />
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <TextField
              fullWidth
              label="State/Region"
              name="state"
            />
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <TextField
              fullWidth
              label="City"
              name="city"
            />
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <Typography
              gutterBottom
              variant="subtitle2"
            >
              Public Profile
            </Typography>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Means that anyone viewing your profile will be able to see your contacts details
            </Typography>
            <Switch
              edge="start"
              name="isPublic"
            />
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <Typography
              gutterBottom
              variant="subtitle2"
            >
              Available to hire
            </Typography>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              Toggling this will let your teammates know that you are available for acquiring new
              projects
            </Typography>
            <Switch
              color="primary"
              edge="start"
              name="canHire"
            />
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardActions
        sx={{
          justifyContent: 'flex-end',
          p: 2,
        }}
      >
        <Button
          color="primary"
          type="submit"
          variant="contained"
        >
          Save Settings
        </Button>
      </CardActions>
    </form>
  </Box>
);
