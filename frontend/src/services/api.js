import axios from 'axios';

const API_URL = 'http://localhost:8000/api/trip/';

export const planTrip = async (data) => {
    try {
        const response = await axios.post(API_URL, data);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error('An error occurred while calculating the trip plan.');
    }
};
