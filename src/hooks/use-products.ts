import { trpc } from '../app/_trpc/client';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Stripe from 'stripe';
import type { SelectChangeEvent } from '@mui/material/Select';
import toast from 'react-hot-toast';
import sortBy from 'lodash/sortBy';
import { useSearchParams } from 'next/navigation';

type ProductType = 'plan' | 'additional_users' | 'enterprise';

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: ProductType;
}

const mapStripeProductToProduct = (product: Stripe.Product): Product => {
  return {
    id: product.id,
    name: product.name,
    price: Number((product.default_price as Stripe.Price)?.unit_amount) / 100 || 0,
    quantity: 1,
    type: product.metadata?.type as ProductType || 'plan',
  };
};

export const useProducts = (includeEnterPrise = false, includeTest = false) => {
  const searchParams = useSearchParams();
  const searchPlan = searchParams.get('plan');
  const { data, isLoading } = trpc.organization.plans.useQuery();
  const [code, setCode] = useState<string>('');

  const mutation = trpc.organization.applyDiscountCode.useMutation();

  const [products, setProducts] = useState<Product[]>([]);

  const handleQuantityChange = useCallback((quantity: number, productId: string): void => {
    setProducts((prevState) => {
      return prevState.map((product) => {
        if (product.id !== productId) {
          return product;
        }

        return {
          ...product,
          quantity: quantity as number,
        };
      });
    });
  }, []);

  const plans = useMemo(() => {
    if (!data) return [] as Product[];

    let stripePlans: Stripe.Product[] = [];
    if (includeEnterPrise && !includeTest) {
      stripePlans = data
        .filter((plan) => plan.metadata?.type === 'plan' || plan.metadata?.type === 'enterprise');
    } else if (includeTest && !includeEnterPrise) {
      stripePlans = data
        .filter((plan) => plan.metadata?.type === 'plan' || plan.metadata?.type === 'test');
    } else if (includeTest && includeEnterPrise) {
      stripePlans = data
        .filter((plan) => plan.metadata?.type === 'plan' || plan.metadata?.type === 'test' || plan.metadata?.type === 'enterprise');
    } else {
      stripePlans = data
        .filter((plan) => plan.metadata?.type === 'plan');
    }

    return sortBy(stripePlans.map(mapStripeProductToProduct), 'price');
  }, [data, includeEnterPrise, includeTest]);

  const handleDiscountCodeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setCode(event.target.value);
  };

  const onPlanChange = useCallback(
    (event: SelectChangeEvent<string>): void => {
      setProducts((prevState) => {
        return prevState.map((product) => {
          if (product.type === 'additional_users') {
            return product;
          }

          const plan = plans.find((plan) => plan.id === event.target.value);
          if (!plan) {
            return product;
          }

          return {
            ...plan,
            type: 'plan',
            quantity: 1,
          };
        });
      });
    },
    [plans],
  );

  const onApplyDiscountCode = useCallback(async () => {
    try {
      await mutation.mutateAsync({
        code,
      });
      toast.success('Discount code applied');
    } catch (e) {
      toast.error('We couldn\'t find that discount code');
    }
  }, [code]);

  useEffect(() => {
    if (!data) return;
    const initialProducts: Product[] = [];
    const essentials = data.find((product) => product.name === 'Essentials');
    const defaultPlan = data.find((product) => product.id === searchPlan) || essentials;
    if (defaultPlan) {
      initialProducts.push({
        id: defaultPlan.id,
        name: defaultPlan.name,
        price: Number((defaultPlan.default_price as Stripe.Price)?.unit_amount) / 100 || 0,
        quantity: 1,
        type: 'plan',
      });
    }

    const additional = data.find((product) => product.metadata?.type === 'additional_users');
    if (additional) {
      initialProducts.push({
        id: additional.id,
        name: additional.name,
        price: Number((additional.default_price as Stripe.Price)?.unit_amount) / 100 || 0,
        quantity: 1,
        type: 'additional_users',
      });
    }

    setProducts(initialProducts);
  }, [data, searchPlan]);

  return {
    handleQuantityChange,
    products,
    plans,
    onPlanChange,
    onApplyDiscountCode,
    handleDiscountCodeChange,
    couponIsLoading: mutation.isLoading,
    percentOff: mutation.data?.coupon?.percent_off || 0,
    isLoading,
  };
};
