import type { FC } from 'react';
import { useCallback } from 'react';
import { format } from 'date-fns';
import DotsVerticalIcon from '@untitled-ui/icons-react/build/esm/DotsVertical';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { usePopover } from 'src/hooks/use-popover';
import { bytesToSize } from 'src/utils/bytes-to-size';

import { ItemIcon } from './item-icon';
import { ItemMenu } from './item-menu';
import { FileWithUser } from 'src/types/user';
import { useSignedUrlFile } from 'src/hooks/use-signed-url-file';

interface ItemListCardProps {
  item: FileWithUser;
  onDelete?: (itemId: string) => void;
  onOpen?: (itemId: string) => void;
  openFolder?: (itemId: string) => void;
  isSubFiles?: boolean;
  userInitials?: string;
}

export const ItemListCard: FC<ItemListCardProps> = (props) => {
  const { item, onDelete, onOpen, openFolder, isSubFiles, userInitials } = props;
  const popover = usePopover<HTMLButtonElement>();

  const signedUrl = useSignedUrlFile(item?.id, isSubFiles);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(signedUrl.url);
  }, [signedUrl]);

  const handleDelete = useCallback((): void => {
    popover.handleClose();
    onDelete?.(item.id);
  }, [item, popover, onDelete]);

  const size = bytesToSize(item.size);
  const extension = item?.name.split('.').pop();
  const fileName = item?.name.split('.')[0];
  const createdAt = item.created_at && format(item.created_at, 'MMM dd, yyyy');
  const showShared = item.shared_with_patient;

  return (
    <>
      <Card
        key={item.id}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 0,
          transition: (theme) =>
            theme.transitions.create(['background-color, box-shadow'], {
              easing: theme.transitions.easing.easeInOut,
              duration: 200,
            }),
          '&:hover': {
            backgroundColor: 'background.paper',
            boxShadow: 16,
          },
        }}
        variant="outlined"
      >
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={3}
          sx={{
            pt: 2,
            px: 2,
          }}
        >
          <span />
          <IconButton
            onClick={popover.handleOpen}
            ref={popover.anchorRef}
          >
            <SvgIcon fontSize="small">
              <DotsVerticalIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              mb: 1,
            }}
          >
            <Box
              onClick={() => (item.type === 'folder' ? openFolder?.(item.id) : onOpen?.(item.id))}
              sx={{
                display: 'inline-flex',
                cursor: 'pointer',
              }}
            >
              <ItemIcon
                type={item.type === 'folder' ? 'folder' : 'file'}
                extension={extension}
              />
            </Box>
          </Box>
          <Typography
            onClick={() => (item.type === 'folder' ? openFolder?.(item.id) : onOpen?.(item.id))}
            sx={{ cursor: 'pointer' }}
            variant="subtitle2"
          >
            {fileName}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={1}
          >
            <div>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                {size}
              </Typography>
            </div>
            <div>
              {showShared && (
                <AvatarGroup max={3}>
                  <Avatar
                    sx={{
                      height: 32,
                      width: 32,
                    }}
                  >
                    {userInitials}
                  </Avatar>
                </AvatarGroup>
              )}
            </div>
          </Stack>
          <Typography
            color="text.secondary"
            variant="caption"
          >
            Created at {createdAt}
          </Typography>
        </Box>
      </Card>
      <ItemMenu
        anchorEl={popover.anchorRef.current}
        onClose={popover.handleClose}
        onDelete={handleDelete}
        open={popover.open}
        onCopy={handleCopy}
      />
    </>
  );
};
