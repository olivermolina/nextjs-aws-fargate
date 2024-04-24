import type { FC } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';

export const CustomerPayment: FC = (props) => {
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const align = mdUp ? 'horizontal' : 'vertical';

  return (
    <Card {...props}>
      <CardHeader title="Summary" />
      <PropertyList>

        <PropertyListItem
          align={align}
          divider
          label="Paid"
          value="2 ($50.00)"
        />
        <PropertyListItem
          align={align}
          divider
          label="Unpaid/Due"
          value="1 ($12.00)"
        />

      </PropertyList>
      <Divider />
      <CardActions sx={{ flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="outlined"
        >
          Create Invoice
        </Button>
        <Button size="small">Resend Due Invoices</Button>
      </CardActions>
    </Card>
  );
};
