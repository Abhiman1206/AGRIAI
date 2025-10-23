
import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell } from 'lucide-react';

const Header: React.FC = () => {
    const { user } = useApp();

    if (!user) return null;

    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center">
                <h1 className="text-2xl font-semibold">{user.role} Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 w-64 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center">
                    <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                    <div className="ml-3 text-left">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
