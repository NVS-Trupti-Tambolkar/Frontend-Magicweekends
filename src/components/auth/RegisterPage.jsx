import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserPlus, FaLock, FaUser, FaArrowLeft, FaShieldAlt, FaEye, FaEyeSlash, FaEnvelope } from 'react-icons/fa';
import api from '../../services/Axios';
import { useAuth } from '../../context/AuthContext';
import NotificationSnackbar from '../common/NotificationSnackbar';
import { OverlayLoader } from '../common/LoadingSpinner';
import { GoogleLogin } from '@react-oauth/google';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'staff',
        otp: ''
    });
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        type: 'success'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const showMessage = (message, type = 'success') => {
        setSnackbar({ open: true, message, type });
    };

    const handleGoogleSuccess = async (googleResponse) => {
        try {
            setLoading(true);
            const response = await api.post('/auth/google', {
                credential: googleResponse.credential
            });
            
            if (response.data.success) {
                const { token, username, role, email } = response.data.data;
                login({ username, role, email }, token);
                showMessage("Login successful! Redirecting...", "success");
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (error) {
            console.error("Google Login error:", error);
            showMessage("Google Login failed. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            return showMessage("Please enter an email address first", "warning");
        }
        
        try {
            setSendingOtp(true);
            const response = await api.post('/auth/send-otp', { email: formData.email });
            if (response.data.success) {
                setOtpSent(true);
                showMessage("OTP sent to your email!", "success");
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            showMessage(error.response?.data?.message || "Failed to send OTP", "error");
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            return showMessage("Passwords do not match", "error");
        }

        if (!otpSent || !formData.otp) {
            return showMessage("Please verify your email with OTP first", "warning");
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                otp: formData.otp
            });

            if (response.data.success) {
                showMessage("User created successfully!", "success");
                setFormData({ username: '', email: '', password: '', confirmPassword: '', role: 'staff' });
                // Optional: navigate back after a delay
                setTimeout(() => navigate('/login'), 2000);
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
                        <h2 className="text-3xl font-bold text-white mb-2">{user?.role === 'admin' ? 'Create New Admin' : 'Join Our Adventure'}</h2>
                        <p className="text-gray-400">{user?.role === 'admin' ? 'Admin Panel • User Registration' : 'Register to start your journey'}</p>
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
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                    <FaEnvelope className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    disabled={otpSent}
                                    className={`block w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {otpSent && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Enter OTP</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                        <FaShieldAlt className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        name="otp"
                                        required
                                        maxLength="6"
                                        className="block w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all tracking-widest text-center text-xl font-mono"
                                        placeholder="------"
                                        value={formData.otp}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

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

                        {user?.role === 'admin' && (
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
                        )}

                        {!otpSent ? (
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={sendingOtp || !formData.email}
                                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 disabled:text-gray-400 text-black font-bold py-4 px-6 rounded-2xl shadow-lg shadow-yellow-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8"
                            >
                                {sendingOtp ? 'Sending OTP...' : 'Send Verification OTP'}
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-green-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8 relative overflow-hidden group"
                            >
                                <span className="relative z-10">{user?.role === 'admin' ? 'Register User' : 'Verify & Create Account'}</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        )}
                    </form>

                    <div className="mt-8">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-[#1e293b] text-gray-500 font-medium whitespace-nowrap">Or register with</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => showMessage("Google Login failed", "error")}
                                useOneTap
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                            />
                        </div>
                    </div>
                </div>
                
                <p className="text-center mt-6 text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors">
                        Login here
                    </Link>
                </p>

                <p className="text-center text-gray-500 text-sm mt-6">
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
