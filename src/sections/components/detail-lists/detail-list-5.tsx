import type { ChangeEvent, FC } from 'react';
import { useCallback, useState } from 'react';
import { format } from 'date-fns';
import numeral from 'numeral';
import ReceiptIcon from '@untitled-ui/icons-react/build/esm/Receipt';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface Order {
  id: string;
  coupon: string | null;
  createdAt: number;
  currency: string;
  customer: {
    address1: string;
    address2: string;
    city: string;
    country: string;
    email: string;
    name: string;
  };
  items: {
    id: string;
    billingCycle: string;
    currency: string;
    name: string;
    quantity: number;
    unitAmount: number;
  }[];
  number: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
}

const order: Order = {
  id: '5ecb8a6879877087d4aa2690',
  coupon: null,
  createdAt: new Date().getTime(),
  currency: '$',
  customer: {
    address1: 'Street John Wick, no. 7',
    address2: 'House #25',
    city: 'San Diego',
    country: 'USA',
    email: 'miron.vitold@devias.io',
    name: 'Miron Vitold',
  },
  items: [
    {
      id: '5ecb8abbdd6dfb1f9d6bf98b',
      billingCycle: 'monthly',
      currency: '$',
      name: 'Project Points',
      quantity: 25,
      unitAmount: 50.25,
    },
    {
      id: '5ecb8ac10f116d04bed990eb',
      billingCycle: 'monthly',
      currency: '$',
      name: 'Freelancer Subscription',
      quantity: 1,
      unitAmount: 5.0,
    },
  ],
  number: 'DEV-103',
  paymentMethod: 'CreditCard',
  status: 'pending',
  totalAmount: 500.0,
};

const statusOptions: string[] = ['Canceled', 'Completed'];

export const DetailList5: FC = () => {
  const [status, setStatus] = useState<string>(statusOptions[0]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setStatus(event.target.value);
  }, []);

  const createdAt = format(order.createdAt, 'dd/MM/yyyy HH:mm');
  const totalAmount = numeral(order.totalAmount).format(`${order.currency}0,0.00`);

  return (
    <Box
      sx={{
        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100'),
        p: 3,
      }}
    >
      <Card>
        <CardHeader title="Order info" />
        <Divider />
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">Customer</Typography>
              </TableCell>
              <TableCell>
                <div>{order.customer.name}</div>
                <div>{order.customer.address1}</div>
                <div>{order.customer.city}</div>
                <div>{order.customer.country}</div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">ID</Typography>
              </TableCell>
              <TableCell>#{order.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">Number</Typography>
              </TableCell>
              <TableCell>{order.number}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">Date</Typography>
              </TableCell>
              <TableCell>{createdAt}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">Promotion Code</Typography>
              </TableCell>
              <TableCell>{order.coupon ? order.coupon : 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">Total Amount</Typography>
              </TableCell>
              <TableCell>{totalAmount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">Status</Typography>
              </TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  name="option"
                  onChange={handleChange}
                  select
                  SelectProps={{ native: true }}
                  value={status}
                  variant="outlined"
                >
                  {statusOptions.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </TextField>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <CardActions>
          <Button
            color="inherit"
            startIcon={
              <SvgIcon>
                <ReceiptIcon />
              </SvgIcon>
            }
          >
            Resend Invoice
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};
