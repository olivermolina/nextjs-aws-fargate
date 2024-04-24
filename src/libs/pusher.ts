import Pusher from 'pusher';

let client: Pusher | null = null;

const loadPusher = () => {
  if (!process.env.PUSHER_APP_ID) throw new Error('PUSHER_APP_ID is not defined');
  if (!process.env.NEXT_PUBLIC_PUSHER_APP_KEY) throw new Error('PUSHER_APP_KEY is not defined');
  if (!process.env.PUSHER_APP_SECRET) throw new Error('PUSHER_APP_SECRET is not defined');
  if (!process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER) throw new Error('PUSHER_APP_CLUSTER is not defined');

  if (!client) {
     client = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
      secret: process.env.PUSHER_APP_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
      useTLS: true
    });
  }

  return client;
};

export default loadPusher;
