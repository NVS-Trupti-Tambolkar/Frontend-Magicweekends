// src/hooks/useAuth.js
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const useAuth = () => {
    const { 
        user, 
        selectedSite, 
        setSelectedSite, 
        login, 
        logout, 
        loading,
        poId, 
        setPoId,
        poNumber, 
        setPoNumber,
        description, 
        setDescription,
        projectId, 
        setProjectId,
        projectName, // Added project name
        setProjectName, // Added project name setter
    } = useContext(AuthContext);
    
    return {
        user,
        selectedSite,
        setSelectedSite,
        login,
        logout,
        loading,
        poId, 
        setPoId,
        poNumber, 
        setPoNumber,
        description, 
        setDescription,
        projectId, 
        setProjectId,
        projectName, // Added project name
        setProjectName, // Added project name setter
    };
};

export default useAuth;