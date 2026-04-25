import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Search, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { normalizeName } from '../utils/normalization';
import { useNavigate } from 'react-router-dom';

const Suspects = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { checkins, messages, sightings, personalNotes, anonymousTips } = useSelector((state) => state.data);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('all'); // all, high, medium, low

    // Şüphelileri 5 farklı kaynaktan çıkarıp tekil bir objede birleştirme
    const suspectsData = useMemo(() => {
        const suspectMap = {};

        const addPerson = (rawName, timestamp, status = 'Suspect', riskWeight = 1) => {
            if (!rawName) return;
            const normalized = normalizeName(rawName);
            if (normalized === 'unknown') return;

            if (!suspectMap[normalized]) {
                suspectMap[normalized] = {
                    id: normalized,
                    originalNames: new Set(),
                    status: status, // İlk eklenen statü. Tanık ise ve sonradan 'şüpheli' olarak eklenirse güncellenir.
                    riskScore: 0,
                    lastSeenDate: 0,
                    mentionsCount: 0,
                };
            }

            const person = suspectMap[normalized];
            person.originalNames.add(rawName);
            person.mentionsCount += 1;
            person.riskScore += riskWeight;

            // Eğer kişi daha önce "Witness" (Tanık) olarak eklenip şimdi "Suspect" (Şüpheli) olarak geçiyorsa durumunu güncelle
            if (status === 'Suspect' && person.status !== 'Suspect') {
                person.status = 'Suspect';
            }

            if (timestamp > person.lastSeenDate) {
                person.lastSeenDate = timestamp;
            }
        };

        // 1. Checkins: Check-in yapan kişileri şüpheli sayabiliriz
        checkins.forEach((c) => addPerson(c.fullname || c.name || c.person, c._rawObjDate, 'Suspect', 2));

        // 2. Messages: Mesajı atan ve alan kişiler
        messages.forEach((m) => {
            addPerson(m.from, m._rawObjDate, 'Suspect', 1);
            addPerson(m.to, m._rawObjDate, 'Suspect', 1);
        });

        // 3. Sightings: Görgü tanığı (Witness) ve Görülen Şüpheli (SuspectName)
        sightings.forEach((s) => {
            addPerson(s.suspectname || s.suspect || s.personname, s._rawObjDate, 'Suspect', 4);
            addPerson(s.witnessname || s.witness, s._rawObjDate, 'Witness', 0); // Tanıkların risk skoru artmaz
        });

        // 4. Personal Notes: Notu yazan (Author / Fullname)
        personalNotes.forEach((p) => {
            addPerson(p.fullname || p.author || p.name, p._rawObjDate, 'Suspect', 1);
        });

        // 5. Anonymous Tips: İhbarda geçen kişi (Confidence yani güven skoru varsa onu risk'e ekle)
        anonymousTips.forEach((a) => {
            const tipRisk = a.confidence ? parseInt(a.confidence, 10) : 3;
            addPerson(a.suspectname || a.suspect || a.name, a._rawObjDate, 'Suspect', tipRisk);
        });

        // Objeyi Diziye çevir ve Set içindeki isimleri Join'le
        return Object.values(suspectMap)
            .map((person) => ({
                ...person,
                displayName: Array.from(person.originalNames)[0], // En çok kullanılan ismini veya ilk ismini al
                aliases: Array.from(person.originalNames).join(', '),
            }))
            .sort((a, b) => b.riskScore - a.riskScore); // Risk skoruna göre Büyükten Küçüğe sırala
    }, [checkins, messages, sightings, personalNotes, anonymousTips]);

    // Risk Skoru Hesaplama Renkleri
    const getRiskBadge = (score, status) => {
        if (status === 'Witness') return <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-semibold flex items-center gap-1 w-max"><ShieldCheck size={14} /> Witness</span>;
        if (score >= 10) return <span className="px-3 py-1 bg-red-900/50 text-red-400 border border-red-800 rounded-full text-xs font-semibold flex items-center gap-1 w-max"><AlertTriangle size={14} /> High Risk ({score})</span>;
        if (score >= 5) return <span className="px-3 py-1 bg-orange-900/50 text-orange-400 border border-orange-800 rounded-full text-xs font-semibold flex items-center gap-1 w-max"><HelpCircle size={14} /> Medium Risk ({score})</span>;
        return <span className="px-3 py-1 bg-blue-900/50 text-blue-400 border border-blue-800 rounded-full text-xs font-semibold flex items-center gap-1 w-max">Low Risk ({score})</span>;
    };

    // Filtreleme İşlemleri
    const filteredSuspects = suspectsData.filter((person) => {
        const matchesSearch = person.aliases.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesLevel = true;
        if (filterLevel === 'high') matchesLevel = person.riskScore >= 10 && person.status === 'Suspect';
        if (filterLevel === 'medium') matchesLevel = (person.riskScore >= 5 && person.riskScore < 10) && person.status === 'Suspect';
        if (filterLevel === 'low') matchesLevel = person.riskScore < 5 && person.status === 'Suspect';
        if (filterLevel === 'witness') matchesLevel = person.status === 'Witness';

        return matchesSearch && matchesLevel;
    });

    return (
        <div className="p-8 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-100">{t('app.suspects')}</h1>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search suspects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-white rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500 text-sm w-full md:w-64"
                        />
                    </div>

                    <select
                        className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:border-blue-500 text-sm"
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                    >
                        <option value="all">All Targets</option>
                        <option value="high">High Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="low">Low Risk</option>
                        <option value="witness">Witnesses</option>
                    </select>
                </div>
            </div>

            {/* Tablo Yapısı */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-950/50 text-gray-400 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Name (Aliases)</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Mentions</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Last Seen</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Risk Level</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-gray-300">
                            {filteredSuspects.length > 0 ? (
                                filteredSuspects.map((person) => (
                                    <tr key={person.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-100">{person.displayName}</div>
                                            <div className="text-gray-500 text-xs mt-1 max-w-[250px] truncate" title={person.aliases}>
                                                Also known as: {person.aliases}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-800 text-gray-300 py-1 px-2 rounded font-mono">
                                                {person.mentionsCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {person.lastSeenDate > 0 ? format(person.lastSeenDate, 'dd MMM yyyy, HH:mm') : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRiskBadge(person.riskScore, person.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/suspects/${person.id}`)}
                                                className="text-blue-400 hover:text-blue-300 font-medium text-sm transition"
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No matching suspects found based on your filters or data criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Suspects;
