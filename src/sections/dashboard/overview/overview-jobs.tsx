import type { FC } from 'react';
import Briefcase01Icon from '@untitled-ui/icons-react/build/esm/Briefcase01';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

export const OverviewJobs: FC = (props) => (
  <Card {...props}>
    <CardContent>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
        }}
      >
        <SvgIcon color="primary">
          <Briefcase01Icon />
        </SvgIcon>
        <Typography
          color="primary.main"
          sx={{ pl: 1 }}
          variant="subtitle2"
        >
          Jobs
        </Typography>
      </Box>
      <Typography
        variant="h6"
        sx={{ mt: 2 }}
      >
        Find your dream job
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ mt: 1 }}
        variant="body2"
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
      </Typography>
    </CardContent>
    <Divider />
    <CardActions>
      <Button
        color="inherit"
        endIcon={
          <SvgIcon>
            <ArrowRightIcon />
          </SvgIcon>
        }
        size="small"
      >
        Search Jobs
      </Button>
    </CardActions>
  </Card>
);
