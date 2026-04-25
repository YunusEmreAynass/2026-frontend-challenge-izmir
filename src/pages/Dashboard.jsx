import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Search, Activity, User, MapPin, AlertCircle, FileText, Database } from 'lucide-react';
import { fetchAllData } from '../store/slices/dataSlice';

const Dashboard = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { checkins, messages, sightings, personalNotes, anonymousTips, isLoading, error } = useSelector((state) => state.data);

    // Global arama barı için statemiz
    const [searchQuery, setSearchQuery] = useState('');

    // Sayfa açıldığında Redux Thunk üzerinden verileri (Jotform) çek
    useEffect(() => {
        // Eğer henüz veri yüklenmediyse, yüklenmiyorsa ve daha önce hata alınmadıysa istek at
        // Böylece sürekli re-render döngüsüne (1000'lerce istek) girmesini önleriz
        if (checkins.length === 0 && messages.length === 0 && !isLoading && !error) {
            dispatch(fetchAllData());
        }
    }, [dispatch, checkins.length, messages.length, isLoading, error]);

    const totalDataCount = checkins.length + messages.length + sightings.length + personalNotes.length + anonymousTips.length;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full text-blue-400">
                <Activity className="animate-spin mr-3" />
                <span className="font-semibold text-lg">{t('app.loading')}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-red-400 border border-red-800 bg-red-950/20 rounded m-6 flex items-center">
                <AlertCircle className="mr-3" />
                <span>{t('app.error')}: {error}</span>
            </div>
        );
    }

    // Sadece tasarımsal olarak istatistikleri temsil eden kart yapısı (Component içi)
    const StatCard = ({ title, count, icon, color }) => (
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-lg flex items-center justify-between hover:border-gray-700 transition">
            <div>
                <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
                <p className="text-2xl font-bold text-gray-100">{count || 0}</p>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
        </div>
    );

    return (
        <div className="p-8 pb-32">
            {/* Global Search Bar */}
            <div className="mb-8 relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Global Search (Name, Text, Location)..."
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {/* Podo'nun son görülme kartı - Placeholder logic for now */}
                <div className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-lg col-span-full xl:col-span-2">
                    <div className="flex items-start gap-4">
                        <div className="p-4 bg-blue-600/30 rounded-full text-blue-400">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-blue-400 font-semibold mb-2">TARGET: "PODO" - Last Known Status</h2>
                            <p className="text-gray-300 text-lg">
                                <MapPin className="inline mr-2 text-gray-500" size={18} />
                                Location processing from Checkins & Sightings...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Data Traffic Cards */}
                <StatCard title="Total Data Traffic" count={totalDataCount} icon={<Database />} color="bg-purple-900/30 text-purple-400" />
                <StatCard title="Check-ins" count={checkins.length} icon={<MapPin />} color="bg-emerald-900/30 text-emerald-400" />
                <StatCard title="Messages" count={messages.length} icon={<Activity />} color="bg-blue-900/30 text-blue-400" />
                <StatCard title="Sightings" count={sightings.length} icon={<User />} color="bg-orange-900/30 text-orange-400" />
                <StatCard title="Personal Notes" count={personalNotes.length} icon={<FileText />} color="bg-cyan-900/30 text-cyan-400" />
                <StatCard title="Anonymous Tips" count={anonymousTips.length} icon={<AlertCircle />} color="bg-red-900/30 text-red-400" />
            </div>
        </div>
    );
};

export default Dashboard;
