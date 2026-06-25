import axios from 'axios';

const API_URL = 'http://localhost:5000/api/payments';

export const createPayment = async (paymentData) => {
  const response = await axios.post(API_URL, paymentData);
  return response.data;
};

export const getPaymentsByLoan = async (loanId) => {
  const response = await axios.get(`${API_URL}/loan/${loanId}`);
  return response.data;
};

export const getPaymentHistory = async (loanId) => {
  const response = await axios.get(`${API_URL}/history/${loanId}`);
  return response.data; // { loan: {}, payments: [] }
};

export const getAllPayments = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
