import axios from 'axios';

const API_URL = 'http://localhost:5000/api/gold-schemes';

export const createGoldScheme = async (schemeData) => {
  const response = await axios.post(API_URL, schemeData);
  return response.data;
};

export const getGoldSchemes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getGoldSchemeByCustomer = async (customerId) => {
  const response = await axios.get(`${API_URL}/customer/${customerId}`);
  return response.data;
};
