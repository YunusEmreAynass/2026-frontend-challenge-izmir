import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllData } from '../store/slices/dataSlice';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';
import { MapPin, Search, Filter } from 'lucide-react';

// Fix for Leaflet marker icons in Vite/Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Icon for Sightings to differentiate from Checkins
const sightingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapView = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { checkins, sightings, isLoading, error } = useSelector((state) => state.data);

  const [showCheckins, setShowCheckins] = useState(true);
  const [showSightings, setShowSightings] = useState(true);

  // Fetch data if not already loaded
  useEffect(() => {
    if (checkins.length === 0 && sightings.length === 0 && !isLoading && !error) {
      dispatch(fetchAllData());
    }
  }, [dispatch, checkins, sightings, isLoading, error]);

  // Utility to safely parse coordinate strings into [lat, lng]
  const parseCoordinates = (coordStr) => {
    if (!coordStr) return null;
    // Attempt to split by comma
    const parts = coordStr.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    return null;
  };

  // Build Marker Data
  const mapMarkers = useMemo(() => {
    const markers = [];

    if (showCheckins) {
      checkins.forEach((c) => {
        const coords = parseCoordinates(c.coordinates || c.locationCoordinates || c.gps);
        if (coords) {
          markers.push({
            id: c.id || `checkin-${Math.random()}`,
            position: coords,
            type: 'checkin',
            name: c.fullname || c.name || c.person || 'Unknown',
            locationText: c.location || 'Unknown Location',
            date: c._rawObjDate,
            color: 'emerald',
            icon: new L.Icon.Default()
          });
        }
      });
    }

    if (showSightings) {
      sightings.forEach((s) => {
        const coords = parseCoordinates(s.coordinates || s.locationCoordinates || s.gps);
        if (coords) {
          markers.push({
            id: s.id || `sighting-${Math.random()}`,
            position: coords,
            type: 'sighting',
            name: s.suspectname || s.suspect || s.personname || 'Unknown Suspect',
            witness: s.witnessname || s.witness || 'Unknown Witness',
            locationText: s.location || 'Unknown Location',
            date: s._rawObjDate,
            color: 'orange',
            icon: sightingIcon
          });
        }
      });
    }

    // Sort by date so we render oldest to newest (or vice versa for popup layering)
    return markers.sort((a, b) => (b.date || 0) - (a.date || 0));
  }, [checkins, sightings, showCheckins, showSightings]);

  // Izmir default center (adjust as needed if data is somewhere else)
  const defaultCenter = [38.4237, 27.1428];
  
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <p>{t('loading', 'Loading map data...')}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wider flex items-center">
            <MapPin className="mr-3 text-sky-400" size={32} />
            {t('map_view', 'Map View')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('map_description', 'Geospatial tracking of check-ins and sightings.')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2 rounded-lg">
          <Filter size={18} className="text-slate-400 ml-2" />
          <label className="flex items-center space-x-2 cursor-pointer text-sm text-slate-300 hover:text-white px-2">
            <input 
              type="checkbox" 
              checked={showCheckins} 
              onChange={() => setShowCheckins(!showCheckins)} 
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-2"></span>Check-ins</span>
          </label>
          <div className="w-px h-4 bg-slate-700 mx-2"></div>
          <label className="flex items-center space-x-2 cursor-pointer text-sm text-slate-300 hover:text-white pr-2">
            <input 
              type="checkbox" 
              checked={showSightings} 
              onChange={() => setShowSightings(!showSightings)} 
              className="rounded bg-slate-800 border-slate-700 text-orange-500 focus:ring-orange-500"
            />
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block mr-2"></span>Sightings</span>
          </label>
        </div>
      </div>

      {/* Map Container */}
      <div 
        className="flex-grow bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-lg min-h-[600px]"
        style={{ height: '600px', width: '100%' }}
      >
        <MapContainer 
          center={defaultCenter} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          
          {mapMarkers.map((marker) => (
            <Marker 
              key={marker.id} 
              position={marker.position}
              icon={marker.icon}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b ${marker.type === 'checkin' ? 'text-blue-600 border-blue-200' : 'text-orange-600 border-orange-200'}`}>
                    {marker.type === 'checkin' ? 'Verified Check-in' : 'Witness Sighting'}
                  </div>
                  
                  <div className="font-semibold text-gray-800 text-base mb-1">
                    {marker.name}
                  </div>
                  
                  {marker.type === 'sighting' && (
                    <div className="text-xs text-gray-500 mb-2">
                      Witnessed by: <span className="font-medium text-gray-700">{marker.witness}</span>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 mb-2">
                    <MapPin size={14} className="inline mr-1 pb-0.5" />
                    {marker.locationText}
                  </div>

                  <div className="text-xs font-mono bg-gray-100 p-1.5 rounded text-gray-600 mt-2">
                    {marker.date ? format(marker.date, "dd MMM yyyy, HH:mm") : 'Unknown Date'}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Global CSS overrides for Map popups */}
        <style dangerouslySetInnerHTML={{__html: `
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          .custom-popup .leaflet-popup-content {
            margin: 12px;
          }
          .map-tiles {
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
          }
        `}} />
      </div>
      
      {/* Stats footer */}
      <div className="flex space-x-6 text-sm text-slate-400">
        <p>Total mapped locations: <strong className="text-white">{mapMarkers.length}</strong></p>
        <p>Coordinates parsed correctly. (Note: missing or invalid coordinates are excluded)</p>
      </div>
    </div>
  );
};

export default MapView;
