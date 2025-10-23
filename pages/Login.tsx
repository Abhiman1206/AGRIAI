import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { Leaf, Users, GitBranch, Truck, Building, Award } from 'lucide-react';


const roles: { name: UserRole; icon: React.ReactNode; description: string }[] = [
    { name: 'Farmer', icon: <Leaf className="w-8 h-8 text-green-500" />, description: "Access market prices and advisories." },
    { name: 'FPO', icon: <Users className="w-8 h-8 text-blue-500" />, description: "Manage member listings and orders." },
    { name: 'Processor', icon: <Building className="w-8 h-8 text-gray-500" />, description: "Track inventory and production." },
    { name: 'Logistics', icon: <Truck className="w-8 h-8 text-orange-500" />, description: "Monitor shipments and routes." },
    { name: 'Policymaker', icon: <Award className="w-8 h-8 text-indigo-500" />, description: "View analytics and insights." },
];

const Login: React.FC = () => {
    const { login } = useApp();
    const navigate = useNavigate();

    const handleLogin = (role: UserRole) => {
        login(role);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center space-x-4">
                        <img src="https://img.icons8.com/plasticine/100/sunflower.png" alt="AgriChain AI Logo" className="w-20 h-20" />
                        <div>
                            <h1 className="text-5xl font-bold text-green-700">AgriChain AI</h1>
                            <p className="text-xl text-gray-600 mt-2">Digitizing India's Edible Oil Value Chain from Seed to Shelf</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">Select Your Role</h2>
                    <p className="text-center text-gray-500 mb-8">Choose your stakeholder profile to access a tailored dashboard designed to tackle challenges like import dependency and post-harvest losses.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roles.map((role) => (
                            <button
                                key={role.name}
                                onClick={() => handleLogin(role.name)}
                                className="text-left p-6 border rounded-xl hover:shadow-lg hover:border-green-500 hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 rounded-full p-3 group-hover:bg-green-100 transition-colors">
                                        {role.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
                                        <p className="text-sm text-gray-500">{role.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                 <p className="text-center text-gray-500 mt-8">
                    An AI-enabled platform to ensure seamless coordination and optimize logistics.
                </p>
            </div>
        </div>
    );
};

export default Login;
