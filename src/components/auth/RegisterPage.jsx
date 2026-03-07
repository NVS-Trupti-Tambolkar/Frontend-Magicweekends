import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserPlus, FaLock, FaUser, FaArrowLeft, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../services/Axios';
import { useAuth } from '../../context/AuthContext';
import NotificationSnackbar from '../common/NotificationSnackbar';
import { OverlayLoader } from '../common/LoadingSpinner';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'staff'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        type: 'success'
    });

    // Protect this page - only admin can access
    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col p-4">
                <FaShieldAlt className="text-red-500 w-16 h-16 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-6 text-center">Only administrators can create new user accounts.</p>
                <Link to="/" className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold">Return Home</Link>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const showMessage = (message, type = 'success') => {
        setSnackbar({ open: true, message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            return showMessage("Passwords do not match", "error");
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/register', {
                username: formData.username,
                password: formData.password,
                role: formData.role
            });

            if (response.data.success) {
                showMessage("User created successfully!", "success");
                setFormData({ username: '', password: '', confirmPassword: '', role: 'staff' });
                // Optional: navigate back after a delay
                setTimeout(() => navigate('/'), 2000);
            }
        } catch (error) {
            console.error("Registration error:", error);
            showMessage(error.response?.data?.message || "Failed to create user", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://res.cloudinary.com/ddlbqi64f/image/upload/v1772799325/MagicWeekends/Trips/trip-1772799280148-197967392.webp')` }}
        >
            {/* Dark Overlay for better readability */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

            {loading && <OverlayLoader message="Creating User..." />}
            
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Back to Home Link */}
                <Link 
                    to="/" 
                    className="inline-flex items-center text-gray-400 hover:text-yellow-500 transition-colors mb-8 group"
                >
                    <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Hub
                </Link>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-2xl mb-6 shadow-lg shadow-yellow-500/20 rotate-3 transform transition-transform hover:rotate-0">
                            <FaUserPlus className="text-black text-3xl" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Create New Login</h2>
                        <p className="text-gray-400">Admin Panel • User Registration</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                    <FaUser className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                                    placeholder="Enter username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                    <FaLock className="h-5 w-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    className="block w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-yellow-500 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                    <FaLock className="h-5 w-5" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    className="block w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-yellow-500 transition-colors"
                                >
                                    {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">User Role</label>
                            <select
                                name="role"
                                className="block w-full px-4 py-3.5 bg-[#1e293b] border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all cursor-pointer"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="staff">Staff (Limited Access)</option>
                                <option value="manager">Manager (Create & Edit)</option>
                                <option value="admin">Admin (Full Access)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-6 rounded-2xl shadow-lg shadow-yellow-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8"
                        >
                            Register User
                        </button>
                    </form>
                </div>
                
                <p className="text-center text-gray-500 text-sm mt-8">
                    &copy; 2024 Magic Weekends Admin Panel.
                </p>
            </div>

            <NotificationSnackbar 
                open={snackbar.open} 
                message={snackbar.message} 
                type={snackbar.type} 
                onClose={() => setSnackbar({...snackbar, open: false})} 
            />
        </div>
    );
};

export default RegisterPage;
