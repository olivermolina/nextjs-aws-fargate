import React from 'react';
import { CSVImporter } from 'csv-import-react';
import { useTheme } from '@mui/material/styles';

type Props = {
  open: boolean;
  handleClose: () => void;
  handleImport: (data: any) => Promise<void>;
};

function CustomerImport(props: Props) {
  const { open, handleClose, handleImport } = props;
  const theme = useTheme();
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <CSVImporter
      isModal
      modalIsOpen={open}
      modalOnCloseTriggered={handleClose}
      darkMode={isDarkMode}
      onComplete={handleImport}
      waitOnComplete={true}
      template={{
        columns: [
          {
            name: 'First Name',
            key: 'first_name',
            required: true,
            description: 'The first name of the user',
            suggested_mappings: ['First', 'first_name'],
          },
          {
            name: 'Last Name',
            key: 'last_name',
            required: true,
            description: 'The last name of the user',
            suggested_mappings: ['Last', 'last_name'],
          },
          {
            name: 'Email',
            key: 'email',
            required: true,
            description: 'The email of the user',
            suggested_mappings: ['Email', 'Email Address'],
          },
          {
            name: 'Status',
            key: 'status',
            data_type: 'boolean',
            description: 'Active or Inactive',
          },
          {
            name: 'Birthday',
            key: 'birthday',
            required: true,
            data_type: 'date',
            description: 'Format: YYYY-MM-DD',
          },
          {
            name: 'Phone Number',
            key: 'phone_number',
            suggested_mappings: ['Phone', 'phone_number'],
          },
          {
            name: 'Address',
            key: 'address',
          },
          {
            name: 'Gender',
            key: 'gender',
            description: 'Male or Female',
          },
        ],
      }}
      primaryColor={theme.palette.primary.main}
      customStyles={{
        'font-family': theme.typography.fontFamily || 'cursive',
        'font-size': `${theme.typography.fontSize}px` || '15px',
        'base-spacing': '2rem',
        'border-radius': '8px',
        'color-primary': theme.palette.primary.main || 'salmon',
        'color-primary-hover': theme.palette.primary.darkest || 'crimson',
        'color-secondary': theme.palette.primary.main || 'indianRed',
        'color-secondary-hover': theme.palette.primary.darkest || 'crimson',
        'color-tertiary': theme.palette.secondary.main || 'indianRed',
        'color-tertiary-hover': theme.palette.secondary.darkest || 'crimson',
        'color-border': theme.palette.secondary.darkest || 'lightCoral',
        'color-text': theme.palette.primary.main || 'brown',
        'color-text-soft': theme.palette.secondary.darkest || 'rgba(165, 42, 42, .5)',
        'color-text-on-primary': theme.palette.primary.contrastText,
        'color-text-on-secondary': theme.palette.secondary.contrastText,
        'color-background': 'bisque',
        'color-background-modal': 'blanchedAlmond',
        'color-input-background': 'blanchedAlmond',
        'color-input-background-soft': 'white',
        'color-background-menu-hover': 'bisque',
        'color-importer-link': 'indigo',
        'color-progress-bar': 'darkGreen',
      }}
    />
  );
}

export default React.memo(CustomerImport);
