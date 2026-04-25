import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, Clock, Map as MapIcon } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const MainLayout = () => {
    const { t } = useTranslation();

    const navItems = [
        { path: '/', label: t('app.dashboard'), icon: <LayoutDashboard size={20} /> },
        { path: '/suspects', label: t('app.suspects'), icon: <Users size={20} /> },
        { path: '/timeline', label: t('app.timeline'), icon: <Clock size={20} /> },
        { path: '/map', label: t('app.map'), icon: <MapIcon size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold text-blue-400 tracking-wider">
                        {t('app.title')}
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-600/20 text-blue-400'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                }`
                            }
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-800 bg-gray-900">
                    <LanguageSwitcher />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
