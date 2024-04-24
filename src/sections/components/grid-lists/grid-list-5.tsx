import type { FC } from 'react';
import { formatDistanceToNowStrict, subHours } from 'date-fns';
import ClockIcon from '@untitled-ui/icons-react/build/esm/Clock';
import HeartIcon from '@untitled-ui/icons-react/build/esm/Heart';
import Share07Icon from '@untitled-ui/icons-react/build/esm/Share07';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

const now = new Date();

interface Post {
  id: string;
  author: {
    id: string;
    avatar: string;
    name: string;
  };
  createdAt: number;
  likes: number;
  media: string;
  message: string;
}

const posts: Post[] = [
  {
    id: '5e887faca2b7a1ddce01221a',
    author: {
      id: '5e86809283e28b96d2d38537',
      avatar: '/assets/avatars/avatar-anika-visser.png',
      name: 'Anika Visser',
    },
    createdAt: subHours(now, 4).getTime(),
    likes: 24,
    media: '/assets/covers/abstract-1-4x4-small.png',
    message: "Hey guys! What's your favorite framework?",
  },
  {
    id: '5e887faf03e78a5359765636',
    author: {
      id: '5e86809283e28b96d2d38537',
      avatar: '/assets/avatars/avatar-anika-visser.png',
      name: 'Anika Visser',
    },
    createdAt: subHours(now, 7).getTime(),
    likes: 65,
    media: '/assets/covers/minimal-1-4x3-small.png',
    message: 'Just made this overview screen for a project, what-cha thinkin?',
  },
];

export const GridList5: FC = () => (
  <Box
    sx={{
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100'),
      p: 3,
    }}
  >
    <Grid
      container
      spacing={3}
    >
      {posts.map((post) => {
        const ago = formatDistanceToNowStrict(post.createdAt);

        return (
          <Grid
            key={post.id}
            md={6}
            xs={12}
          >
            <Card sx={{ height: '100%' }}>
              <CardHeader
                avatar={<Avatar src={post.author.avatar} />}
                disableTypography
                subheader={
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={0.5}
                  >
                    <SvgIcon color="action">
                      <ClockIcon />
                    </SvgIcon>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                    >
                      {ago} ago
                    </Typography>
                  </Stack>
                }
                title={
                  <Link
                    color="text.primary"
                    variant="subtitle2"
                  >
                    {post.author.name}
                  </Link>
                }
              />
              <Box
                sx={{
                  pb: 2,
                  px: 3,
                }}
              >
                <Typography variant="body1">{post.message}</Typography>
                <Box sx={{ mt: 2 }}>
                  <CardActionArea>
                    <CardMedia
                      image={post.media}
                      sx={{
                        backgroundPosition: 'top',
                        height: 350,
                      }}
                    />
                  </CardActionArea>
                </Box>
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    mt: 2,
                  }}
                >
                  <Tooltip title="Unlike">
                    <IconButton>
                      <SvgIcon
                        sx={{
                          color: 'error.main',
                          '& path': {
                            fill: (theme) => theme.palette.error.main,
                            fillOpacity: 1,
                          },
                        }}
                      >
                        <HeartIcon />
                      </SvgIcon>
                    </IconButton>
                  </Tooltip>
                  <Typography
                    color="text.secondary"
                    variant="subtitle2"
                  >
                    {post.likes}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton>
                    <SvgIcon>
                      <Share07Icon />
                    </SvgIcon>
                  </IconButton>
                </Box>
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  </Box>
);
