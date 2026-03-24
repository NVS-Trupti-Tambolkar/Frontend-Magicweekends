import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowLeft, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../services/Axios';
import NotificationSnackbar from '../common/NotificationSnackbar';
import { OverlayLoader } from '../common/LoadingSpinner';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
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

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            return showMessage("Please enter your email address", "warning");
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/forgot-password', { email: formData.email });
            
            if (response.data.success) {
                showMessage(response.data.message || "OTP sent successfully!", "success");
                setStep(2);
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            showMessage(error.response?.data?.message || "Failed to send OTP", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            return showMessage("Passwords do not match", "error");
        }

        if (!formData.otp) {
            return showMessage("Please enter the verification code", "warning");
        }

        if (formData.newPassword.length < 6) {
            return showMessage("Password must be at least 6 characters long", "warning");
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/reset-password', {
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                showMessage("Password reset successfully! Redirecting to login...", "success");
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            console.error("Reset password error:", error);
            showMessage(error.response?.data?.message || "Failed to reset password", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://res.cloudinary.com/ddlbqi64f/image/upload/v1772799325/MagicWeekends/Trips/trip-1772799280148-197967392.webp')` }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

            {loading && <OverlayLoader message={step === 1 ? "Sending OTP..." : "Resetting Password..."} />}
            
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <Link 
                    to="/login" 
                    className="inline-flex items-center text-gray-400 hover:text-yellow-500 transition-colors mb-8 group"
                >
                    <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-2xl mb-5 shadow-lg shadow-yellow-500/20 rotate-3 transform transition-transform hover:rotate-0">
                            <FaShieldAlt className="text-black text-3xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Password Recovery</h2>
                        <p className="text-gray-400 text-sm">
                            {step === 1 ? 'Enter your email to receive an OTP' : 'Enter OTP and your new password'}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                        <FaEnvelope className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                                        placeholder="Enter registered email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold py-3 px-4 rounded-xl shadow-lg shadow-yellow-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
                            >
                                Send Verification Code
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Verification Code</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                        <FaShieldAlt className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="text"
                                        name="otp"
                                        required
                                        maxLength="6"
                                        className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all tracking-widest text-center font-mono"
                                        placeholder="------"
                                        value={formData.otp}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                        <FaLock className="h-4 w-4" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        required
                                        className="block w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                                        placeholder="Enter new password"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-yellow-500 transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Confirm New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                                        <FaLock className="h-4 w-4" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        className="block w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                                        placeholder="Confirm new password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-yellow-500 transition-colors"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-500 hover:bg-green-400 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 relative overflow-hidden group"
                            >
                                <span className="relative z-10">Reset Password</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        </form>
                    )}
                </div>
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

export default ForgotPasswordPage;
