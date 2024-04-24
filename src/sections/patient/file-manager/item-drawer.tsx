import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import { backdropClasses } from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { bytesToSize } from 'src/utils/bytes-to-size';

import { ItemIcon } from './item-icon';
import { useSignedUrlFile } from 'src/hooks/use-signed-url-file';
import { FileWithUser } from 'src/types/user';

interface ItemDrawerProps {
  item?: FileWithUser;
  onClose?: () => void;
  onTagsChange?: (itemId: string, value: string[]) => void;
  open?: boolean;
  handleShareFile?: (itemId: string, shareWithPatient: boolean) => Promise<void>;
  isSubFiles?: boolean;
  onDelete?: (itemId: string) => void;
}

export const ItemDrawer: FC<ItemDrawerProps> = (props) => {
  const { item, onClose, open = false, isSubFiles } = props;
  const extension = item?.name.split('.').pop();
  const fileName = item?.name.split('.')[0];
  const signedUrl = useSignedUrlFile(item?.id, isSubFiles);

  let content: JSX.Element | null = null;

  if (item) {
    const size = bytesToSize(item.size);
    const createdAt = item.created_at && format(item.created_at, 'MMM dd, yyyy HH:mm');

    content = (
      <div>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="flex-end"
          spacing={2}
          sx={{ p: 3 }}
        >
          <span />
          <IconButton onClick={onClose}>
            <SvgIcon fontSize="small">
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
        <Divider />
        <Box
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.50',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'neutral.500' : 'neutral.300',
              borderRadius: 1,
              borderStyle: 'dashed',
              borderWidth: 1,
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
              p: 3,
            }}
          >
            <ItemIcon
              type={'file'}
              extension={extension}
              previewUrl={signedUrl.url}
            />
          </Box>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">{fileName}</Typography>
          </Stack>
          <Grid
            container
            spacing={3}
          >
            <Grid
              xs={12}
              sm={4}
            >
              <Typography
                color="text.secondary"
                variant="caption"
              >
                Size
              </Typography>
            </Grid>
            <Grid
              xs={12}
              sm={8}
            >
              <Typography variant="body2">{size}</Typography>
            </Grid>
            <Grid
              xs={12}
              sm={4}
            >
              <Typography
                color="text.secondary"
                variant="caption"
              >
                Created At
              </Typography>
            </Grid>
            <Grid
              xs={12}
              sm={8}
            >
              <Typography variant="body2">{createdAt}</Typography>
            </Grid>
          </Grid>
        </Box>
      </div>
    );
  }

  return (
    <Drawer
      anchor="right"
      ModalProps={{
        sx: {
          [`& .${backdropClasses.root}`]: {
            background: 'transparent !important',
          },
        },
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          maxWidth: '100%',
          width: { sm: 400, lg: '50%' },
        },
      }}
    >
      {content}
    </Drawer>
  );
};

ItemDrawer.propTypes = {
  // @ts-ignore
  item: PropTypes.object,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  onFavorite: PropTypes.func,
  onTagsChange: PropTypes.func,
  open: PropTypes.bool,
};


