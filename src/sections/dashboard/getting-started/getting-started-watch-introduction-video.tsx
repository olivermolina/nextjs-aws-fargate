import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function GettingStartedWatchIntroductionVideo() {
  return (
    <Container>
      <Stack
        spacing={1}
        alignItems={'center'}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'normal',
          }}
        >
          Welcome to Luna Health
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 'normal',
            pb: 2,
          }}
        >
          Watch this introduction video to get started
        </Typography>
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          height="400"
          // TODO replace with actual video
          src="https://www.youtube.com/embed/9bZkp7q19f0"
          title="YouTube video player"
          width="100%"
          style={{
            borderRadius: 5,
          }}
        />
      </Stack>
    </Container>
  );
}
