import type { ChangeEvent, FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { alpha } from '@mui/system/colorManipulator';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { codeStyle } from 'src/utils/code-style';

interface Sample {
  lang: 'jsx' | 'tsx';
  label: string;
  icon: string;
  code: string;
}

const samples: Sample[] = [
  {
    lang: 'jsx',
    label: '.jsx',
    icon: '/assets/logos/logo-javascript.svg',
    code: `"import { useState } from 'react';\\nimport { usePageView } from 'src/hooks/use-page-view';\\nimport { useUser } from 'src/hooks/use-user';\\n\\nconst Page = () => {\\n  const user = useUser();\\n  const [currentTab, setCurrentTab] = useState('general');\\n\\n  usePageView();\\n\\n  return (\\n    <Box\\n      component=\\"main\\"\\n      sx={{ flexGrow: 1, py: 8 }}\\n    >\\n      <Container maxWidth=\\"xl\\">\\n        <Stack\\n          spacing={3}\\n          sx={{ mb: 3 }}\\n        >\\n          <Typography variant=\\"h4\\">\\n            Account\\n          </Typography>\\n          <div>\\n            <Tabs\\n              indicatorColor=\\"primary\\"\\n              onChange={() => {}}\\n              scrollButtons=\\"auto\\"\\n              textColor=\\"primary\\"\\n              value={currentTab}\\n              variant=\\"scrollable\\"\\n            >\\n              {[].map((tab) => (\\n                <Tab\\n                  key={tab.value}\\n                  label={tab.label}\\n                  value={tab.value}\\n                />\\n              ))}\\n            </Tabs>\\n            <Divider />\\n          </div>\\n        </Stack>\\n      </Container>\\n    </Box>\\n  );\\n};\\n"`,
  },
  {
    lang: 'tsx',
    label: '.tsx',
    icon: '/assets/logos/logo-typescript.svg',
    code: `"import { useState } from 'react';\\nimport type { NextPage } from 'next';\\nimport { usePageView } from 'src/hooks/use-page-view';\\nimport { useUser } from 'src/hooks/use-user';\\n\\nconst Page: NextPage = () => {\\n  const user = useUser();\\n  const [currentTab, setCurrentTab] = useState<string>('general');\\n\\n  usePageView();\\n\\n  return (\\n    <Box\\n      component=\\"main\\"\\n      sx={{ flexGrow: 1, py: 8 }}\\n    >\\n      <Container maxWidth=\\"xl\\">\\n        <Stack\\n          spacing={3}\\n          sx={{ mb: 3 }}\\n        >\\n          <Typography variant=\\"h4\\">\\n            Account\\n          </Typography>\\n          <div>\\n            <Tabs\\n              indicatorColor=\\"primary\\"\\n              onChange={() => {}}\\n              scrollButtons=\\"auto\\"\\n              textColor=\\"primary\\"\\n              value={currentTab}\\n              variant=\\"scrollable\\"\\n            >\\n              {[].map((tab) => (\\n                <Tab\\n                  key={tab.value}\\n                  label={tab.label}\\n                  value={tab.value}\\n                />\\n              ))}\\n            </Tabs>\\n            <Divider />\\n          </div>\\n        </Stack>\\n      </Container>\\n    </Box>\\n  );\\n};\\n"`,
  },
];

export const HomeCodeSamples: FC = () => {
  const [lang, setLang] = useState<string>(samples[0].lang);

  const handleLangChange = useCallback((event: ChangeEvent<any>, value: string): void => {
    setLang(value);
  }, []);

  const code = useMemo(() => {
    return samples.find((sample) => sample.lang === lang)?.code.trim() || '';
  }, [lang]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{
          backdropFilter: 'blur(6px)',
          backgroundColor: (theme) => alpha(theme.palette.neutral[800], 0.95),
          borderBottomColor: 'neutral.700',
          borderBottomStyle: 'solid',
          borderBottomWidth: 1,
          borderTopLeftRadius: (theme) => theme.shape.borderRadius,
          borderTopRightRadius: (theme) => theme.shape.borderRadius,
          boxShadow: 24,
          flex: '0 0 auto',
          overflow: 'hidden',
          px: 2,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
          sx={{
            py: 2,
            '& > div': {
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              borderRadius: '50%',
              height: 10,
              width: 10,
            },
          }}
        >
          <div />
          <div />
          <div />
        </Stack>
        <Tabs
          onChange={handleLangChange}
          value={lang}
        >
          {samples.map((sample) => (
            <Tab
              key={sample.lang}
              label={
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                >
                  <Box
                    sx={{
                      borderRadius: '4px',
                      flex: '0 0 auto',
                      height: 20,
                      overflow: 'hidden',
                      width: 20,
                      '& img': {
                        width: '100%',
                      },
                    }}
                  >
                    <img src={sample.icon} />
                  </Box>
                  <Typography
                    sx={{ color: 'neutral.300' }}
                    variant="body2"
                  >
                    {sample.label}
                  </Typography>
                </Stack>
              }
              value={sample.lang}
            />
          ))}
        </Tabs>
      </Stack>
      <Box
        sx={{
          backdropFilter: 'blur(6px)',
          backgroundColor: (theme) => alpha(theme.palette.neutral[800], 0.9),
          borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
          borderBottomRightRadius: (theme) => theme.shape.borderRadius,
          flex: '1 1 auto',
          overflow: 'hidden',
          p: 2,
          '& pre': {
            background: 'none !important',
            borderRadius: '0 !important',
            fontSize: '12px !important',
            height: '100%',
            m: '0 !important',
            overflow: 'hidden !important',
            p: '0 !important',
          },
          '& code': {
            fontSize: '12px !important',
          },
        }}
      >
        <SyntaxHighlighter
          language={lang}
          style={codeStyle}
        >
          {JSON.parse(code)}
        </SyntaxHighlighter>
      </Box>
    </Box>
  );
};
