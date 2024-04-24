import type { FC } from 'react';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface TypeOption {
  description: string;
  title: string;
  value: string;
}

const typeOptions: TypeOption[] = [
  {
    description: "I'm looking for teammates to join in a personal project",
    title: "I'm a freelancer",
    value: 'freelancer',
  },
  {
    description: "I'm looking for freelancer or contractors to take care of my project",
    title: 'I’m a project owner',
    value: 'projectOwner',
  },
  {
    description: "I'm looking for freelancer or contractors to take care of my project",
    title: 'I want to join affiliate',
    value: 'affiliate',
  },
];

export const Form9: FC = () => (
  <Box sx={{ p: 3 }}>
    <form onSubmit={(event) => event.preventDefault()}>
      <Stack
        component={RadioGroup}
        spacing={3}
      >
        {typeOptions.map((option) => (
          <Paper
            key={option.value}
            sx={{
              alignItems: 'flex-start',
              display: 'flex',
              p: 2,
            }}
            variant="outlined"
          >
            <FormControlLabel
              control={<Radio />}
              key={option.value}
              label={
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle2">{option.title}</Typography>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    {option.description}
                  </Typography>
                </Box>
              }
              value={option.value}
            />
          </Paper>
        ))}
      </Stack>
    </form>
  </Box>
);
