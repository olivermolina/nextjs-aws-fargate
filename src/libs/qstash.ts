import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import axios, { AxiosError, AxiosInstance } from 'axios';

dayjs.extend(utc);
dayjs.extend(timezone);

if (!process.env.QSTASH_TOKEN) throw new Error('QSTASH_TOKEN is not defined');
if (!process.env.QSTASH_URL) throw new Error('QSTASH_URL is not defined');

let qstashClient: AxiosInstance | null = null;

const loadQstashClient = () => {
  if (!qstashClient) {
    qstashClient = axios.create({
      baseURL: process.env.QSTASH_URL,
    });
  }

  return qstashClient;
};

type JSONResponse = {
  data?: {
    messageId: string;
  };
  errors?: Array<{ message: string }>;
};

export const qstashRequest = async ({ ...options }): Promise<JSONResponse> => {
  const client = loadQstashClient();

  client.defaults.headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
    ...options.headers,
  };

  return new Promise((resolve, reject) => {
    client({
      ...options,
      ...(options.method === 'GET' && {
        params: {
          ...options.params,
        },
      }),
      ...(options.method !== 'GET' && {
        data: {
          ...options.data,
        },
      }),
    })
      .then((response: any) => resolve(response))
      .catch((error: Error | AxiosError) => reject(error));
  });
};
