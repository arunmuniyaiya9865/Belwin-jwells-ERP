import axios from 'axios';

const API_URL = 'http://localhost:5000/api/customer-ledger';

export const getCustomerLedger = async (customerId) => {
    try {
        const response = await axios.get(`${API_URL}/${customerId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Server error occurred while fetching ledger.' };
    }
};
