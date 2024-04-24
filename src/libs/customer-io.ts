import { APIClient } from 'customerio-node';

let client: APIClient | null = null;

const loadCustomerIO = () => {
  if (!client) {
    client = new APIClient(process.env.CUSTOMER_IO_API_KEY || '');
  }

  return client;
};

export default loadCustomerIO;
