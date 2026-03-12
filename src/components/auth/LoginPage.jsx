import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaChevronRight, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../services/Axios';
import NotificationSnackbar from '../common/NotificationSnackbar';
import { useAuth } from '../../context/AuthContext';
import { InlineSpinner } from '../common/LoadingSpinner';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        type: 'success'
    });

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showMessage = (message, type = 'success') => {
        setSnackbar({
            open: true,
            message,
            type
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password) {
            showMessage("Please enter both username and password", "warning");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/login', formData);
            
            if (response.data.success) {
                const { token, username, role, email } = response.data.data;
                
                // Use AuthContext to login
                login({ username, role, email }, token);
                
                showMessage("Login successful! Redirecting...", "success");
                
                // Redirect after a short delay
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMsg = error.response?.data?.message || "Invalid credentials. Please try again.";
            showMessage(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://res.cloudinary.com/ddlbqi64f/image/upload/v1772799325/MagicWeekends/Trips/trip-1772799280148-197967392.webp')` }}
        >
            {/* Dark Overlay for better readability */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-md w-full relative z-10">
                {/* Back Link */}
                <Link to="/" className="inline-flex items-center text-gray-400 hover:text-yellow-500 transition-colors mb-8 group">
                    <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-8 sm:p-10">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-2">
                                MAGIC <span className="text-yellow-500">WEEKENDS</span>
                            </h2>
                            <p className="text-gray-400 text-sm">Admin Access Portal</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                        <FaUser />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="admin"
                                        className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                        <FaLock />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative overflow-hidden bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-yellow-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <InlineSpinner size="sm" color="black" />
                                    ) : (
                                        <>
                                            SIGN IN <FaChevronRight className="text-xs" />
                                        </>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-[#0f172a] text-gray-500 font-medium">Or continue with</span>
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
                </div>

                <p className="text-center mt-6 text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors">
                        Register here
                    </Link>
                </p>

                <p className="text-center mt-6 text-gray-500 text-xs">
                    © 2024 MAGIC WEEKENDS. All rights reserved.
                </p>
            </div>

            <NotificationSnackbar
                open={snackbar.open}
                message={snackbar.message}
                type={snackbar.type}
                onClose={handleCloseSnackbar}
            />
        </div>
    );
};

export default LoginPage;
