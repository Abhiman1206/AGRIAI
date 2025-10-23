
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Home, BarChart2, DollarSign, Map, Settings, LogOut, Sun, Moon, Users, Truck, Factory, Search, Landmark } from 'lucide-react';

const Sidebar: React.FC = () => {
    const { user, logout, theme, toggleTheme } = useApp();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = {
        Farmer: [
            { icon: <Home size={20} />, name: t('sidebar.dashboard'), path: '/farmer' },
            { icon: <DollarSign size={20} />, name: t('sidebar.marketplace'), path: '/marketplace' },
            { icon: <Landmark size={20} />, name: t('sidebar.finance'), path: '/finance' },
            { icon: <Search size={20} />, name: t('sidebar.traceability'), path: '/trace/MUSTARD-RJ-2024-07-15' },
        ],
        Policymaker: [
            { icon: <Home size={20} />, name: t('sidebar.dashboard'), path: '/policymaker' },
            { icon: <BarChart2 size={20} />, name: t('sidebar.analytics'), path: '/analytics' },
            { icon: <Users size={20} />, name: t('sidebar.stakeholders'), path: '/stakeholders' },
        ],
        FPO: [
            { icon: <Home size={20} />, name: t('sidebar.dashboard'), path: '/' },
            { icon: <DollarSign size={20} />, name: t('sidebar.marketplace'), path: '/marketplace' },
            { icon: <Truck size={20} />, name: t('sidebar.logistics'), path: '/logistics' },
        ],
        Processor: [
            { icon: <Factory size={20} />, name: t('sidebar.processing'), path: '/' },
            { icon: <Truck size={20} />, name: t('sidebar.logistics'), path: '/logistics' },
            { icon: <Search size={20} />, name: t('sidebar.traceability'), path: '/trace/MUSTARD-RJ-2024-07-15' },
        ],
        Logistics: [
            { icon: <Truck size={20} />, name: t('sidebar.shipments'), path: '/logistics' },
            { icon: <Map size={20} />, name: t('sidebar.warehouseMap'), path: '/logistics' },
        ]
    };

    const userLinks = user ? navLinks[user.role] : [];

    return (
        <aside className={`relative bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
                    <div className="flex items-center">
                        <img src="https://img.icons8.com/plasticine/100/sunflower.png" alt="logo" className="h-10 w-10"/>
                        {isSidebarOpen && <h1 className="text-xl font-bold ml-2 text-green-600 dark:text-green-500">AgriChain</h1>}
                    </div>
                </div>
                <nav className="flex-1 mt-4">
                    <ul>
                        {userLinks.map(link => (
                            <li key={link.name} className="px-4 py-1">
                                <NavLink to={link.path} className={({ isActive }) => `flex items-center py-2 px-4 rounded-lg transition-colors duration-200 ${isActive ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    {link.icon}
                                    {isSidebarOpen && <span className="ml-4">{link.name}</span>}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t dark:border-gray-700">
                     <NavLink to="/settings" className={({ isActive }) => `flex items-center w-full py-2 px-4 rounded-lg transition-colors duration-200 mb-2 ${isActive ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <Settings size={20} />
                        {isSidebarOpen && <span className="ml-4">{t('sidebar.settings')}</span>}
                    </NavLink>
                    <button onClick={toggleTheme} className="flex items-center w-full py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        {isSidebarOpen && <span className="ml-4">{t('sidebar.toggleTheme')}</span>}
                    </button>
                    <button onClick={handleLogout} className="flex items-center w-full py-2 px-4 mt-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900">
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="ml-4">{t('sidebar.logout')}</span>}
                    </button>
                </div>
            </div>
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-20 bg-green-600 text-white rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
        </aside>
    );
};

export default Sidebar;
