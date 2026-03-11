import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaCheckCircle, FaLock, FaShieldAlt, FaWhatsapp } from 'react-icons/fa';
import PaymentMethodSelector from './PaymentMethodSelector';
import BookingConfirmation from './BookingConfirmation';
import { createBooking, verifyPayment } from '../../services/BookingService';
import { InlineSpinner, OverlayLoader } from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const BookingForm = ({ isOpen, onClose, tripData, tripType }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [bookingId, setBookingId] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        travel_date: '',
        number_of_people: 1,
        payment_method: '',
        special_request: '',
        travelers: [{ name: '', age: '', gender: '' }]
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            // Reset form when opened
            setCurrentStep(1);
            setBookingComplete(false);
            setErrors({});
            
            // Pre-fill user data if available
            setFormData(prev => ({
                ...prev,
                full_name: user?.full_name || user?.name || prev.full_name,
                email: user?.email || prev.email,
                phone: user?.phone || prev.phone || ''
            }));
            
            // Set initial travel date if provided
            if (tripData?.selectedDate) {
                setFormData(prev => ({
                    ...prev,
                    travel_date: tripData.selectedDate.split('T')[0]
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    travel_date: ''
                }));
            }
        }
    }, [isOpen, tripData, user]);

    useEffect(() => {
        // Update travelers array when number_of_people changes
        const count = parseInt(formData.number_of_people) || 1;
        const currentTravelers = formData.travelers.length;

        if (count > currentTravelers) {
            const newTravelers = [...formData.travelers];
            for (let i = currentTravelers; i < count; i++) {
                newTravelers.push({ name: '', age: '', gender: '' });
            }
            setFormData(prev => ({ ...prev, travelers: newTravelers }));
        } else if (count < currentTravelers) {
            setFormData(prev => ({ ...prev, travelers: prev.travelers.slice(0, count) }));
        }
    }, [formData.number_of_people]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleTravelerChange = (index, field, value) => {
        const newTravelers = [...formData.travelers];
        newTravelers[index][field] = value;
        setFormData(prev => ({ ...prev, travelers: newTravelers }));
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.full_name.trim()) newErrors.full_name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
        if (!formData.travel_date) newErrors.travel_date = 'Travel date is required';
        else if (new Date(formData.travel_date) < new Date()) newErrors.travel_date = 'Date must be in the future';
        if (formData.number_of_people < 1) newErrors.number_of_people = 'At least 1 person required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        formData.travelers.forEach((traveler, index) => {
            if (!traveler.name.trim()) newErrors[`traveler_${index}_name`] = 'Name is required';
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.payment_method) newErrors.payment_method = 'Please select a payment method';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = false;
        if (currentStep === 1) isValid = validateStep1();
        else if (currentStep === 2) isValid = validateStep2();
        else if (currentStep === 3) isValid = validateStep3();

        if (isValid) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleWhatsappBooking = () => {
        const tripName = tripData?.title || 'trip';
        const message = `Hello Magic Weekends team! 🌟\n\nI'm extremely excited and would like to book the *"${tripName}"* trip. Could you please help me with the booking details and payment process? ✨`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/917620430527?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        onClose();
    };

    const calculateTotal = () => {
        // Handle both string (e.g., "₹5000") and number (e.g., 5000) formats
        let pricePerPerson = 0;

        if (typeof tripData?.price === 'string') {
            // Remove currency symbols and parse
            pricePerPerson = parseFloat(tripData.price.replace(/[^0-9.]/g, '')) || 0;
        } else if (typeof tripData?.price === 'number') {
            pricePerPerson = tripData.price;
        }

        return pricePerPerson * formData.number_of_people;
    };

    const calculateToken = () => {
        return Math.round(calculateTotal() * 0.01);
    };

    const calculateBalance = () => {
        return calculateTotal() - calculateToken();
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Get price per person (same logic as calculateTotal)
            let pricePerPerson = 0;
            if (typeof tripData?.price === 'string') {
                pricePerPerson = parseFloat(tripData.price.replace(/[^0-9.]/g, '')) || 0;
            } else if (typeof tripData?.price === 'number') {
                pricePerPerson = tripData.price;
            }

            const bookingData = {
                trip_id: tripData.id,
                trip_type: tripType,
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                travel_date: formData.travel_date,
                number_of_people: parseInt(formData.number_of_people),
                price_per_person: pricePerPerson,
                total_amount: calculateTotal(),
                payment_method: formData.payment_method,
                special_request: formData.special_request || '',
                travelers_data: formData.travelers
            };

            const response = await createBooking(bookingData);

            if (response.success) {
                const { razorpay_order_id, razorpay_key_id, booking_id: bookingId } = response.data;
                setBookingId(bookingId);

                // Initialize Razorpay
                const options = {
                    key: razorpay_key_id,
                    amount: calculateToken() * 100, // Pay the 1% token amount matching backend order
                    name: "Magic Weekends",
                    description: `Booking for ${tripData?.title}`,
                    order_id: razorpay_order_id,
                    handler: async function (response) {
                        setLoading(true);
                        try {
                            const verificationData = {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                booking_id: bookingId
                            };

                            const verifyResponse = await verifyPayment(verificationData);

                            if (verifyResponse.success) {
                                setBookingComplete(true);
                            }
                        } catch (error) {
                            console.error('Payment verification error:', error);
                            alert('Payment verification failed. Please contact support.');
                        } finally {
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: formData.full_name,
                        email: formData.email,
                        contact: formData.phone
                    },
                    theme: {
                        color: "#EAB308" // yellow-500
                    },
                    modal: {
                        ondismiss: function () {
                            setLoading(false);
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (error) {
            console.error('Booking error:', error);
            const errorMsg = typeof error === 'object' ? (error.message || error.error || 'Failed to create booking') : error;
            const detailMsg = error.error ? `\n\nDetails: ${error.error}` : '';
            alert(`${errorMsg}${detailMsg}\n\nPlease try again or contact support.`);
        } finally {
            setLoading(false);
        }
    };


    if (!isOpen) return null;

    if (bookingComplete) {
        return (
            <BookingConfirmation
                bookingId={bookingId}
                email={formData.email}
                onClose={onClose}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 md:p-8">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-full sm:h-auto max-h-[95vh] flex flex-col relative overflow-hidden">
                {loading && <OverlayLoader message="Processing your booking..." />}
                
                {/* Sticky Header Section */}
                <div className="flex-shrink-0 sticky top-0 z-[100] bg-white rounded-t-2xl shadow-md">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 sm:p-6 flex justify-between items-center">
                        <div className="pr-8">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">Book Your Adventure</h2>
                            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-800/80 mt-0.5 uppercase tracking-widest truncate max-w-[200px] sm:max-w-md">{tripData?.title}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-900 hover:text-gray-700 transition-colors p-2 hover:bg-white/20 rounded-full"
                        >
                            <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            {[1, 2, 3, 4].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div className={`flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-full font-bold text-xs sm:text-sm transition-all ${currentStep >= step
                                        ? 'bg-yellow-500 text-white shadow-lg'
                                        : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        {currentStep > step ? <FaCheckCircle /> : step}
                                    </div>
                                    {step < 4 && (
                                        <div className={`w-8 sm:w-16 h-0.5 sm:h-1 mx-1 sm:mx-2 ${currentStep > step ? 'bg-yellow-500' : 'bg-gray-300'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between max-w-2xl mx-auto mt-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <span className={currentStep >= 1 ? 'text-yellow-600' : ''}>Details</span>
                            <span className={currentStep >= 2 ? 'text-yellow-600' : ''}>Travelers</span>
                            <span className={currentStep >= 3 ? 'text-yellow-600' : ''}>Payment</span>
                            <span className={currentStep >= 4 ? 'text-yellow-600' : ''}>Review</span>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 relative z-0">
                    {/* Step 1: Basic Details */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.full_name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="John Doe"
                                    />
                                    {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="+91-9876543210"
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Travel Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="travel_date"
                                        value={formData.travel_date}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.travel_date ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.travel_date && <p className="text-red-500 text-sm mt-1">{errors.travel_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of People <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="number_of_people"
                                        value={formData.number_of_people}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="20"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.number_of_people ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.number_of_people && <p className="text-red-500 text-sm mt-1">{errors.number_of_people}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Special Requests (Optional)
                                    </label>
                                    <textarea
                                        name="special_request"
                                        value={formData.special_request}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        placeholder="Any special requirements or requests..."
                                    />
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Price per person:</span>
                                    <span className="font-bold text-gray-900">{tripData?.price}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-yellow-200">
                                    <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                                    <span className="text-2xl font-bold text-yellow-600">
                                        ₹{calculateTotal().toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Traveler Information */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Traveler Information</h3>

                            {formData.travelers.map((traveler, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-semibold text-gray-900 mb-3">Traveler {index + 1}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={traveler.name}
                                                onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors[`traveler_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Full name"
                                            />
                                            {errors[`traveler_${index}_name`] && (
                                                <p className="text-red-500 text-sm mt-1">{errors[`traveler_${index}_name`]}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                                            <input
                                                type="number"
                                                value={traveler.age}
                                                onChange={(e) => handleTravelerChange(index, 'age', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder="Age"
                                                min="1"
                                                max="120"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                            <select
                                                value={traveler.gender}
                                                onChange={(e) => handleTravelerChange(index, 'gender', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-yellow-50/50 border border-yellow-200/50 rounded-xl p-4">
                                        <p className="text-xs text-yellow-800 flex items-center gap-2">
                                            <FaShieldAlt className="text-yellow-600" />
                                            ID Proof will be collected by our tour manager at the pickup point.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 3: Payment Method */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Select Booking Option</h3>
                            
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-sm text-yellow-800">
                                <p><strong>Note:</strong> If you done payment online your have to pay extra for RAZORPAY. Choose the Whatsapp option to save your money!</p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleWhatsappBooking}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md transition-all font-bold text-lg"
                                >
                                    <FaWhatsapp className="w-6 h-6" />
                                    Message me on Whatsapp <span className="text-green-100 text-sm font-normal tracking-wide">(save your money)</span>
                                </button>

                                <div className="text-center text-gray-400 font-bold uppercase text-xs py-1">OR</div>

                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/register');
                                            onClose();
                                            return;
                                        }
                                        setFormData(prev => ({ ...prev, payment_method: 'paytm' }));
                                        handleNext();
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-all font-bold border border-gray-200"
                                >
                                    Register and book online
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Confirm */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Review Your Booking</h3>

                            {/* Trip Details */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Trip Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trip:</span>
                                        <span className="font-medium">{tripData?.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">{tripData?.duration}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Travel Date:</span>
                                        <span className="font-medium">{new Date(formData.travel_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Contact Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium">{formData.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{formData.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span className="font-medium">{formData.phone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Travelers */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Travelers ({formData.number_of_people})</h4>
                                <div className="space-y-2 text-sm">
                                    {formData.travelers.map((traveler, index) => (
                                        <div key={index} className="flex justify-between">
                                            <span className="text-gray-600">{index + 1}. {traveler.name}</span>
                                            <span className="font-medium">
                                                {traveler.age && `${traveler.age} yrs`} {traveler.gender && `• ${traveler.gender}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Trip Amount:</span>
                                        <span className="font-bold text-gray-900">₹{calculateTotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-600 font-medium">
                                        <span className="">Remaining Balance:</span>
                                        <span className="">- ₹{calculateBalance().toLocaleString()}</span>
                                    </div>
                                    <div className="pt-2 border-t border-yellow-200 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-yellow-700 font-bold uppercase tracking-wider">Token Amount to Pay Now</p>
                                            <p className="text-xs text-gray-500">(1% of total price)</p>
                                        </div>
                                        <span className="text-2xl font-black text-yellow-600">
                                            ₹{calculateToken().toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-4">
                                <FaShieldAlt className="text-green-600" />
                                <span>100% Secure Booking</span>
                                <FaShieldAlt className="text-green-600" />
                                <span>SSL Encrypted</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="sticky bottom-0 bg-white border-t p-6 rounded-b-2xl flex justify-between gap-4 z-50">
                    {currentStep > 1 && (
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Back
                        </button>
                    )}

                    {currentStep < 4 && currentStep !== 3 && (
                        <button
                            onClick={handleNext}
                            className="ml-auto px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-bold shadow-lg"
                        >
                            Next
                        </button>
                    )}
                    
                    {currentStep === 4 && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="ml-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <InlineSpinner size="sm" color="white" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle />
                                    Confirm Booking
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingForm;
