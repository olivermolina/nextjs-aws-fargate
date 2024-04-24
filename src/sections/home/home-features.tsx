import type { FC } from 'react';
import { useState } from 'react';
import LinkExternal01Icon from '@untitled-ui/icons-react/build/esm/LinkExternal01';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

interface Feature {
  id: string;
  title: string;
  description: string;
  imageDark: string;
  imageLight: string;
}

const features: Feature[] = [
  {
    id: 'experts',
    title: 'Built by experts',
    description:
      'All of the code follows MUI best practices, it’s written by our in-house team of experts.',
    imageDark: '/assets/home-features-experts-dark.png',
    imageLight: '/assets/home-features-experts-light.png',
  },
  {
    id: 'figma',
    title: 'Design Files',
    description:
      "We've included the source Figma files to Plus & Extended licenses so you can get creative! Build layouts with confidence.",
    imageDark: '/assets/home-features-figma-dark.png',
    imageLight: '/assets/home-features-figma-light.png',
  },
  {
    id: 'tech',
    title: 'Built with modern technologies',
    description:
      'Each template is a well-structured CRA & Next.js project, giving you a codebase that’s productive and enjoyable to work in.',
    imageDark: '/assets/home-features-tech-dark.png',
    imageLight: '/assets/home-features-tech-light.png',
  },
  {
    id: 'customize',
    title: 'Easy to customize',
    description:
      'Everything is styled using global theme overrides, just open the theme file in your editor and change whatever you want.',
    imageDark: '/assets/home-features-customize-dark.png',
    imageLight: '/assets/home-features-customize-light.png',
  },
  {
    id: 'productive',
    title: 'Built with CRA & Next.js',
    description:
      'Well-structured, thoughtfully componentized CRA & Next.js project, giving you a codebase that’s productive and enjoyable to work in.',
    imageDark: '/assets/home-features-nextjs-dark.png',
    imageLight: '/assets/home-features-nextjs-light.png',
  },
];

export const HomeFeatures: FC = () => {
  const theme = useTheme();
  const [activeFeature, setActiveFeature] = useState<number>(0);
  const feature = features[activeFeature];
  const image = theme.palette.mode === 'dark' ? feature?.imageDark : feature?.imageLight;

  return (
    <Box
      sx={{
        backgroundColor: 'neutral.800',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top center',
        backgroundImage: 'url("/assets/gradient-bg.svg")',
        color: 'common.white',
        py: '120px',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          spacing={2}
          sx={{ mb: 8 }}
        >
          <Typography
            align="center"
            color="inherit"
            variant="h3"
          >
            Everything you need to run your project.
          </Typography>
          <Typography
            align="center"
            color="inherit"
            variant="subtitle2"
          >
            Not just a set of tools, the package includes ready-to-deploy conceptual application.
          </Typography>
        </Stack>
        <Grid
          alignItems="center"
          container
          spacing={3}
        >
          <Grid
            xs={12}
            md={6}
          >
            <Stack spacing={1}>
              {features.map((feature, index) => {
                const isActive = activeFeature === index;

                return (
                  <Box
                    key={feature.id}
                    onClick={() => setActiveFeature(index)}
                    sx={{
                      borderRadius: 2.5,
                      color: 'neutral.400',
                      cursor: 'pointer',
                      p: 3,
                      transition: (theme) =>
                        theme.transitions.create(['background-color, box-shadow', 'color'], {
                          easing: theme.transitions.easing.easeOut,
                          duration: theme.transitions.duration.enteringScreen,
                        }),
                      ...(isActive && {
                        backgroundColor: 'primary.alpha12',
                        boxShadow: (theme) => `${theme.palette.primary.main} 0 0 0 1px`,
                        color: 'common.white',
                      }),
                      '&:hover': {
                        ...(!isActive && {
                          backgroundColor: 'primary.alpha4',
                          boxShadow: (theme) => `${theme.palette.primary.main} 0 0 0 1px`,
                          color: 'common.white',
                        }),
                      },
                    }}
                  >
                    <Typography
                      color="inherit"
                      sx={{ mb: 1 }}
                      variant="h6"
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      color="inherit"
                      variant="body2"
                    >
                      {feature.description}
                    </Typography>
                    {feature.id === 'figma' && (
                      <Box sx={{ mt: 3 }}>
                        <Button
                          color="success"
                          component="a"
                          endIcon={
                            <SvgIcon fontSize="small">
                              <LinkExternal01Icon />
                            </SvgIcon>
                          }
                          href="https://www.figma.com/file/xrx6uDljzsWuDZiuz3ITCp/Devias-Kit-Pro-UI-6.0-Master"
                          size="small"
                          target="_blank"
                          variant="contained"
                        >
                          Preview in Figma
                        </Button>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Grid>
          <Grid
            xs={12}
            md={6}
          >
            <Box
              sx={{
                '& img': {
                  width: '100%',
                },
              }}
            >
              <img src={image} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
