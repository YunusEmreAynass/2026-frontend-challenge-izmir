import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllData } from '../store/slices/dataSlice';
import { normalizeName, normalizeDateObjToTimestamp } from '../utils/normalization';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, MessageSquare, FileText, Eye, AlertTriangle } from 'lucide-react';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const { checkins, messages, sightings, personalNotes, isLoading, error } = useSelector((state) => state.data);

  useEffect(() => {
    // If navigating directly to this page and no data yet, fetch it
    if (checkins.length === 0 && messages.length === 0 && !isLoading && !error) {
      dispatch(fetchAllData());
    }
  }, [dispatch, checkins.length, messages.length, isLoading, error]);

  // Derive all data arrays specific to this person target id
  const targetId = id ? id.toLowerCase() : '';

  const personData = useMemo(() => {
    if (!targetId) return { checkins: [], messages: [], sightings: [], notes: [] };

    return {
      checkins: checkins
        .filter(c => normalizeName(c.fullname || c.name || c.person) === targetId)
        .sort((a, b) => b._rawObjDate - a._rawObjDate),
      messages: messages
        .filter(m => normalizeName(m.from) === targetId || normalizeName(m.to) === targetId)
        .sort((a, b) => b._rawObjDate - a._rawObjDate),
      sightings: sightings
        .filter(s => normalizeName(s.suspectname || s.suspect || s.personname || s.witnessname || s.witness) === targetId)
        .sort((a, b) => b._rawObjDate - a._rawObjDate),
      notes: personalNotes
        .filter(p => normalizeName(p.fullname || p.author || p.name) === targetId)
        .sort((a, b) => b._rawObjDate - a._rawObjDate),
    };
  }, [targetId, checkins, messages, sightings, personalNotes]);

  // Automatically find their original capitalized name for UI title
  const displayName = 
    personData.checkins[0]?.fullname ||
    personData.notes[0]?.fullname ||
    personData.messages[0]?.from ||
    targetId.toUpperCase();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <p>{t('loading', 'Loading data...')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/suspects')}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            title="Back to Suspects"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-wider">{displayName}</h1>
            <p className="text-slate-400 font-mono text-sm mt-1">ID: {targetId}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">{t('personal_notes', 'Personal Notes')}</p>
            <p className="text-2xl font-bold text-white">{personData.notes.length}</p>
          </div>
          <FileText className="text-indigo-400" size={32} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">{t('gps_checkins', 'GPS Check-ins')}</p>
            <p className="text-2xl font-bold text-white">{personData.checkins.length}</p>
          </div>
          <MapPin className="text-emerald-400" size={32} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">{t('messages', 'Messages')}</p>
            <p className="text-2xl font-bold text-white">{personData.messages.length}</p>
          </div>
          <MessageSquare className="text-sky-400" size={32} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">{t('sightings', 'Sightings in Area')}</p>
            <p className="text-2xl font-bold text-white">{personData.sightings.length}</p>
          </div>
          <Eye className="text-amber-400" size={32} />
        </div>
      </div>

      {/* Contradiction Analysis: Statements vs GPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        
        {/* Left Column: Statements (Notes) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6 border-b border-slate-800 pb-2">
            <FileText className="text-indigo-400" size={20} />
            <h2 className="text-xl font-semibold text-white">{t('subject_statements', 'Subject Statements (Notes)')}</h2>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {personData.notes.length === 0 ? (
              <p className="text-slate-500 italic">{t('no_statements_found', 'No statements recorded.')}</p>
            ) : (
              personData.notes.map((note) => (
                <div key={note.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs font-mono text-indigo-400 mb-2">
                    {note._rawObjDate ? format(note._rawObjDate, "dd MMM yyyy, HH:mm") : 'Unknown Date'}
                  </div>
                  <p className="text-slate-300">"{note.notes || note.note}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Actual GPS Check-ins */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative">
          <div className="flex items-center space-x-2 mb-6 border-b border-slate-800 pb-2">
            <MapPin className="text-emerald-400" size={20} />
            <h2 className="text-xl font-semibold text-white">{t('actual_gps_data', 'Actual GPS Data')}</h2>
            
            {/* Contradiction Marker Tip */}
            <div className="ml-auto flex items-center space-x-1 text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md">
              <AlertTriangle size={14} />
              <span>{t('compare_for_mismatches', 'Compare for Mismatches')}</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {personData.checkins.length === 0 ? (
              <p className="text-slate-500 italic">{t('no_gps_data_found', 'No GPS data found.')}</p>
            ) : (
              personData.checkins.map((checkin) => (
                <div key={checkin.id} className="bg-slate-800/50 rounded-lg p-4 border-l-4 border-l-emerald-500 border border-slate-700/50">
                  <div className="text-xs font-mono text-emerald-400 mb-1">
                    {checkin._rawObjDate ? format(checkin._rawObjDate, "dd MMM yyyy, HH:mm") : 'Unknown Date'}
                  </div>
                  <p className="text-white font-medium">{checkin.location}</p>
                  <p className="text-slate-400 text-sm mt-1 break-words">{checkin.coordinates}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Message Traffic */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-6">
        <div className="flex items-center space-x-2 mb-6 border-b border-slate-800 pb-2">
          <MessageSquare className="text-sky-400" size={20} />
          <h2 className="text-xl font-semibold text-white">{t('message_traffic', 'Message Traffic')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
          {personData.messages.length === 0 ? (
            <p className="text-slate-500 italic">{t('no_messages_found', 'No communication intercepted.')}</p>
          ) : (
            personData.messages.map((msg) => {
              const isIncoming = normalizeName(msg.to) === targetId;
              
              return (
                <div 
                  key={msg.id} 
                  className={`rounded-lg p-4 border ${isIncoming ? 'bg-slate-800/30 border-slate-700/50' : 'bg-sky-900/10 border-sky-900/30'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-sky-400">
                      {msg._rawObjDate ? format(msg._rawObjDate, "dd MMM yyyy, HH:mm") : 'Unknown Date'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isIncoming ? 'bg-slate-800 text-slate-300' : 'bg-sky-500/20 text-sky-300'}`}>
                      {isIncoming ? 'INCOMING' : 'OUTGOING'}
                    </span>
                  </div>
                  <div className="mb-2 text-sm text-slate-400">
                    <span className="text-white">{isIncoming ? 'From: ' : 'To: '}</span>
                    {isIncoming ? msg.from : msg.to}
                  </div>
                  <p className="text-slate-200 mt-2 p-3 bg-slate-950/50 rounded-md border border-slate-800/80">"{msg.message}"</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;
