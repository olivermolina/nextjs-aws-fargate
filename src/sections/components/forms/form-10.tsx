import type { FC } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { QuillEditor } from 'src/components/quill-editor';

export const Form10: FC = () => (
  <Box sx={{ p: 3 }}>
    <form onSubmit={(event) => event.preventDefault()}>
      <TextField
        fullWidth
        label="Product Name"
        name="name"
      />
      <Typography
        sx={{
          mt: 3,
          mb: 2,
        }}
        variant="subtitle2"
      >
        Description
      </Typography>
      <QuillEditor
        placeholder="Write something"
        sx={{ height: 400 }}
      />
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
