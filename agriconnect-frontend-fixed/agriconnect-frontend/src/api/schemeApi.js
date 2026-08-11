import axios from "./axios";
import { SCHEME_ENDPOINTS } from "./endpoints";

// GovernmentSchemeController wraps every response in { success, message, data }
// — unwrap .data.data here so the rest of the app can just deal with plain
// arrays/objects, same as every other API module.
export const getSchemesApi = async () => {
  const res = await axios.get(SCHEME_ENDPOINTS.ALL);
  return res.data.data;
};

export const getSchemesByStateApi = async (state) => {
  const res = await axios.get(SCHEME_ENDPOINTS.STATE(state));
  return res.data.data;
};

/** admin only */
export const addSchemeApi = async (data) => {
  const res = await axios.post(SCHEME_ENDPOINTS.ADD, data);
  return res.data.data;
};

/** admin only */
export const deleteSchemeApi = async (id) => {
  const res = await axios.delete(SCHEME_ENDPOINTS.DELETE(id));
  return res.data;
};
