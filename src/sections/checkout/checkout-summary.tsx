import React, { ChangeEvent, FC } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import { Product } from 'src/hooks/use-products';

const calculateAmounts = (
  products: Product[],
  percentOff: number
): {
  subtotal: number;
  discount: number;
  total: number;
} => {
  const subtotal = products.reduce((acc, product) => {
    return acc + product.price * product.quantity;
  }, 0);
  const discount = percentOff > 0 ? subtotal * (percentOff / 100) : 0;

  const total = subtotal - discount;

  return {
    subtotal,
    discount,
    total,
  };
};

interface CheckoutOrderSummaryProps {
  onQuantityChange?: (quantity: number, productId: string) => void;
  products?: Product[];
  plans?: Product[];
  onPlanChange?: (event: SelectChangeEvent<string>) => void;
  onApplyDiscountCode: () => void;
  handleDiscountCodeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  couponIsLoading: boolean;
  percentOff: number;
}

export const CheckoutSummary: FC<CheckoutOrderSummaryProps> = (props) => {
  const {
    onQuantityChange,
    products = [],
    onPlanChange,
    onApplyDiscountCode,
    plans,
    handleDiscountCodeChange,
    couponIsLoading,
    percentOff,
    ...other
  } = props;
  const { subtotal, total, discount } = calculateAmounts(products, percentOff);

  const formattedSubtotal = numeral(subtotal).format('$0.00');
  const formattedDiscount = numeral(discount).format('$0.00');
  const formattedTotal = numeral(total).format('$0.00');

  return (
    <Card
      variant="outlined"
      sx={{ p: 3 }}
      {...other}
    >
      <Typography variant="h6">Order Summary</Typography>
      <List sx={{ mt: 2 }}>
        {products.map((product) => {
          const price = numeral(product.price).format('$00.00');

          return (
            <ListItem
              disableGutters
              key={product.id}
            >
              {product.type === 'plan' ? (
                <ListItemText
                  sx={{
                    width: '100%',
                  }}
                  primary={
                    <Typography
                      sx={{ fontWeight: 'fontWeightBold' }}
                      variant="subtitle2"
                    >
                      Plan
                    </Typography>
                  }
                  secondary={
                    <Select
                      labelId="plan-type-label"
                      id="plan-type"
                      value={product.id}
                      fullWidth
                      onChange={onPlanChange}
                      size={'small'}
                    >
                      {plans?.map((plan) => (
                        <MenuItem
                          value={plan.id}
                          key={plan.id}
                        >
                          {plan.name} - ${plan.price}
                        </MenuItem>
                      ))}
                    </Select>
                  }
                />
              ) : (
                <ListItemText
                  primary={
                    <Typography
                      sx={{ fontWeight: 'fontWeightBold' }}
                      variant="subtitle2"
                    >
                      {product.name}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      color="text.secondary"
                      sx={{ mt: 1 }}
                      variant="body1"
                    >
                      {price}
                    </Typography>
                  }
                />
              )}

              {product.type === 'additional_users' && (
                <Autocomplete
                  id="free-solo-demo"
                  freeSolo
                  value={product.quantity?.toString()}
                  options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                  forcePopupIcon
                  onChange={(event, value) => {
                    onQuantityChange?.(Number(value), product.id);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant={'outlined'}
                      size={'small'}
                      sx={{
                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                          display: 'none',
                        },
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                        },
                      }}
                      type={'number'}
                    />
                  )}
                />
              )}
            </ListItem>
          );
        })}
      </List>
      <TextField
        fullWidth
        placeholder="Discount Code"
        size="small"
        sx={{ mt: 2 }}
        onChange={handleDiscountCodeChange}
        variant={'outlined'}
        InputProps={{
          endAdornment: couponIsLoading && (
            <InputAdornment position="end">
              <CircularProgress
                sx={{ ml: 1 }}
                size={15}
              />
            </InputAdornment>
          ),
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 2,
        }}
      >
        <Button
          type="button"
          onClick={onApplyDiscountCode}
        >
          Apply Coupon
        </Button>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 2,
        }}
      >
        <Typography variant="subtitle2">Subtotal</Typography>
        <Typography variant="subtitle2">{formattedSubtotal}</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 2,
        }}
      >
        <Typography variant="subtitle2">Discount</Typography>
        <Typography variant="subtitle2">{formattedDiscount}</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle2">Total</Typography>
        <Typography variant="subtitle2">{formattedTotal}</Typography>
      </Box>
    </Card>
  );
};

CheckoutSummary.propTypes = {
  onQuantityChange: PropTypes.func,
  products: PropTypes.array,
};
