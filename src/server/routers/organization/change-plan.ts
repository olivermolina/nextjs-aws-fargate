import { isAuthenticated } from '../middleware/isAuthenticated';
import loadStripeClient from 'src/libs/stripe';
import z from 'zod';
import { TRPCError } from '@trpc/server';
import Stripe from 'stripe';
import prisma from 'src/libs/prisma';
import { AppAccess, UserType } from '@prisma/client';
import { createSubscription } from 'src/utils/stripe/create-subscription';

export const changePlan = isAuthenticated
  .input(z.object({
    currentPlanId: z.string().optional(),
    newPlanId: z.string(),
    additionalUsers: z.number(),
  }))
  .mutation(async ({ input, ctx }) => {

    const subscriptId = ctx.user.organization.stripe_subscription_id;

    // Create a new subscription if the user doesn't have one
    if (!subscriptId || !input.currentPlanId) {
      const defaultStripePaymentMethod = await prisma.stripeOrganizationPaymentMethod.findFirst({
        where: {
          organization_id: ctx.user.organization.id,
        },
        include:{
          stripe_payment_method: true,
        }
      });

      if (!defaultStripePaymentMethod || !defaultStripePaymentMethod.stripe_customer_id || !defaultStripePaymentMethod.stripe_payment_method) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Please add a payment method first.',
        });
      }

      const newSubscription = await createSubscription({
        stripeCustomerId: defaultStripePaymentMethod.stripe_customer_id,
        additionalUsers: input.additionalUsers,
        subscriptionId: input.newPlanId,
        defaultStripePaymentMethodId: defaultStripePaymentMethod.stripe_payment_method.stripe_id,
      });

      await prisma.organization.update({
        where: {
          id: ctx.user.organization.id,
        },
        data: {
          additional_users: input.additionalUsers,
          stripe_subscription_id: newSubscription.id,
          access: AppAccess.Allow,
        },
      });

      return newSubscription;
    }

    /**
     * If the user already has a subscription, we need to update it.
     */
    const stripe = loadStripeClient();
    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptId);
    if (!subscription) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invalid subscription.',
      });
    }

    const { data: products } = await stripe.products.list({
      expand: ['data.default_price'],
      active: true,
    });

    if (!products) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Unable to update subscription. Please contact support.',
      });
    }

    const items: Stripe.SubscriptionUpdateParams.Item[] = [];

    let newAdditionalUsers = ctx.user.organization.additional_users;

    // If the user is changing the plan, we need to update the plan
    if (input.currentPlanId !== input.newPlanId) {
      console.info('Changing plan');
      const newPlanProductPrice = products.find((product) => product.id === input.newPlanId)?.default_price;
      if (!newPlanProductPrice) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid new plan.',
        });
      }

      const oldItem = subscription.items.data.find((item) => item.plan.product === input.currentPlanId);
      if (!oldItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid old plan.',
        });
      }

      // Remove the old item
      items.push({
        id: oldItem.id,
        deleted: true,
      });

      // Add the new item
      items.push({
        price: (newPlanProductPrice as Stripe.Price)?.id,
        quantity: 1,
      });
    }

    // If the user is changing the additional users plan, we need to update the additional users plan
    if (input.additionalUsers !== ctx.user.organization.additional_users) {
      console.info(`Changing additional users plan from ${ctx.user.organization.additional_users} to ${input.additionalUsers}`);

      const staffMembersCount = await prisma.user.count({
        where: {
          organization_id: ctx.user.organization.id,
          type: UserType.STAFF,
        },
      });

      if (staffMembersCount > input.additionalUsers) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `You have ${staffMembersCount} staff members. You can't have less additional users than staff members. Please remove some staff members and try again.`,
        });
      }


      const additionalUsersProduct = products.find((product) => product.metadata?.type === 'additional_users');
      if (!additionalUsersProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid additional users plan.',
        });
      }
      const additionalUsersItem = subscription.items.data.find((item) => item.plan.product === additionalUsersProduct.id);
      const additionalUsersQuantity = input.additionalUsers - 1;
      if (!additionalUsersItem) {
        items.push({
          price: (additionalUsersProduct.default_price as Stripe.Price).id,
          quantity: additionalUsersQuantity,

        });
      } else {
        items.push({
          id: additionalUsersItem.id,
          quantity: additionalUsersQuantity,
          // Remove the item if the quantity is 0
          deleted: additionalUsersQuantity === 0,
        });
      }
      newAdditionalUsers = input.additionalUsers;
    }

    if (items.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No changes were made.',
      });
    }

    try {
      const result = await stripe.subscriptions.update(subscriptId, {
        items,
        proration_behavior: 'none',
      });

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Unable to update subscription. Please contact support.',
        });
      }

      await prisma.organization.update({
        where: {
          id: ctx.user.organization.id,
        },
        data: {
          additional_users: newAdditionalUsers,
          access: AppAccess.Allow,
        },
      });

      return result;

    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: e.message,
      });
    }
  });
