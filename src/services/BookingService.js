import api from './Axios';

// Create a new booking
export const createBooking = async (bookingData) => {
    try {
        const response = await api.post('/Booking/bookings', bookingData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get booking by ID
export const getBookingById = async (id) => {
    try {
        const response = await api.get(`/Booking/bookings/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get user's bookings by email
export const getUserBookings = async (email) => {
    try {
        const response = await api.get(`/Booking/bookings/user/${email}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update payment status
export const updatePaymentStatus = async (id, paymentData) => {
    try {
        const response = await api.put(`/Booking/bookings/${id}/payment`, paymentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update booking status
export const updateBookingStatus = async (id, status) => {
    try {
        const response = await api.put(`/Booking/bookings/${id}/status`, { booking_status: status });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Cancel booking
export const cancelBooking = async (id) => {
    try {
        const response = await api.delete(`/Booking/bookings/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
// Verify payment
export const verifyPayment = async (paymentData) => {
    try {
        const response = await api.post('/Booking/verify-payment', paymentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
