import axios from 'axios';

const API_URL = 'http://localhost:5000/api/repledges';

export const createRepledge = async (repledgeData) => {
  const response = await axios.post(API_URL, repledgeData);
  return response.data; // { repledge, loan }
};

export const getRepledgesByLoan = async (loanId) => {
  const response = await axios.get(`${API_URL}/loan/${loanId}`);
  return response.data;
};

export const getAllRepledges = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
