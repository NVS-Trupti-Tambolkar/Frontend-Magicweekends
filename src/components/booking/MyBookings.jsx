import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaTrash, FaEdit, FaPlus, FaChevronRight } from 'react-icons/fa';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { getUserBookings, getAllBookings, updateBookingStatus, cancelBooking } from '../../services/BookingService';
import { PageLoader } from '../common/LoadingSpinner';
import NotificationSnackbar from '../common/NotificationSnackbar';
import { useAuth } from '../../context/AuthContext';

const MyBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

    const isAdmin = user?.role === 'admin';

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let response;
            if (isAdmin) {
                response = await getAllBookings();
            } else {
                response = await getUserBookings(user.email);
            }

            if (response.success) {
                setBookings(response.data);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchBookings();
    }, [user, isAdmin]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this booking record?")) return;
        try {
            await cancelBooking(id);
            setSnackbar({ open: true, message: 'Booking record removed', type: 'success' });
            fetchBookings();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to delete booking', type: 'error' });
        }
    };

    const handleStatusChange = async (id, currentStatus) => {
        const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        const currentIndex = statuses.indexOf(currentStatus.toLowerCase());
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        
        try {
            await updateBookingStatus(id, nextStatus);
            setSnackbar({ open: true, message: `Status updated to ${nextStatus}`, type: 'success' });
            fetchBookings();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to update status', type: 'error' });
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (statusFilter === 'all') return true;
        return (booking.booking_status || 'pending').toLowerCase() === statusFilter.toLowerCase();
    });

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    if (loading) return <PageLoader message="Accessing central manifest..." />;

    return (
        <div className="min-h-screen relative overflow-hidden bg-black font-['Inter']">
            {/* Premium Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2042&q=80" 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-30 scale-105 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header scrolled={true} />

                <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 pt-32 pb-20">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fadeIn">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-md mb-4 shadow-sm font-['Outfit']">
                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                                Administration
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white leading-none uppercase italic tracking-tighter font-['Outfit']">
                                CENTRAL <span className="text-yellow-500">EXPEDITIONS</span>
                            </h1>
                            <p className="text-gray-400 font-medium text-sm mt-3 tracking-wide">Managing the pulse of global travel operations.</p>
                        </div>

                        {isAdmin && (
                            <button 
                                onClick={() => navigate('/admin/create-booking')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-2xl shadow-yellow-500/20 active:scale-95 transition-all flex items-center gap-3 font-['Outfit']"
                            >
                                <FaPlus /> Create New Booking
                            </button>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide animate-fadeIn" style={{ scrollbarWidth: 'none' }}>
                        {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-yellow-500/50'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Bookings List */}
                    <div className="space-y-4">
                        {/* Table Header (Hidden on Mobile) */}
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 bg-transparent text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] font-['Outfit']">
                            <div className="col-span-2">TICKET</div>
                            <div className="col-span-3">EXPLORER</div>
                            <div className="col-span-2">TRAVEL DATE</div>
                            <div className="col-span-1 text-center">PAX</div>
                            <div className="col-span-2 text-right">REVENUE</div>
                            <div className="col-span-2 text-right px-4">STATUS & ACTIONS</div>
                        </div>

                        {filteredBookings.length === 0 ? (
                            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-20 text-center animate-fadeIn">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No entries found for this manifest</p>
                            </div>
                        ) : (
                            filteredBookings.map((booking, index) => (
                                <div 
                                    key={booking.id} 
                                    className="group bg-white/5 backdrop-blur-md rounded-[1.5rem] border border-white/10 p-6 lg:p-4 shadow-sm hover:shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 animate-slideInUp"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
                                        {/* ID & Category */}
                                        <div className="col-span-2 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-[10px] font-black text-yellow-500 border border-yellow-500/20">
                                                #{booking.id}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase italic tracking-tighter">{(booking.trip_type || 'Trip').replace('_', ' ')}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">EXP-{booking.trip_id}</p>
                                            </div>
                                        </div>

                                        {/* Explorer */}
                                        <div className="col-span-3">
                                            <p className="text-xs font-black text-white uppercase tracking-tight">{booking.full_name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium lowercase truncate">{booking.email}</p>
                                        </div>

                                        {/* Date */}
                                        <div className="col-span-2 flex items-center gap-3">
                                            <div className="p-2 bg-white/5 rounded-lg text-yellow-500 text-[10px] border border-white/10">
                                                <FaCalendarAlt />
                                            </div>
                                            <p className="text-[11px] font-bold text-gray-300 uppercase tracking-tighter">
                                                {new Date(booking.travel_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>

                                        {/* Pax */}
                                        <div className="col-span-1 text-center font-black text-xs text-white border-x border-white/5 flex flex-col justify-center items-center">
                                            <div className="flex items-center gap-1.5">
                                               <FaUser className="text-[10px] text-yellow-500" />
                                               {booking.number_of_people}
                                            </div>
                                            <span className="text-[8px] text-gray-500 uppercase font-black">Quantity</span>
                                        </div>

                                        {/* Revenue */}
                                        <div className="col-span-2 text-right">
                                            <p className="text-sm font-black text-yellow-500 italic">₹{parseFloat(booking.total_amount).toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{booking.payment_method || 'CASH'}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-2 flex justify-end items-center gap-3 px-2">
                                            <button 
                                                onClick={() => isAdmin && handleStatusChange(booking.id, booking.booking_status)}
                                                disabled={!isAdmin}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${getStatusStyles(booking.booking_status)} ${isAdmin ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default transition-none'}`}
                                            >
                                                {booking.booking_status || 'Pending'}
                                            </button>
                                            
                                            {isAdmin && (
                                                <div className="flex gap-1.5 border-l border-white/10 pl-3 ml-1">
                                                    <button 
                                                        onClick={() => navigate(`/travel/${booking.trip_id}?type=${booking.trip_type}`)}
                                                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                                        title="View/Edit Trip"
                                                    >
                                                        <FaEdit className="text-sm" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(booking.id)}
                                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Delete Booking"
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>

                <Footer />
            </div>

            <NotificationSnackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
                .animate-slideInUp { animation: slideInUp 0.6s ease-out forwards; opacity: 0; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default MyBookings;
