import React, { FC, useCallback } from 'react';
import { format } from 'date-fns';
import DotsVerticalIcon from '@untitled-ui/icons-react/build/esm/DotsVertical';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { usePopover } from 'src/hooks/use-popover';
import { bytesToSize } from 'src/utils/bytes-to-size';

import { ItemIcon } from './item-icon';
import { ItemMenu } from './item-menu';
import { FileWithUser } from 'src/types/user';
import { useSignedUrlFile } from 'src/hooks/use-signed-url-file';
import UserAvatar from '../../../components/user-avatar';

interface ItemListRowProps {
  item: FileWithUser;
  onDelete?: (itemId: string) => void;
  onOpen?: (itemId: string) => void;
  openFolder?: (itemId: string) => void;
  isSubFiles?: boolean;
  userInitials?: string;
  userId?: string;
}

export const ItemListRow: FC<ItemListRowProps> = (props) => {
  const { userId, item, onDelete, onOpen, openFolder, isSubFiles } = props;
  const popover = usePopover<HTMLButtonElement>();
  const signedUrl = useSignedUrlFile(item?.id, isSubFiles);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(signedUrl.url);
  }, [signedUrl]);

  const handleDelete = useCallback((): void => {
    popover.handleClose();
    onDelete?.(item.id);
  }, [item, popover, onDelete]);

  let size = bytesToSize(item.size);

  const extension = item?.name.split('.').pop();
  const fileName = item?.name.split('.')[0];
  const createdAt = item.created_at && format(item.created_at, 'MMM dd, yyyy');
  const showShared = item?.shared_with_patient;

  return (
    <>
      <TableRow
        key={item.id}
        sx={{
          backgroundColor: 'transparent',
          borderRadius: 1.5,
          boxShadow: 0,
          transition: (theme) =>
            theme.transitions.create(['background-color', 'box-shadow'], {
              easing: theme.transitions.easing.easeInOut,
              duration: 200,
            }),
          '&:hover': {
            backgroundColor: 'background.paper',
            boxShadow: 16,
          },
          [`& .${tableCellClasses.root}`]: {
            borderBottomWidth: 1,
            borderBottomColor: 'divider',
            borderBottomStyle: 'solid',
            borderTopWidth: 1,
            borderTopColor: 'divider',
            borderTopStyle: 'solid',
            '&:first-of-type': {
              borderTopLeftRadius: (theme) => theme.shape.borderRadius * 1.5,
              borderBottomLeftRadius: (theme) => theme.shape.borderRadius * 1.5,
              borderLeftWidth: 1,
              borderLeftColor: 'divider',
              borderLeftStyle: 'solid',
            },
            '&:last-of-type': {
              borderTopRightRadius: (theme) => theme.shape.borderRadius * 1.5,
              borderBottomRightRadius: (theme) => theme.shape.borderRadius * 1.5,
              borderRightWidth: 1,
              borderRightColor: 'divider',
              borderRightStyle: 'solid',
            },
          },
        }}
      >
        <TableCell>
          <Stack
            alignItems="center"
            direction="row"
            spacing={2}
          >
            <Box
              onClick={() => (item.type === 'folder' ? openFolder?.(item.id) : onOpen?.(item.id))}
              sx={{ cursor: 'pointer' }}
            >
              <ItemIcon
                type={item.type === 'folder' ? 'folder' : 'file'}
                extension={extension}
              />
            </Box>
            <div>
              <Typography
                noWrap
                onClick={() => (item.type === 'folder' ? openFolder?.(item.id) : onOpen?.(item.id))}
                sx={{ cursor: 'pointer' }}
                variant="subtitle2"
              >
                {fileName}
              </Typography>
              <Typography
                color="text.secondary"
                noWrap
                variant="body2"
              >
                {size}
              </Typography>
            </div>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography
            noWrap
            variant="subtitle2"
          >
            Created at
          </Typography>
          <Typography
            color="text.secondary"
            noWrap
            variant="body2"
          >
            {createdAt}
          </Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex' }}>
            {showShared && (
              <AvatarGroup max={3}>
                <UserAvatar
                  userId={userId}
                  height={32}
                  width={32}
                />
              </AvatarGroup>
            )}
          </Box>
        </TableCell>
        <TableCell align="right">
          <IconButton
            onClick={popover.handleOpen}
            ref={popover.anchorRef}
          >
            <SvgIcon fontSize="small">
              <DotsVerticalIcon />
            </SvgIcon>
          </IconButton>
        </TableCell>
      </TableRow>
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
