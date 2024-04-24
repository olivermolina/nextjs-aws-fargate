const https = require('https');

const client_id = process.env.WHO_ICD_API_CLIENT_ID;
const client_secret = process.env.WHO_ICD_API_CLIENT_SECRET;
const scope = 'icdapi_access';
const grant_type = 'client_credentials';

export function getToken() {
  const basicAuth = Buffer.from(`${client_id}:${client_secret}`, 'utf-8').toString('base64');
  // http header fields to set
  const Authorization = `Basic ${basicAuth}`;
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization,
  };

  // http options
  const options = {
    hostname: 'icdaccessmanagement.who.int',
    port: 443,
    path: '/connect/token',
    method: 'POST',
    headers,
  };
  const data = `grant_type=${grant_type}&scope=${scope}`;

  // make request
  return new Promise((resolve, reject) => {
    let req = https.request(options, (res: any) => {
      let data = '';

      res.on('data', (chunck: any) => {
        data += chunck;
      });

      res.on('end', () => {
        resolve(JSON.parse(data.toString()).access_token);
      });
    });

    req.on('error', (error: any) => {
      console.error('ERR', error);
      reject(error);
    });

    req.write(data, 'utf-8');
    req.end();
  });
}

function get(id: string, token: string) {
  // http header fields to set
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Accept-Language': 'en',
    'API-Version': 'v2',
  };

  // http options
  const options = {
    hostname: 'id.who.int',
    port: 443,
    path: `/icd/entity/${id}`,
    method: 'GET',
    headers,
  };

  // make request
  return new Promise((resolve, reject) => {
    let req = https.request(options, (res: any) => {
      let data = '';

      res.on('data', (chunck: any) => {
        data += chunck;
      });

      res.on('end', () => {
        resolve(JSON.parse(data.toString()));
      });
    });

    req.on('error', (error: any) => {
      console.error('ERR', error);
      reject(error);
    });

    req.end();
  });
}

export async function search(term: string) {
  const token = (await getToken()) as string;
  let res: any = await get(encodeURI(`search?q=${term}`), token);

  console.log({ token, res, term });
  return res.destinationEntities;
}
