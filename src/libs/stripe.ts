import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  throw Error('Invalid Stripe Secret Key.');
}

const loadStripeClient = () => {
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
};

export default loadStripeClient;
