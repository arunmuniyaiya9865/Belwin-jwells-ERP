import axios from 'axios';

const API_URL = 'http://localhost:5000/api/loans';

export const createLoan = async (loanData) => {
  const response = await axios.post(API_URL, loanData);
  return response.data;
};

export const getLoanById = async (loanId) => {
  const response = await axios.get(`${API_URL}/${loanId}`);
  return response.data;
};

export const getLoansByCustomer = async (customerId) => {
  const response = await axios.get(`${API_URL}/customer/${customerId}`);
  return response.data;
};

export const updateLoan = async (loanId, loanData) => {
  const response = await axios.put(`${API_URL}/${loanId}`, loanData);
  return response.data;
};

export const getProvideLoanDetails = async (customerId) => {
  const response = await axios.get(`http://localhost:5000/api/provide-loan/customer/${customerId}`);
  return response.data;
};
