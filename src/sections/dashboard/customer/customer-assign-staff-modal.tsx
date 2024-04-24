import React, { FC } from 'react';
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
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import { getStaffNameById } from 'src/utils/get-staff-name-by-id';
import { Controller } from 'react-hook-form';
import { getUserFullName } from '../../../utils/get-user-full-name';
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

interface CustomerAssignStaffModalProps {
  open: boolean;
  handleClose: () => void;
  staffs: User[];
  theme: Theme;
  onSubmit: (data: any) => void;
  handleSubmit: any;
  errors: any;
  handleRemoveStaff: (staffIds: [string, ...string[]]) => void;
  isLoading: boolean;
  control: any;
}

export const CustomerAssignStaffModal: FC<CustomerAssignStaffModalProps> = (props) => {
  return (
    <Dialog open={props.open} fullWidth maxWidth={'sm'}>
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
            Assign Staff
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
            <Grid xs={12}>
              <Typography
                sx={{ mb: 1 }}
                variant="subtitle2"
              >
                Assign staff
              </Typography>

              <FormControl
                fullWidth
                error={!!props.errors.staffIds}
              >
                <Controller
                  control={props.control}
                  name={'staffIds'}
                  defaultValue={[]}
                  render={({ field }) => {
                    return (
                      <Select
                        id="demo-multiple-chip"
                        multiple
                        onChange={field.onChange}
                        input={<OutlinedInput id="select-multiple-chip" />}
                        value={field.value}
                        renderValue={(selected: [string, ...string[]]) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip
                                key={value}
                                label={getStaffNameById(value, props.staffs)}
                                onDelete={() =>
                                  props.handleRemoveStaff(
                                    field.value?.filter((staffId: string) => staffId !== value),
                                  )
                                }
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
                            style={getStyles(staff, field.value, props.theme)}
                          >
                            {getUserFullName(staff)}
                          </MenuItem>
                        ))}
                      </Select>
                    );
                  }}
                />
                {!!props.errors.staffIds && (
                  <FormHelperText>{props.errors.staffIds.message}</FormHelperText>
                )}
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
            Save
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
