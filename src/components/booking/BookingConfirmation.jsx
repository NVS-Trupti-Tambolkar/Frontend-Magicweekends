import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaEnvelope, FaPrint, FaDownload, FaHistory } from 'react-icons/fa';

const BookingConfirmation = ({ bookingId, email, onClose }) => {
    const navigate = useNavigate();
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Success Animation Header */}
                <div className="bg-gradient-to-r from-green-400 to-green-500 p-6 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-3 animate-bounce">
                        <FaCheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">Booking Confirmed!</h2>
                    <p className="text-green-50 text-base">Your adventure awaits</p>
                </div>

                {/* Booking Details */}
                <div className="p-6">
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="text-center mb-2">
                            <p className="text-xs text-gray-600 mb-1">Your Booking Reference</p>
                            <p className="text-2xl font-bold text-yellow-600">#{bookingId}</p>
                        </div>
                        <div className="border-t border-yellow-200 pt-2">
                            <p className="text-xs text-gray-700 text-center">
                                Please save this reference number for future correspondence
                            </p>
                        </div>
                    </div>

                    {/* Confirmation Message */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <FaEnvelope className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">Email Confirmation Sent</h4>
                                <p className="text-sm text-blue-800">
                                    We've sent a confirmation email to <span className="font-semibold">{email}</span> with your booking details and payment instructions.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Next Steps:</h4>
                            <ol className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                    <span>Check your email for booking confirmation and payment details</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                    <span>Complete the payment using your selected payment method</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                    <span>Share the transaction ID/reference number with us</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                    <span>We'll confirm your payment and send you the final itinerary</span>
                                </li>
                            </ol>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-2">Need Help?</h4>
                            <p className="text-sm text-green-800 mb-2">
                                Our team is here to assist you with any questions or concerns.
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div>
                                    <span className="text-green-700 font-medium">Email:</span>
                                    <span className="text-green-900 ml-2">support@magicweekends.com</span>
                                </div>
                                <div>
                                    <span className="text-green-700 font-medium">Phone:</span>
                                    <span className="text-green-900 ml-2">+91 9011234179</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            <FaPrint />
                            Print
                        </button>
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                        >
                            <FaHistory />
                            My Bookings
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-bold shadow-lg"
                        >
                            Done
                        </button>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-6 text-center text-xs text-gray-500">
                        <p>Thank you for choosing us for your adventure!</p>
                        <p className="mt-1">Booking ID: #{bookingId} • {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
