import { FC } from 'react';
import { Theme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';
import DialogContent from '@mui/material/DialogContent';
import { DialogActions } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { PatientInput } from '../../../types/patient';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import { getStaffNameById } from 'src/utils/get-staff-name-by-id';
import { User } from '@prisma/client';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(staff: User, assignedStaffs: readonly string[], theme: Theme) {
  return {
    fontWeight:
      assignedStaffs.indexOf(staff.id) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

interface CustomerFormModalProps {
  open: boolean;
  handleClose: () => void;
  /**
   * List of staffs ID
   */
  assignedStaffs: string[];
  staffs: User[];
  handleChange: (event: SelectChangeEvent<string[]>) => void;
  theme: Theme;
  onSubmit: (data: PatientInput) => void;
  handleSubmit: any;
  register: any;
  errors: any;
  handleRemoveStaff: (staffId: string) => void;
  isLoading: boolean;
}

export const CustomerFormModal: FC<CustomerFormModalProps> = (props) => {
  return (
    <Dialog open={props.open}>
      <form onSubmit={props.handleSubmit(props.onSubmit)}>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
          sx={{
            px: 2,
            py: 1,
          }}
        >
          <Typography
            sx={{ flexGrow: 1 }}
            variant="h6"
          >
            New Customer
          </Typography>
          <IconButton onClick={props.handleClose}>
            <SvgIcon>
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
        <DialogContent>
          <Grid
            container
            spacing={3}
          >
            <Grid xs={6}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                First name*
              </Typography>
              <FormControl
                error={!!props.errors?.first_name}
                variant="standard"
                fullWidth
              >
                <OutlinedInput
                  id="first-name"
                  fullWidth
                  {...props.register('first_name')}
                  aria-describedby="component-error-text"
                />
                <FormHelperText>{props.errors?.first_name?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Last name*
              </Typography>
              <FormControl
                error={!!props.errors?.last_name}
                variant="standard"
                fullWidth
              >
                <OutlinedInput
                  fullWidth
                  {...props.register('last_name')}
                />
                <FormHelperText>{props.errors?.last_name?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Phone
              </Typography>
              <OutlinedInput
                fullWidth
                name="phone"
                type="tel"
                {...props.register('phone')}
              />
            </Grid>
            <Grid xs={6}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Identification Number
              </Typography>
              <OutlinedInput
                fullWidth
                {...props.register('identification_number')}
              />
            </Grid>

            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Email*
              </Typography>
              <FormControl
                error={!!props.errors?.email}
                variant="standard"
                fullWidth
              >
                <OutlinedInput
                  fullWidth
                  {...props.register('email')}
                />
                <FormHelperText>{props.errors?.email?.message}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Assign staff
              </Typography>

              <FormControl fullWidth>
                <Select
                  id="demo-multiple-chip"
                  multiple
                  {...props.register('assignedStaffs')}
                  value={props.assignedStaffs}
                  onChange={props.handleChange}
                  input={<OutlinedInput id="select-multiple-chip" />}
                  renderValue={(selected: string[]) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={getStaffNameById(value, props.staffs)}
                          onDelete={() => props.handleRemoveStaff(value)}
                          onMouseDown={(event) => {
                            event.stopPropagation();
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {props.staffs?.map((staff) => (
                    <MenuItem
                      key={staff.id}
                      value={staff.id}
                      style={getStyles(staff, props.assignedStaffs, props.theme)}
                    >
                      {staff.first_name + ' ' + staff.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            type="submit"
            variant="contained"
            disabled={props.isLoading}
          >
            Create new customer
            {props.isLoading && (
              <CircularProgress
                sx={{ ml: 1 }}
                size={20}
              />
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
