import type { FC } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

export const CustomerDataManagement: FC = (props) => (
  <Card {...props}>
    <CardHeader title="Data Management" />
    <CardContent sx={{ pt: 0 }}>
      <Button
        color="error"
        variant="outlined"
      >
        Delete Account
      </Button>
      <Box sx={{ mt: 1 }}>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          Remove this customer’s chart if he requested that, if not please be aware that what has
          been deleted can never brought back
        </Typography>
      </Box>
    </CardContent>
  </Card>
);
