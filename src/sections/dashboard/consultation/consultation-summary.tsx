import type { ChangeEvent, FC } from 'react';
import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

import type { Consultation } from 'src/types/consultation';
import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';

const statusOptions: string[] = ['Canceled', 'Complete'];

interface ConsultationSummaryProps {
  consultation: Consultation;
}

export const ConsultationSummary: FC<ConsultationSummaryProps> = (props) => {
  const { consultation, ...other } = props;
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const [status, setStatus] = useState<string>(statusOptions[0]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setStatus(event.target.value);
  }, []);

  const align = mdUp ? 'horizontal' : 'vertical';
  const createdAt = format(new Date(consultation.created_at), 'dd/MM/yyyy HH:mm');
  const fullName = consultation.user.first_name + ' ' + consultation.user.last_name;

  return (
    <Card {...other}>
      <CardHeader title="Basic info" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          label="Customer"
        >
          <Typography variant="subtitle2">{fullName}</Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {consultation.user.address?.address_line1}
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {consultation.user.address?.city}
          </Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {consultation.user.address?.country}
          </Typography>
        </PropertyListItem>
        <Divider />
        <PropertyListItem
          align={align}
          label="ID"
          value={consultation.id}
        />
        {/*<Divider />*/}
        {/*<PropertyListItem*/}
        {/*  align={align}*/}
        {/*  label="Invoice"*/}
        {/*  value={consultation.number}*/}
        {/*/>*/}
        <Divider />
        <PropertyListItem
          align={align}
          label="Date"
          value={createdAt}
        />
        {/*<Divider />*/}
        {/*<PropertyListItem*/}
        {/*  align={align}*/}
        {/*  label="Promotion Code"*/}
        {/*  value={consultation.promotionCode}*/}
        {/*/>*/}
        {/*<Divider />*/}
        {/*<PropertyListItem*/}
        {/*  align={align}*/}
        {/*  label="Total Amount"*/}
        {/*  value={`${consultation.currency}${consultation.totalAmount}`}*/}
        {/*/>*/}
        <Divider />
        <PropertyListItem
          align={align}
          label="Status"
        >
          <Stack
            alignItems={{
              xs: 'stretch',
              sm: 'center',
            }}
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1}
          >
            <TextField
              label="Status"
              margin="normal"
              name="status"
              onChange={handleChange}
              select
              SelectProps={{ native: true }}
              sx={{
                flexGrow: 1,
                minWidth: 150,
              }}
              value={status}
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
            <Button variant="contained">Save</Button>
          </Stack>
        </PropertyListItem>
      </PropertyList>
    </Card>
  );
};

ConsultationSummary.propTypes = {
  // @ts-ignore
  consultation: PropTypes.object.isRequired,
};
