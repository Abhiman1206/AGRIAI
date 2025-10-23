
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import PolicymakerDashboard from './pages/policymaker/PolicymakerDashboard';
import TraceabilityPage from './pages/traceability/TraceabilityPage';
import Marketplace from './pages/marketplace/Marketplace';
import LogisticsDashboard from './pages/logistics/LogisticsDashboard';
import FinanceDashboard from './pages/farmer/FinanceDashboard';

const AppRoutes: React.FC = () => {
    const { user } = useApp();

    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    }
    
    // Simple role-based routing
    const getDashboard = () => {
        switch(user.role) {
            case 'Farmer': return <FarmerDashboard />;
            case 'Policymaker': return <PolicymakerDashboard />;
            case 'FPO': return <Marketplace />;
            case 'Processor': return <LogisticsDashboard />;
            case 'Logistics': return <LogisticsDashboard />;
            default: return <Navigate to="/login" />;
        }
    }

    return (
        <Layout>
            <Routes>
                <Route path="/" element={getDashboard()} />
                <Route path="/farmer" element={<FarmerDashboard />} />
                <Route path="/finance" element={<FinanceDashboard />} />
                <Route path="/policymaker" element={<PolicymakerDashboard />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/logistics" element={<LogisticsDashboard />} />
                <Route path="/trace/:batchId" element={<TraceabilityPage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Layout>
    );
};


const App: React.FC = () => {
    return (
        <AppProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </AppProvider>
    );
};

export default App;
