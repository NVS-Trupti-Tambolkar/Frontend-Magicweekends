import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate('/dashboard/simple-view'); // Navigate back to the home or simple view
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-4xl font-bold text-red-500 mb-4">401 - Unauthorized</h1>
                <p className="text-gray-600 text-lg mb-8">
                    Oops! You don't have permission to access this page.
                </p>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    onClick={handleGoBack}
                >
                    Go Back to Home
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;