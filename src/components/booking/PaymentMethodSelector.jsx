import React from 'react';
import { FaUniversity, FaMoneyBillWave, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { SiPaytm, SiGooglepay } from 'react-icons/si';

const PaymentMethodSelector = ({ selectedMethod, onSelect }) => {
    const paymentMethods = [
        {
            id: 'paytm',
            name: 'Paytm',
            icon: <SiPaytm className="w-8 h-8" />,
            description: 'Wallet or UPI',
            color: 'bg-[#00B9F1]',
            lightColor: 'bg-sky-50',
            borderColor: 'border-sky-200'
        },
        {
            id: 'gpay',
            name: 'Google Pay',
            icon: <SiGooglepay className="w-10 h-10" />,
            description: 'Direct UPI Pay',
            color: 'bg-[#4285F4]',
            lightColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            id: 'bank_transfer',
            name: 'Bank Transfer',
            icon: <FaUniversity className="w-7 h-7" />,
            description: 'NEFT / RTGS / IMPS',
            color: 'bg-purple-600',
            lightColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
        {
            id: 'cash',
            name: 'Cash',
            icon: <FaMoneyBillWave className="w-7 h-7" />,
            description: 'Pay at Office',
            color: 'bg-amber-600',
            lightColor: 'bg-amber-50',
            borderColor: 'border-amber-200'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {paymentMethods.map((method) => (
                    <button
                        key={method.id}
                        onClick={() => onSelect(method.id)}
                        className={`group relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
                            selectedMethod === method.id
                                ? `${method.borderColor} bg-white shadow-xl ring-4 ring-yellow-500/10 scale-[1.02]`
                                : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-yellow-200'
                        }`}
                    >
                        {/* Selected Tick */}
                        <div className={`absolute top-4 right-4 transition-all duration-500 transform ${
                            selectedMethod === method.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                        }`}>
                            <FaCheckCircle className="text-yellow-500 w-5 h-5 drop-shadow-sm" />
                        </div>

                        {/* Icon Container */}
                        <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 group-hover:scale-110 shadow-inner ${
                            selectedMethod === method.id ? method.color : 'bg-white shadow-sm grayscale group-hover:grayscale-0'
                        }`}>
                            <div className={`${selectedMethod === method.id ? 'text-white' : 'text-gray-400'}`}>
                                {method.icon}
                            </div>
                        </div>

                        {/* Text */}
                        <h4 className={`text-sm font-black uppercase tracking-widest transition-colors ${
                            selectedMethod === method.id ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                            {method.name}
                        </h4>
                        <p className={`text-[10px] font-bold uppercase tracking-tighter mt-1 ${
                            selectedMethod === method.id ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                            {method.description}
                        </p>

                        {/* Underline for selection */}
                        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-yellow-500 rounded-t-full transition-all duration-500 ${
                            selectedMethod === method.id ? 'w-1/3 opacity-100' : 'w-0 opacity-0'
                        }`} />
                    </button>
                ))}
            </div>

            {/* Payment Instructions - Redesigned */}
            {selectedMethod && (
                <div className="animate-fadeIn mt-8 bg-slate-900 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-yellow-500/20"></div>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                            <FaShieldAlt className="text-black" />
                        </div>
                        <h4 className="text-xl font-black text-white tracking-widest uppercase">Safe Payment Guide</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        {selectedMethod === 'paytm' && (
                            <ul className="space-y-4 text-gray-400">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-yellow-500 flex items-center justify-center font-bold text-xs ring-1 ring-slate-700">1</span>
                                    <span>Receive payment QR on your email after confirmation.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-yellow-500 flex items-center justify-center font-bold text-xs ring-1 ring-slate-700">2</span>
                                    <span>Scan using Paytm App and enter the total amount.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-yellow-500 flex items-center justify-center font-bold text-xs ring-1 ring-slate-700">3</span>
                                    <span>Save Screenshot or Transaction ID for verification.</span>
                                </li>
                            </ul>
                        )}
                        {selectedMethod === 'gpay' && (
                            <ul className="space-y-4 text-gray-400">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-yellow-500 flex items-center justify-center font-bold text-xs ring-1 ring-slate-700">1</span>
                                    <span>Receive UPI ID on your email after confirmation.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-yellow-500 flex items-center justify-center font-bold text-xs ring-1 ring-slate-700">2</span>
                                    <span>Pay using Google Pay app and keep the receipt.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-yellow-500 flex items-center justify-center font-bold text-xs ring-1 ring-slate-700">3</span>
                                    <span>Our team will verify and confirm your booking.</span>
                                </li>
                            </ul>
                        )}
                        {selectedMethod === 'bank_transfer' && (
                            <ul className="space-y-4 text-gray-400">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-yellow-500 flex items-center justify-center font-bold text-xs ring-1 ring-slate-700">1</span>
                                    <span>Bank Details: [Your Bank Connect Details Here].</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-yellow-500 flex items-center justify-center font-bold text-xs ring-1 ring-slate-700">2</span>
                                    <span>Complete NEFT/RTGS and share UTR number.</span>
                                </li>
                            </ul>
                        )}
                        {selectedMethod === 'cash' && (
                            <ul className="space-y-4 text-gray-400">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-yellow-500 flex items-center justify-center font-bold text-xs ring-1 ring-slate-700">1</span>
                                    <span>Visit us at: [Your Office Location Address].</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-yellow-500 flex items-center justify-center font-bold text-xs ring-1 ring-slate-700">2</span>
                                    <span>Carry booking ID for smooth cash payment.</span>
                                </li>
                            </ul>
                        )}
                        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700 flex flex-col justify-center">
                            <p className="text-yellow-500 font-bold mb-1 italic">Need Help?</p>
                            <p className="text-xs text-gray-400">Contact our support at +91 98XXX XXXXX if you face any issues during the payment process.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSelector;
