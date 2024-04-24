import type { FC } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import InfoCircleIcon from '@untitled-ui/icons-react/build/esm/InfoCircle';
import LinkExternal01Icon from '@untitled-ui/icons-react/build/esm/LinkExternal01';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Scrollbar } from 'src/components/scrollbar';

interface Page {
  bounceRate: number;
  uniqueVisits: number;
  url: string;
  visitors: number;
}

interface AnalyticsMostVisitedProps {
  pages: Page[];
}

export const AnalyticsMostVisited: FC<AnalyticsMostVisitedProps> = (props) => {
  const { pages } = props;

  return (
    <Card>
      <CardHeader
        title="Most Visited Pages"
        action={
          <Tooltip title="Refresh rate is 24h">
            <SvgIcon color="action">
              <InfoCircleIcon />
            </SvgIcon>
          </Tooltip>
        }
      />
      <Scrollbar>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell>Page Name</TableCell>
              <TableCell>Visitors</TableCell>
              <TableCell>Unique page visits</TableCell>
              <TableCell>Bounce rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pages.map((page) => {
              const visitors = numeral(page.visitors).format('0,0');
              const uniqueVisitors = numeral(page.uniqueVisits).format('0,0');

              return (
                <TableRow
                  key={page.url}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Link
                      color="text.primary"
                      href="#"
                    >
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={2}
                      >
                        <SvgIcon fontSize="small">
                          <LinkExternal01Icon />
                        </SvgIcon>
                        <Typography variant="body2">{page.url}</Typography>
                      </Stack>
                    </Link>
                  </TableCell>
                  <TableCell>{visitors}</TableCell>
                  <TableCell>{uniqueVisitors}</TableCell>
                  <TableCell>{page.bounceRate}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
    </Card>
  );
};

AnalyticsMostVisited.propTypes = {
  pages: PropTypes.array.isRequired,
};
