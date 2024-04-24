import { FC, useEffect, useState } from 'react';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { DialogActions } from '@mui/material';
import Button from '@mui/material/Button';
import { Template, User } from '@prisma/client';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import UserAutocomplete, { AutoCompleteUser } from '../../../components/user-autocomplete';

interface Props {
  onClose?: () => void;
  open?: boolean;
  handleSubmit: (templateId: string, patientIds: string[]) => void;
  isSubmitting?: boolean;
  template?: Template;
  patients?: User[];
}

export const TemplateShareModal: FC<Props> = (props) => {
  const { onClose, open = false, handleSubmit, isSubmitting, template, patients } = props;

  const [selectedPatients, setSelectedPatients] = useState<AutoCompleteUser[]>([]);

  const handleSelectPatient = (users: AutoCompleteUser[]) => {
    setSelectedPatients(users);
  };

  const onSubmit = () => {
    if (template && selectedPatients.length) {
      handleSubmit(
        template.id,
        selectedPatients.map((user) => user.id),
      );
    }
  };

  useEffect(() => {
    // Reset selected patients when the modal is closed
    if (!open) {
      setSelectedPatients([]);
    }
  }, [open]);

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={3}
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h6">
          {template ? `Share ${template.title}` : 'Share template'}
        </Typography>
        <IconButton
          color="inherit"
          onClick={onClose}
        >
          <SvgIcon>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <DialogContent>
        <FormControl
          fullWidth
          size={'small'}
        >
          <FormLabel
            sx={{
              color: 'text.primary',
              mb: 1,
            }}
          >
            Select Patients
          </FormLabel>
          <UserAutocomplete
            error={false}
            helperText=""
            onChange={handleSelectPatient}
            options={patients || []}
            selectedOptions={selectedPatients}
            label={''}
            showAvatarColor={false}
            size={'medium'}
            variant={'outlined'}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          variant={'outlined'}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isSubmitting || selectedPatients.length === 0}
          onClick={onSubmit}
          color={'primary'}
        >
          Share
          {isSubmitting && (
            <CircularProgress
              sx={{ ml: 1 }}
              size={20}
            />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
