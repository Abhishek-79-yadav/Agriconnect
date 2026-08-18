import axios from "./axios";
import { ORDER_ENDPOINTS } from "./endpoints";

/** POST /api/orders/checkout */
export const placeOrderApi = async (checkoutData) => {
  const res = await axios.post(ORDER_ENDPOINTS.CHECKOUT, checkoutData);
  return res.data;
};

/** GET /api/orders/buyer */
export const getBuyerOrdersApi = async () => {
  const res = await axios.get(ORDER_ENDPOINTS.BUYER_ORDERS);
  return res.data;
};

/** GET /api/orders/farmer */
export const getFarmerOrdersApi = async () => {
  const res = await axios.get(ORDER_ENDPOINTS.FARMER_ORDERS);
  return res.data;
};

/** PUT /api/orders/{id}/status?status=CONFIRMED */
export const updateOrderStatusApi = async (id, status) => {
  const res = await axios.put(ORDER_ENDPOINTS.UPDATE_STATUS(id), null, {
    params: { status },
  });
  return res.data;
};