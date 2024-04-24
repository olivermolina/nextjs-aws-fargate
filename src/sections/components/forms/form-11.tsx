import type { FC } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';

export const Form11: FC = () => (
  <Box sx={{ p: 3 }}>
    <form onSubmit={(event) => event.preventDefault()}>
      <Grid
        container
        spacing={3}
      >
        <Grid
          xs={12}
          md={6}
        >
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
          />
        </Grid>
        <Grid
          xs={12}
          md={6}
        >
          <TextField
            fullWidth
            label="Sale price"
            name="salePrice"
            type="number"
          />
        </Grid>
        <Grid xs={12}>
          <div>
            <FormControlLabel
              control={<Checkbox name="isTaxable" />}
              label="Product is taxable"
            />
          </div>
          <div>
            <FormControlLabel
              control={<Checkbox name="includesTaxes" />}
              label="Price includes taxes"
            />
          </div>
        </Grid>
      </Grid>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 3,
        }}
      >
        <Button
          type="submit"
          variant="contained"
        >
          Update
        </Button>
      </Box>
    </form>
  </Box>
);
