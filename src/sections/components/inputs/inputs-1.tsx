import type { FC } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const Inputs1: FC = () => (
  <Box sx={{ p: 3 }}>
    <Stack spacing={1}>
      <Typography variant="subtitle2">Staff</Typography>
      <Typography
        color="text.secondary"
        variant="body2"
      >
        Filter by staff schedule
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label={<Typography variant="body1">Staff 1</Typography>}
        />
        <FormControlLabel
          control={<Checkbox />}
          label={<Typography variant="body1">Staff 2 </Typography>}
        />
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label={<Typography variant="body1">Staff 3 </Typography>}
        />
      </FormGroup>
    </Stack>
  </Box>
);
