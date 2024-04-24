import { File as PrismaFile, SubFile, User } from '@prisma/client';
import React, { useState } from 'react';
import { useSignedUrlFile } from '../../../hooks/use-signed-url-file';
import { Card, CardContent, Typography } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import DescriptionIcon from '@mui/icons-material/Description';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import dayjs from 'dayjs';
import { bytesToSize } from '../../../utils/bytes-to-size';
import { getUserFullName } from '../../../utils/get-user-full-name';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';

type CustomerProfileFileCardProps = {
  file: PrismaFile | SubFile;
  createdBy: User;
  isSubFiles?: boolean;
};

const CustomerProfileFileCard = ({ file, createdBy, isSubFiles }: CustomerProfileFileCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const signedUrl = useSignedUrlFile(file?.id, isSubFiles);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Card
        raised
        sx={{ mr: 2, width: 'auto', mb: 2 }}
      >
        <CardHeader
          avatar={
            <DescriptionIcon sx={{ color: 'grey.400' }} /> // Using the document icon
          }
          action={
            <IconButton
              aria-label="file-menu"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
          }
          title={file.name}
          subheader={`${dayjs(file.created_at).format(
            'dddd, MMMM D, YYYY hh:mm A',
          )} · ${bytesToSize(file.size)}`}
          titleTypographyProps={{ variant: 'subtitle1' }}
          subheaderTypographyProps={{ color: 'textSecondary' }}
          sx={{
            px: 4,
            pb: 0,
            '& .MuiCardHeader-action': { mt: '0' },
          }}
        />
        <CardContent
          sx={{
            px: 4,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600 }}
          >
            By {getUserFullName(createdBy)}
          </Typography>
        </CardContent>
      </Card>
      <Menu
        id="file-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
      >
        <MenuItem>
          <Link
            target="_blank"
            rel="noopener"
            href={signedUrl.url}
            sx={{
              alignItems: 'center',
              display: 'inline-flex',
            }}
            underline="none"
            color={'inherit'}
          >
            View
          </Link>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CustomerProfileFileCard;
