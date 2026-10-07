import { useState, useEffect } from 'react';
import {
  MapPin,
  Shield,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Navigation,
  Home,
  Building2,
  Loader2,
  Star
} from 'lucide-react';
import api from '../../api/axios';

const LocationCertification = ({ driver, onCertificationUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [certificationData, setCertificationData] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [isCertifying, setIsCertifying] = useState(false);

  const certificationLevels = {
    gold: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', icon: Award },
    silver: { color: 'text-slate-300', bg: 'bg-slate-400/10', border: 'border-slate-400/30', icon: Star },
    bronze: { color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30', icon: Shield }
  };

  useEffect(() => {
    loadCertificationData();
  }, [driver?.id]);

  const loadCertificationData = async () => {
    if (!driver?.id) return;
    
    try {
      setLoading(true);
      const [certRes, historyRes, areasRes] = await Promise.all([
        api.get(`/admin/drivers/${driver.id}/location-certification`),
        api.get(`/admin/drivers/${driver.id}/location-history`),
        api.get('/admin/service-areas')
      ]);

      if (certRes.data.success) {
        setCertificationData(certRes.data.certification);
      }
      if (historyRes.data.success) {
        setLocationHistory(historyRes.data.location_history || []);
      }
      if (areasRes.data.success) {
        setServiceAreas(areasRes.data.service_areas || []);
      }
    } catch (err) {
      console.error('Failed to load certification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const runLocationCertification = async () => {
    setIsCertifying(true);
    try {
      const response = await api.post(`/admin/drivers/${driver.id}/location-certification`, {
        address: driver.residence_address,
        coordinates: driver.home_coordinates
      });

      if (response.data.success) {
        setCertificationData(response.data.certification);
        if (onCertificationUpdate) {
          onCertificationUpdate(response.data.certification);
        }
      }
    } catch (err) {
      console.error('Failed to certify location:', err);
    } finally {
      setIsCertifying(false);
    }
  };

  const getRiskColor = (score) => {
    if (score <= 20) return 'text-brandMint';
    if (score <= 40) return 'text-brandMint';
    if (score <= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getRiskBackground = (score) => {
    if (score <= 20) return 'bg-brandMint/10 border-brandMint/30';
    if (score <= 40) return 'bg-brandMint/10 border-brandMint/30';
    if (score <= 60) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <Loader2 className="w-8 h-8 text-brandMint animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading location certification data...</p>
      </div>
    );
  }

  const level = certificationLevels[certificationData?.certification_level] || certificationLevels.bronze;
  const LevelIcon = level.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brandMint/10 rounded-xl">
              <MapPin className="text-brandMint" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Location-Based Driver Certification</h3>
              <p className="text-sm text-slate-400">Geographic verification and service area analysis</p>
            </div>
          </div>
          <button
            onClick={runLocationCertification}
            disabled={isCertifying}
            className="px-4 py-2 bg-brandMint text-corporateNavy text-sm font-bold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isCertifying ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
            Run Certification
          </button>
        </div>

        {/* Certification Level Badge */}
        {certificationData && (
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${level.bg} ${level.border}`}>
            <LevelIcon className={level.color} size={32} />
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase">Certification Level</p>
              <p className={`text-2xl font-black ${level.color} uppercase`}>
                {certificationData.certification_level}
              </p>
            </div>
            <div className="flex-1" />
            <div className="text-right">
              <p className="text-xs font-mono text-slate-500 uppercase">Service Area Coverage</p>
              <p className="text-xl font-bold text-white">{certificationData.service_area_coverage}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Location Verification Metrics */}
      {certificationData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Home className="text-brandMint" size={18} />
              <span className="text-xs font-mono text-slate-500 uppercase">Address Verified</span>
            </div>
            <p className={`text-lg font-bold ${certificationData.address_verified ? 'text-brandMint' : 'text-red-400'}`}>
              {certificationData.address_verified ? 'VERIFIED' : 'NOT VERIFIED'}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="text-brandMint" size={18} />
              <span className="text-xs font-mono text-slate-500 uppercase">Geo Match</span>
            </div>
            <p className={`text-lg font-bold ${certificationData.geo_match ? 'text-brandMint' : 'text-amber-400'}`}>
              {certificationData.geo_match ? 'CONFIRMED' : 'PENDING'}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="text-brandMint" size={18} />
              <span className="text-xs font-mono text-slate-500 uppercase">Residence Stability</span>
            </div>
            <p className="text-lg font-bold text-white capitalize">
              {certificationData.residence_stability || 'Unknown'}
            </p>
          </div>
          <div className={`bg-slate-900 border rounded-xl p-4 ${getRiskBackground(certificationData.location_risk_score)}`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={getRiskColor(certificationData.location_risk_score)} size={18} />
              <span className="text-xs font-mono text-slate-500 uppercase">Location Risk</span>
            </div>
            <p className={`text-lg font-bold ${getRiskColor(certificationData.location_risk_score)}`}>
              {certificationData.location_risk_score}/100
            </p>
          </div>
        </div>
      )}

      {/* Service Area Coverage */}
      {certificationData && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MapPin size={20} /> Service Area Coverage
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-400">Primary Service Area</span>
                <span className="font-bold text-white">{certificationData.service_area_coverage}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div
                  className="bg-brandMint h-3 rounded-full transition-all"
                  style={{ width: `${certificationData.service_area_coverage}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-950 rounded-xl p-4">
                <p className="text-xs font-mono text-slate-500 uppercase mb-1">Coverage Radius</p>
                <p className="font-bold text-white">{certificationData.coverage_radius || 'N/A'} km</p>
              </div>
              <div className="bg-slate-950 rounded-xl p-4">
                <p className="text-xs font-mono text-slate-500 uppercase mb-1">Active Zones</p>
                <p className="font-bold text-white">{certificationData.active_zones || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location History */}
      {locationHistory.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={20} /> Recent Location Activity
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {locationHistory.slice(0, 10).map((location, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-slate-950 rounded-xl">
                <div className={`w-2 h-2 rounded-full ${
                  location.activity === 'active' ? 'bg-brandMint' :
                  location.activity === 'transit' ? 'bg-blue-400' :
                  'bg-slate-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {location.activity ? String(location.activity).charAt(0).toUpperCase() + String(location.activity).slice(1) : 'Unknown'}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {new Date(location.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {certificationData?.recommendations && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> AI Recommendations
          </h4>
          <div className="space-y-3">
            {certificationData.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-xl ${
                  rec.type === 'positive' ? 'bg-brandMint/10 border border-brandMint/30' :
                  rec.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
                  'bg-red-500/10 border border-red-500/30'
                }`}
              >
                {rec.type === 'positive' && <CheckCircle className="text-brandMint shrink-0" size={20} />}
                {rec.type === 'warning' && <AlertTriangle className="text-amber-400 shrink-0" size={20} />}
                {rec.type === 'negative' && <AlertTriangle className="text-red-400 shrink-0" size={20} />}
                <div>
                  <p className="font-bold text-white">{rec.title}</p>
                  <p className="text-sm text-slate-400 mt-1">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationCertification;
