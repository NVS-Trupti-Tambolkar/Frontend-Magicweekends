import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaUser, FaUsers, FaCalendarAlt, FaMoneyBillWave, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import api from '../../services/Axios';
import { PageLoader } from '../common/LoadingSpinner';
import NotificationSnackbar from '../common/NotificationSnackbar';

const AdminBookingCreation = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingTrips, setFetchingTrips] = useState(true);
    const [trips, setTrips] = useState({ normal: [], weekend: [] });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

    const [formData, setFormData] = useState({
        trip_type: 'normal',
        trip_id: '',
        full_name: '',
        email: '',
        phone: '',
        travel_date: '',
        number_of_people: 1,
        total_amount: '',
        payment_method: 'cash',
        special_request: '',
        travelers_data: [{ name: '', age: '', gender: 'male' }]
    });

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const [normalRes, weekendRes] = await Promise.all([
                    api.get('/Trip/getTrips'),
                    api.get('/WeekendTrip/getWeekendallTrips')
                ]);
                setTrips({
                    normal: normalRes.data.data || [],
                    weekend: weekendRes.data.data || []
                });
            } catch (err) {
                console.error("Error fetching trips:", err);
                setSnackbar({ open: true, message: 'Failed to load trips', type: 'error' });
            } finally {
                setFetchingTrips(false);
            }
        };
        fetchTrips();
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-calculate amount if trip changes
        if (name === 'trip_id' || name === 'trip_type') {
            const selectedTripId = name === 'trip_id' ? value : formData.trip_id;
            const selectedType = name === 'trip_type' ? value : formData.trip_type;
            const tripPool = selectedType === 'normal' ? trips.normal : trips.weekend;
            const trip = tripPool.find(t => t.id.toString() === selectedTripId.toString());
            if (trip) {
                // Remove non-numeric chars from price string (e.g. ₹5,000 -> 5000)
                const price = parseFloat(trip.price.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) {
                    setFormData(prev => ({ 
                        ...prev, 
                        [name]: value,
                        total_amount: price * prev.number_of_people 
                    }));
                }
            }
        }

        if (name === 'number_of_people') {
            const count = parseInt(value) || 1;
            const tripPool = formData.trip_type === 'normal' ? trips.normal : trips.weekend;
            const trip = tripPool.find(t => t.id.toString() === formData.trip_id.toString());
            
            // Adjust roster size
            const newRoster = [...formData.travelers_data];
            if (count > newRoster.length) {
                for (let i = newRoster.length; i < count; i++) {
                    newRoster.push({ name: '', age: '', gender: 'male' });
                }
            } else {
                newRoster.splice(count);
            }

            setFormData(prev => {
                let newTotal = prev.total_amount;
                if (trip) {
                    const price = parseFloat(trip.price.replace(/[^0-9.]/g, ''));
                    if (!isNaN(price)) newTotal = price * count;
                }
                return { ...prev, number_of_people: count, travelers_data: newRoster, total_amount: newTotal };
            });
        }
    };

    const handleRosterChange = (index, field, value) => {
        const newRoster = [...formData.travelers_data];
        newRoster[index][field] = value;
        setFormData(prev => ({ ...prev, travelers_data: newRoster }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/Booking/bookings', formData);
            if (response.data.success) {
                setSnackbar({ open: true, message: 'Booking committed to manifest successfully!', type: 'success' });
                setTimeout(() => navigate('/my-bookings'), 2000);
            }
        } catch (err) {
            console.error("Booking error:", err);
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to create booking', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (fetchingTrips) return <PageLoader />;

    return (
        <div className="min-h-screen bg-[#F0F2F5]">
            <Header scrolled={scrolled} />
            
            <div className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <button 
                        onClick={() => navigate('/my-bookings')}
                        className="flex items-center gap-2 text-yellow-600 font-bold text-xs uppercase tracking-widest mb-8 hover:text-yellow-700 transition-all"
                    >
                        <FaChevronLeft className="text-[10px]" /> Back to Admin
                    </button>

                    {/* Form Card */}
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
                        {/* Header */}
                        <div className="bg-gray-50 border-b border-gray-100 p-8 sm:p-12">
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight">
                                ADMIN <span className="text-yellow-500">BOOKING CREATION</span>
                            </h1>
                            <p className="text-gray-500 font-medium text-sm mt-2">Manually register a new explorer into the central manifest.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-12">
                            {/* Trip Classification */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Trip Classification</label>
                                    <select 
                                        name="trip_type"
                                        value={formData.trip_type}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="normal">Normal Trip</option>
                                        <option value="weekend">Weekend Trip</option>
                                    </select>
                                </section>
                                <section>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Universal Trip Search</label>
                                    <select 
                                        name="trip_id"
                                        value={formData.trip_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="">Select Destination</option>
                                        {(formData.trip_type === 'normal' ? trips.normal : trips.weekend).map(trip => (
                                            <option key={trip.id} value={trip.id}>{trip.title} ({trip.price})</option>
                                        ))}
                                    </select>
                                </section>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Explorer Identity */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-yellow-500 rounded-full"></div>
                                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Explorer Identity</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Primary Representative</label>
                                        <input 
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            placeholder="Full Name"
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </section>
                                    <section>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Electronic Mail</label>
                                        <input 
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Email Address"
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </section>
                                    <section>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Contact Frequency</label>
                                        <input 
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Phone Number"
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </section>
                                    <section>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Expansion Date</label>
                                        <input 
                                            type="date"
                                            name="travel_date"
                                            value={formData.travel_date}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </section>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Expedition Scale */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-yellow-500 rounded-full"></div>
                                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Expedition Scale</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <section>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Pax Capacity</label>
                                        <input 
                                            type="number"
                                            name="number_of_people"
                                            min="1"
                                            value={formData.number_of_people}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </section>
                                    <section>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Final Ledger Amount (₹)</label>
                                        <input 
                                            type="text"
                                            name="total_amount"
                                            value={formData.total_amount}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </section>
                                    <section>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Payment Protocol</label>
                                        <select 
                                            name="payment_method"
                                            value={formData.payment_method}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="cash">Direct Cash</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="gpay">GPay / UPI</option>
                                            <option value="paytm">Paytm</option>
                                        </select>
                                    </section>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Full Roster Details */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-yellow-500 rounded-full"></div>
                                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Full Roster Details</h2>
                                </div>
                                
                                {formData.travelers_data.map((traveler, index) => (
                                    <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                                        <span className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 text-[10px] font-bold text-gray-900 rounded-full flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        <section>
                                            <input 
                                                type="text"
                                                placeholder="Identity Name"
                                                value={traveler.name}
                                                onChange={(e) => handleRosterChange(index, 'name', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-yellow-500 outline-none"
                                            />
                                        </section>
                                        <section>
                                            <input 
                                                type="text"
                                                placeholder="Age Unit"
                                                value={traveler.age}
                                                onChange={(e) => handleRosterChange(index, 'age', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-yellow-500 outline-none"
                                            />
                                        </section>
                                        <section>
                                            <select 
                                                value={traveler.gender}
                                                onChange={(e) => handleRosterChange(index, 'gender', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-yellow-500 outline-none"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </section>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-gray-100" />

                            {/* Special Directives */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Special Directives / Memory Notes</label>
                                <textarea 
                                    name="special_request"
                                    value={formData.special_request}
                                    onChange={handleChange}
                                    placeholder="Enter any specific requirements or coordination notes..."
                                    rows="4"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-yellow-500 outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-8">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#916700] hover:bg-[#A37B00] text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] italic text-sm shadow-xl shadow-yellow-900/10 hover:shadow-yellow-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'COMMITTING TO MANIFEST...' : (
                                        <>
                                            <FaCheckCircle className="text-lg" /> COMMIT BOOKING TO MANIFEST
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-gray-400 text-center mt-6 font-bold uppercase tracking-widest leading-relaxed">
                                    This action will immediately update the central database and allocate slots for the selected expedition.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
            <NotificationSnackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
        </div>
    );
};

export default AdminBookingCreation;
