import type { FC } from 'react';
import Lock01Icon from '@untitled-ui/icons-react/build/esm/Lock01';
import User01Icon from '@untitled-ui/icons-react/build/esm/User01';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { SeverityPill } from 'src/components/severity-pill';

export const DetailList2: FC = () => (
  <Box
    sx={{
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100'),
      p: 3,
    }}
  >
    <Card>
      <CardHeader title="Contact Details" />
      <Divider />
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Email</Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                miron.vitold@devias.io
              </Typography>
              <SeverityPill color="success">Email verified</SeverityPill>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Phone</Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                +55 748 327 439
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Country</Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                USA
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">State/Region</Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                New York
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Address 1</Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                Street John Wick, no. 7
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Address 2</Typography>
            </TableCell>
            <TableCell>
              <Typography
                color="text.secondary"
                variant="body2"
              >
                House #25
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Stack
        alignItems="flex-start"
        spacing={1}
        sx={{ p: 1 }}
      >
        <Button
          color="inherit"
          startIcon={
            <SvgIcon>
              <Lock01Icon />
            </SvgIcon>
          }
        >
          Reset &amp; Send Password
        </Button>
        <Button
          color="inherit"
          startIcon={
            <SvgIcon>
              <User01Icon />
            </SvgIcon>
          }
        >
          Login as Customer
        </Button>
      </Stack>
    </Card>
  </Box>
);
