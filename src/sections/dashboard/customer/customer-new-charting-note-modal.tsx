import * as React from 'react';
import { useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { ChartType } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateChartInput, CreateChartSchema } from '../../../utils/zod-schemas/chart';

type CustomerNewChartingNoteModal = {
  open: boolean;
  handleClose: () => void;
  onSubmit: (data: CreateChartInput) => void;
  isLoading: boolean;
  patientId: string;
  consultationId?: string;
};

export default function CustomerNewChartingNoteModal(props: CustomerNewChartingNoteModal) {
  const { register, handleSubmit, reset } = useForm<CreateChartInput>({
    mode: 'onSubmit',
    resolver: zodResolver(CreateChartSchema),
  });

  useEffect(() => {
    reset({
      type: ChartType.FREE_TEXT,
      userId: props.patientId,
      name: '',
      service_datetime: new Date(),
      consultationId: props.consultationId,
    });
  }, [props.open, props.patientId, props.consultationId]);

  return (
    <React.Fragment>
      <Dialog
        open={props.open}
        fullWidth
        maxWidth={'sm'}
      >
        <form onSubmit={handleSubmit(props.onSubmit)}>
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
              Create Charting Note
            </Typography>
            <IconButton onClick={props.handleClose}>
              <SvgIcon>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Stack>
          <Divider />

          <DialogContent>
            <Stack spacing={2}>
              <TextField
                {...register('type')}
                select
                variant={'filled'}
                label={'Note Type*'}
                defaultValue={ChartType.FREE_TEXT}
              >
                <MenuItem value={ChartType.FREE_TEXT}>Free Text</MenuItem>
                <MenuItem value={ChartType.SOAP}>SOAP</MenuItem>
              </TextField>
              <TextField
                {...register('name')}
                variant={'filled'}
                label={'Note Name*'}
                defaultValue={ChartType.FREE_TEXT}
              />
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions
            sx={{
              justifyContent: 'center',
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={props.isLoading}
            >
              Create Note
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
    </React.Fragment>
  );
}
