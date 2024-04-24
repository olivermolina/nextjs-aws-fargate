import axios, { AxiosInstance } from 'axios';

const dailyCoApiClient: AxiosInstance = axios.create({
  baseURL: process.env.DAILY_REST_DOMAIN || 'https://api.daily.co/v1/',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
  },
});

export default dailyCoApiClient;
