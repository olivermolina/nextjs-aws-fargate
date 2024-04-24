import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNowStrict } from 'date-fns';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChatImageFullScreenDialog from './chat-image-viewer-full-screen-dialog';
import { useDialog } from '../../../hooks/use-dialog';
import { FileIcon } from '../../../components/file-icon';
import Button from '@mui/material/Button';
import UserAvatar from '../../../components/user-avatar';

interface ChatMessageProps {
  id: string;
  authorAvatar?: string | null;
  authorName: string;
  body: string;
  contentType: string;
  createdAt: number;
  position?: 'left' | 'right';
  filename?: string;
}

export const ChatMessage: FC<ChatMessageProps> = (props) => {
  const {
    id,
    authorAvatar,
    authorName,
    body,
    contentType,
    createdAt,
    position,
    filename,
    ...other
  } =
    props;
  const dialog = useDialog();
  const ago = formatDistanceToNowStrict(createdAt);
  const extension = filename?.split('.').pop();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: position === 'right' ? 'flex-end' : 'flex-start',
      }}
      {...other}
    >
      <Stack
        alignItems="flex-start"
        direction={position === 'right' ? 'row-reverse' : 'row'}
        spacing={2}
        sx={{
          maxWidth: 500,
          ml: position === 'right' ? 'auto' : 0,
          mr: position === 'left' ? 'auto' : 0,
        }}
      >
        <UserAvatar
          userId={id}
          height={32}
          width={32}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Card
            sx={{
              backgroundColor: position === 'right' ? 'primary.main' : 'background.paper',
              color: position === 'right' ? 'primary.contrastText' : 'text.primary',
              px: 2,
              py: 1,
            }}
          >
            <Box sx={{ mb: 1 }}>
              <Link
                color="inherit"
                sx={{ cursor: 'pointer' }}
                variant="subtitle2"
              >
                {authorName}
              </Link>
            </Box>
            {['jpeg', 'jpg', 'png'].includes(contentType) && (
              <CardMedia
                onClick={dialog.handleOpen}
                image={body}
                sx={{
                  height: 200,
                  width: 200,
                  cursor: 'zoom-in',
                }}
              />
            )}
            {!['jpeg', 'jpg', 'png', 'text'].includes(contentType) && (
              <Link
                component={Button}
                href={body || '#'}
              >
                <Stack
                  direction={'row'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    maxHeight: 200,
                    p: 2,
                  }}
                  spacing={1}
                >
                  <FileIcon
                    extension={extension}
                    previewUrl={body}
                    showPreview={false}
                  />
                  <Typography
                    sx={{
                      color: 'text.primary',
                    }}
                  >
                    {filename}
                  </Typography>
                </Stack>
              </Link>
            )}
            {contentType === 'text' && (
              <Typography
                color="inherit"
                variant="body1"
              >
                {body}
              </Typography>
            )}
          </Card>
          <Box
            sx={{
              display: 'flex',
              justifyContent: position === 'right' ? 'flex-end' : 'flex-start',
              mt: 1,
              px: 2,
            }}
          >
            <Typography
              color="text.secondary"
              noWrap
              variant="caption"
            >
              {ago} ago
            </Typography>
          </Box>
        </Box>
      </Stack>

      <ChatImageFullScreenDialog
        image={body}
        open={dialog.open}
        handleClose={dialog.handleClose}
        fileName={filename || ''}
      />
    </Box>
  );
};

ChatMessage.propTypes = {
  authorAvatar: PropTypes.string.isRequired,
  authorName: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  contentType: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  position: PropTypes.oneOf(['left', 'right']),
};
