import Dialog from '@mui/material/Dialog';
import { AppBar, Toolbar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';


type ChatImageFullScreenDialogProps = {
  open: boolean;
  handleClose: () => void;
  fileName: string;
  image: string;
};

export default function ChatImageFullScreenDialog(props: ChatImageFullScreenDialogProps) {
  const { open, handleClose, fileName, image } = props;

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {fileName}
          </Typography>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <CardMedia
          component="img"
          image={image}
          alt="unsplash"
          sx={{ height: '100vh', objectFit: 'contain' }}
        />
      </Box>
    </Dialog>
  );
}
