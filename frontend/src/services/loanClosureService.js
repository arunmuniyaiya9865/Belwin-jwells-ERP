import axios from 'axios';

const API_URL = 'http://localhost:5000/api/loan-closure';

export const getClosureDetails = async (loanId) => {
    try {
        const response = await axios.get(`${API_URL}/${loanId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Server error' };
    }
};

export const processClosure = async (loanId, closureData) => {
    try {
        const response = await axios.post(`${API_URL}/${loanId}`, closureData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Server error' };
    }
};
