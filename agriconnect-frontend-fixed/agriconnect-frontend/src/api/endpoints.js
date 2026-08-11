// ===============================
// Single source of truth for all backend routes.
// Base URL (VITE_API_URL) already includes "/api", so paths below
// start after that prefix. Verified directly against each
// @RequestMapping/@GetMapping/@PostMapping in the Spring Boot backend.
// ===============================

export const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  PROFILE: "/auth/profile",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  // NOTE: no /auth/verify-otp route exists on the backend yet.
  // resetPassword() takes the OTP directly (email + otp + newPassword).
};

export const USER_ENDPOINTS = {
  BY_ID: (id) => `/users/${id}`,
  UPDATE_PROFILE: "/users/profile",
  CHANGE_PASSWORD: "/users/change-password",
};

export const FARMER_ENDPOINTS = {
  PROFILE: "/farmer/profile",
  DASHBOARD: "/farmer/dashboard",
  PRODUCTS: "/farmer/products",
  PRODUCT_BY_ID: (id) => `/farmer/products/${id}`,
  DELETE_PRODUCT: (id) => `/farmer/products/${id}`,
  UPDATE_PRICE: (id) => `/farmer/products/${id}/price`,
};

export const BUYER_ENDPOINTS = {
  PRODUCTS: "/buyer/products",
};

export const CART_ENDPOINTS = {
  GET_CART: "/buyer/cart",
  ADD_TO_CART: "/buyer/cart",
  UPDATE_CART: "/buyer/cart",
  REMOVE_FROM_CART: (productId) => `/buyer/cart/${productId}`,
};

export const WISHLIST_ENDPOINTS = {
  GET: "/wishlist",
  ADD: (productId) => `/wishlist/${productId}`,
  REMOVE: (productId) => `/wishlist/${productId}`,
};

export const ORDER_ENDPOINTS = {
  CHECKOUT: "/orders/checkout",
  BUYER_ORDERS: "/orders/buyer",
  FARMER_ORDERS: "/orders/farmer",
  UPDATE_STATUS: (id) => `/orders/${id}/status`,
};

export const PAYMENT_ENDPOINTS = {
  CREATE_ORDER: (orderId) => `/buyer/payment/create/${orderId}`,
  VERIFY_PAYMENT: (orderId) => `/buyer/payment/verify/${orderId}`,
  PHONEPE_INITIATE: (orderId) => `/buyer/payment/phonepe/initiate/${orderId}`,
  PHONEPE_CONFIRM: (merchantTransactionId) => `/buyer/payment/phonepe/confirm/${merchantTransactionId}`,
};

export const COUPON_ENDPOINTS = {
  CREATE: "/coupon",
  APPLY: "/coupon/apply",
  VALIDATE: (code) => `/coupon/validate/${code}`,
};

export const CROP_ENDPOINTS = {
  ALL: "/crops",
  CREATE: "/crops",
  INFO: (cropId) => `/crop-info/${cropId}`,
  SUGGEST: "/crop/suggest",
  SMART_CROP: (city) => `/smart-crop/${encodeURIComponent(city)}`,
};

export const AI_ENDPOINTS = {
  RECOMMEND: "/ai/recommend",
};

export const SCHEME_ENDPOINTS = {
  ALL: "/schemes",
  ADD: "/schemes/admin",
  STATE: (state) => `/schemes/state/${encodeURIComponent(state)}`,
  DELETE: (id) => `/schemes/admin/${id}`,
};

export const NOTIFICATION_ENDPOINTS = {
  ALL: "/notifications",
  MARK_READ: (id) => `/notifications/${id}/read`,
};

export const RATING_ENDPOINTS = {
  RATE: "/buyer/rate",
  BY_FARMER: (farmerId) => `/farmer/${farmerId}/ratings`,
  FARMER_AVERAGE: (farmerId) => `/farmer/${farmerId}/rating-average`,
};

export const SEARCH_ENDPOINTS = {
  BY_NAME: "/search/name",
  BY_CATEGORY: "/search/category",
  BY_CITY: "/search/city",
  BY_STATE: "/search/state",
  BY_PRICE: "/search/price",
};

export const CROP_HISTORY_ENDPOINTS = {
  ALL: "/farmer/crop-history",
  ADD: "/farmer/crop-history",
  DELETE: (id) => `/farmer/crop-history/${id}`,
};

export const VIDEO_ENDPOINTS = {
  UPLOAD: "/videos/upload",
  BY_PRODUCT: (productId) => `/videos/product/${productId}`,
  BY_FARMER: (farmerId) => `/videos/farmer/${farmerId}`,
};

export const CLOUDINARY_ENDPOINTS = {
  UPLOAD_IMAGE: "/cloudinary/image",
  UPLOAD_VIDEO: "/cloudinary/video",
  DELETE: (publicId) => `/cloudinary/${publicId}`,
};

export const ADMIN_ENDPOINTS = {
  USERS: "/admin/users",
  PRODUCTS: "/admin/products",
  ORDERS: "/admin/orders",
  DELETE_USER: (id) => `/admin/user/${id}`,
  DELETE_PRODUCT: (id) => `/admin/product/${id}`,
};

export const WEATHER_ENDPOINTS = {
  BY_CITY: (city) => `/weather/${encodeURIComponent(city)}`,
};

export const HEALTH_ENDPOINT = "/health";