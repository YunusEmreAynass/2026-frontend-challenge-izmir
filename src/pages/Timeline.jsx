import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { MapPin, MessageSquare, Eye, FileText, AlertOctagon, Filter, ArrowDown, ArrowUp } from 'lucide-react';

const Timeline = () => {
    const { t } = useTranslation();
    const { checkins, messages, sightings, personalNotes, anonymousTips } = useSelector((state) => state.data);

    // Filtreleme state'leri
    const [filters, setFilters] = useState({
        checkins: true,
        messages: true,
        sightings: true,
        personalNotes: true,
        anonymousTips: true,
    });

    const [sortAsc, setSortAsc] = useState(false); // true: Eskiden Yeniye, false: Yeniden Eskiye

    const handleFilterToggle = (key) => {
        setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Tüm verileri tek bir dizide birleştirip türe göre etiketleme
    const masterTimeline = useMemo(() => {
        const combined = [];

        if (filters.checkins) {
            checkins.forEach(item => combined.push({ ...item, dataType: 'checkins', icon: <MapPin size={20} className="text-emerald-400" />, color: 'border-emerald-800 bg-emerald-900/20' }));
        }
        if (filters.messages) {
            messages.forEach(item => combined.push({ ...item, dataType: 'messages', icon: <MessageSquare size={20} className="text-blue-400" />, color: 'border-blue-800 bg-blue-900/20' }));
        }
        if (filters.sightings) {
            sightings.forEach(item => combined.push({ ...item, dataType: 'sightings', icon: <Eye size={20} className="text-orange-400" />, color: 'border-orange-800 bg-orange-900/20' }));
        }
        if (filters.personalNotes) {
            personalNotes.forEach(item => combined.push({ ...item, dataType: 'personalNotes', icon: <FileText size={20} className="text-cyan-400" />, color: 'border-cyan-800 bg-cyan-900/20' }));
        }
        if (filters.anonymousTips) {
            anonymousTips.forEach(item => combined.push({ ...item, dataType: 'anonymousTips', icon: <AlertOctagon size={20} className="text-red-400" />, color: 'border-red-800 bg-red-900/20' }));
        }

        // Zamana göre sıralama işlemi
        return combined.sort((a, b) => {
            // _rawObjDate 0 ise bozuk veridir, en sona atsın vs mantığı uygulanabilir.
            return sortAsc ? a._rawObjDate - b._rawObjDate : b._rawObjDate - a._rawObjDate;
        });

    }, [checkins, messages, sightings, personalNotes, anonymousTips, filters, sortAsc]);

    // Her tipe özel tasarım formatlayıcısı
    const renderContent = (item) => {
        switch (item.dataType) {
            case 'checkins':
                return (
                    <p className="text-gray-300">
                        <strong className="text-emerald-300">{item.fullname || item.name}</strong> arrived at
                        <span className="text-emerald-100 font-mono ml-1">{item.coordinates || item.location}</span>.
                    </p>
                );
            case 'messages':
                return (
                    <div className="bg-gray-950/50 p-4 border border-blue-900/50 rounded-lg mt-2 relative">
                        <p className="text-blue-200 text-sm mb-1">{item.from} <span className="text-gray-500">to</span> {item.to}</p>
                        <p className="text-gray-300 italic">"{item.message}"</p>
                    </div>
                );
            case 'sightings':
                return (
                    <p className="text-gray-300">
                        Witness <strong className="text-gray-400">{item.witnessname || item.witness}</strong> claims to have seen
                        <strong className="text-orange-300 ml-1">{item.suspectname || item.suspect}</strong> together with
                        <strong className="text-orange-300 mx-1">{item.withwhom}</strong> at <span className="text-gray-400">{item.location}</span>.
                    </p>
                );
            case 'personalNotes':
                return (
                    <div className="mt-2 border-l-2 border-cyan-700 pl-4 py-1">
                        <p className="text-cyan-200 font-semibold mb-1">{item.fullname || item.author}'s Note</p>
                        <p className="text-gray-400">"{item.note || item.text}"</p>
                    </div>
                );
            case 'anonymousTips':
                return (
                    <div className="mt-2">
                        <p className="text-gray-300">Tip about: <strong className="text-red-300">{item.suspectname || item.suspect}</strong></p>
                        <p className="text-gray-400 italic mt-1">"{item.tiptext || item.message}"</p>
                        {item.confidence && (
                            <span className="inline-block mt-2 text-xs px-2 py-1 bg-red-950 text-red-500 border border-red-900 rounded">
                                Confidence Score: {item.confidence}/10
                            </span>
                        )}
                    </div>
                );
            default:
                return <p className="text-gray-500">Unknown Data Format</p>;
        }
    };

    return (
        <div className="p-8 pb-32 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">{t('app.timeline')}</h1>
                    <p className="text-gray-500 mt-2">All events arranged chronologically to trace Podo.</p>
                </div>

                {/* Toggle Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter size={16} className="text-gray-500 mr-2" />

                    {Object.keys(filters).map((key) => (
                        <button
                            key={key}
                            onClick={() => handleFilterToggle(key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${filters[key]
                                    ? 'bg-blue-600 outline-none text-white shadow-lg shadow-blue-900/20'
                                    : 'bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-gray-300'
                                }`}
                        >
                            {key}
                        </button>
                    ))}

                    <button
                        onClick={() => setSortAsc(!sortAsc)}
                        className="flex items-center gap-1 ml-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition"
                        title="Sort by Date"
                    >
                        {sortAsc ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        {sortAsc ? 'Oldest First' : 'Newest First'}
                    </button>
                </div>
            </div>

            {/* Timeline Alanı */}
            <div className="relative border-l border-gray-700 ml-3 md:ml-6 space-y-10">
                {masterTimeline.length > 0 ? (
                    masterTimeline.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="relative pl-8 md:pl-12">

                            {/* Timeline Cember İkonu */}
                            <div className="absolute -left-5 bg-gray-950 border border-gray-700 rounded-full p-2 flex items-center justify-center shadow-lg">
                                {item.icon}
                            </div>

                            {/* İçerik Kartı */}
                            <div className={`p-5 rounded-xl border ${item.color} shadow-md`}>
                                <span className="text-sm font-mono text-gray-500 mb-2 block">
                                    {item._rawObjDate > 0 ? format(item._rawObjDate, 'dd MMM yyyy, HH:mm:ss') : 'Unknown Time'}
                                </span>
                                {renderContent(item)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="pl-8 text-gray-500 italic">No events found matching your filters.</div>
                )}
            </div>

        </div>
    );
};

export default Timeline;
