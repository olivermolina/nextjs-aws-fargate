import { isAuthenticated } from '../middleware/isAuthenticated';

import loadStripeClient from 'src/libs/stripe';

export const currentPlan = isAuthenticated.query(async ({ input, ctx }) => {
  const stripe = loadStripeClient();

  const subscriptId = ctx.user.organization.stripe_subscription_id;

  if (!subscriptId) return null;
  const subscription = await stripe.subscriptions.retrieve(subscriptId);
  if (!subscription) return null;

  const planIds = subscription.items.data.map((item) => item.plan.product);
  const { data: plans } = await stripe.products.list({
    active: true
  });

  const currentPlan = plans.find((plan) => plan.metadata?.type === 'plan' && planIds.includes(plan.id));

  return currentPlan || null
});
