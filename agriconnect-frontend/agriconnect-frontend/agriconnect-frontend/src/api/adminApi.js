import axios from "./axios";
import { ADMIN_ENDPOINTS } from "./endpoints";

export const getUsersApi = async () => {
  const res = await axios.get(ADMIN_ENDPOINTS.USERS);
  return res.data;
};

export const getAdminProductsApi = async () => {
  const res = await axios.get(ADMIN_ENDPOINTS.PRODUCTS);
  return res.data;
};

export const deleteUserApi = async (id) => {
  const res = await axios.delete(ADMIN_ENDPOINTS.DELETE_USER(id));
  return res.data;
};

export const deleteAdminProductApi = async (id) => {
  const res = await axios.delete(ADMIN_ENDPOINTS.DELETE_PRODUCT(id));
  return res.data;
};

export const getAdminOrdersApi = async () => {
  const res = await axios.get(ADMIN_ENDPOINTS.ORDERS);
  return res.data;
};