import { t } from 'src/server/trpc';
import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import puppeteer, { Page } from 'puppeteer';
import { Context } from '../../context';

export const getChartPdf = async (url: string, ctx: Context) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 900,
      height: 650,
    },
    ...(process.env.NODE_ENV === 'production' ? { executablePath: '/usr/bin/chromium' } : {}),
  });
  const page = (await browser.newPage()) as Page;
  console.log('Puppeteer Browser is up');
  // @ts-ignore
  const cookies = ctx.cookies as { name: string; value: string; path: string }[];

  await page.goto(url);

  await page.setCookie(
    // @ts-ignore
    ...cookies.map((cookie) => ({
      url,
      name: cookie.name,
      value: cookie.value,
      path: cookie.path,
    })),
  );
  await page.goto(url, {
    waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
  });
  await page.emulateMediaType('screen');
  // height of content
  const pageHeight = await page.evaluate(() => {
    let height = 0;

    function findHighestNode(nodesList: any) {
      for (let i = nodesList.length - 1; i >= 0; i--) {
        if (nodesList[i].scrollHeight && nodesList[i].clientHeight) {
          const elHeight = Math.max(nodesList[i].scrollHeight, nodesList[i].clientHeight);
          height = Math.max(elHeight, height);
        }
        if (nodesList[i].childNodes.length) findHighestNode(nodesList[i].childNodes);
      }
    }

    findHighestNode(document.documentElement.childNodes);
    return height;
  });
  // width of device
  const pageWidth = await page.evaluate(() => document.documentElement.offsetWidth);
  const pdfBuffer = await page.pdf({
    // format: 'A4',
    printBackground: true,
    omitBackground: true,
    preferCSSPageSize: true,
    height: pageHeight + 'px',
    width: pageWidth + 'px',
  });
  await browser.close();

  console.log('Puppeteer Browser is closed');
  return pdfBuffer.toString('base64');
};

/**
 * Pdf router
 */
const pdfRouter = t.router({
  generate: isAuthenticated
    .input(
      z.object({
        url: z.string(),
        waitForSelector: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const url = input.url;
      return await getChartPdf(url, ctx);
    }),
});

export default pdfRouter;
