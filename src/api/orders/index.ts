import type { Order } from 'src/types/order';
import { order, orders } from './data';
import { deepCopy } from 'src/utils/deep-copy';
import { applyPagination } from 'src/utils/apply-pagination';
import { applySort } from 'src/utils/apply-sort';

type GetOrdersRequest = {
  filters?: {
    query?: string;
    status?: string;
  };
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

type GetOrdersResponse = Promise<{
  data: Order[];
  count: number;
}>;

type GetOrderRequest = object;

type GetOrderResponse = Promise<Order>;

class OrdersApi {
  getOrders(request: GetOrdersRequest = {}): GetOrdersResponse {
    const { filters, page, rowsPerPage, sortBy, sortDir } = request;

    let data = deepCopy(orders) as Order[];
    let count = data.length;

    if (typeof filters !== 'undefined') {
      data = data.filter((order) => {
        if (typeof filters.query !== 'undefined' && filters.query !== '') {
          // Checks only the order number, but can be extended to support other fields, such as customer
          // name, email, etc.
          const containsQuery = (order.number || '')
            .toLowerCase()
            .includes(filters.query.toLowerCase());

          if (!containsQuery) {
            return false;
          }
        }

        if (typeof filters.status !== 'undefined') {
          const statusMatched = order.status === filters.status;

          if (!statusMatched) {
            return false;
          }
        }

        return true;
      });
      count = data.length;
    }

    if (typeof sortBy !== 'undefined' && typeof sortDir !== 'undefined') {
      data = applySort(data, sortBy, sortDir);
    }

    if (typeof page !== 'undefined' && typeof rowsPerPage !== 'undefined') {
      data = applyPagination(data, page, rowsPerPage);
    }

    return Promise.resolve({
      data,
      count,
    });
  }

  getOrder(request?: GetOrderRequest): GetOrderResponse {
    return Promise.resolve(deepCopy(order));
  }
}

export const ordersApi = new OrdersApi();
