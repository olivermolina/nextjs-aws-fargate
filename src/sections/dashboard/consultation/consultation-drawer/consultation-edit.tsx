import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Consultation } from 'src/types/consultation';
import MenuItem from '@mui/material/MenuItem';

const statusOptions = [
  {
    label: 'Canceled',
    value: 'canceled',
  },
  {
    label: 'Complete',
    value: 'complete',
  },
  {
    label: 'Pending',
    value: 'pending',
  },
];

interface ConsultationEditProps {
  onCancel?: () => void;
  onSave?: () => void;
  consultation: Consultation;
}

export const ConsultationEdit: FC<ConsultationEditProps> = (props) => {
  const { onCancel, onSave, consultation } = props;

  const createdAt = format(new Date(consultation.created_at), 'dd/MM/yyyy HH:mm');
  const fullName = consultation.user.first_name + ' ' + consultation.user.last_name;

  return (
    <Stack spacing={6}>
      <Stack spacing={3}>
        <Typography variant="h6">Details</Typography>
        <Stack spacing={3}>
          <TextField
            disabled
            fullWidth
            label="ID"
            name="id"
            value={consultation.id}
          />

          <TextField
            disabled
            fullWidth
            label="Customer name"
            name="customer_name"
            value={fullName}
          />
          <TextField
            disabled
            fullWidth
            label="Date"
            name="date"
            value={createdAt}
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={consultation.user.address?.address_line1}
          />
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={consultation.user.address?.country}
            select
          >
            {['CA', 'MX', 'US'].map((option) => (
              <MenuItem
                key={option}
                value={option}
              >
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="State/Region"
            name="state_region"
            value={consultation.user.address?.city}
          />
          <TextField
            fullWidth
            label="Status"
            name="status"
            select
            SelectProps={{ native: true }}
            value={consultation.status}
          >
            {statusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </TextField>
        </Stack>
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          spacing={2}
        >
          <Button
            color="primary"
            onClick={onSave}
            size="small"
            variant="contained"
          >
            Save changes
          </Button>
          <Button
            color="inherit"
            onClick={onCancel}
            size="small"
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

ConsultationEdit.propTypes = {
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
};
