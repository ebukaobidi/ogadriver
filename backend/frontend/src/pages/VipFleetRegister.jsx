import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Award, ShieldCheck, Car, User, Mail, Phone, Lock, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';

export default function VipFleetRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    company_name: '',
    vehicle_category: 'Luxury Executive SUV',
    armor_level: 'None (Standard Luxury)',
    vehicle_make: '',
    license_plate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/corporate/vip-register', formData);
      if (res.data?.success || res.data?.token) {
        if (res.data?.token) {
          localStorage.setItem('auth_token', res.data.token);
        }
        if (res.data?.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        setSuccessMsg('VIP Fleet Operative account registered successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/driver';
        }, 1500);
      } else {
        setError(res.data?.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'VIP Fleet registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[140px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brandMint/10 blur-[120px] mix-blend-screen" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Award className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-white">
          VIP Fleet <span className="text-amber-400">Partner Registration</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400 font-mono">
          Register your Executive Armored Fleet, VVIP Escort Vehicle or Tactical Security Convoy
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 border border-amber-500/30 rounded-3xl shadow-2xl space-y-6">

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3 text-red-300 text-xs">
              <Activity className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-brandMint/10 border border-brandMint/40 rounded-2xl p-4 flex items-center gap-3 text-brandMint text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name / Lead Operative *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Captain Alex Vance"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Company/Fleet Name (Optional for Individuals)
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="e.g. VIP Fleet Ltd (Leave blank if individual)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Official Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vip@yourcompany.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08012345678"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-3 flex items-center gap-1.5">
                <Car className="w-4 h-4" /> Armored Vehicle & Fleet Specs
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Vehicle Category
                  </label>
                  <select
                    name="vehicle_category"
                    value={formData.vehicle_category}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Luxury Executive SUV">Luxury Executive SUV (e.g. Prado, G-Wagon)</option>
                      <option value="Luxury Executive Sedan">Luxury Executive Sedan (e.g. S-Class, 7-Series)</option>
                      <option value="Armored B6+ Tactical SUV">Armored B6+ Tactical SUV</option>
                    <option value="Presidential Executive Sedan">Presidential Executive Sedan (Maybach S680)</option>
                    <option value="Executive Range Rover Autobiography">Executive Range Rover Autobiography</option>
                    <option value="VIP Motorcade Convoy Detail">VIP Motorcade Convoy Detail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Armor Rating / Protection
                  </label>
                  <select
                    name="armor_level"
                    value={formData.armor_level}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="None \(Standard Luxury\)">None (Standard Luxury)</option>
                      <option value="B6+ Ballistic">B6+ Ballistic (High Rifle Resistance)</option>
                    <option value="B7 Heavy Tactical Armor">B7 Heavy Tactical Armor</option>
                    <option value="VR7 Executive Protection">VR7 Executive Protection</option>
                    <option value="Ultra Luxury Non-Armored">Ultra Luxury Non-Armored</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Vehicle Make & Model
                  </label>
                  <input
                    type="text"
                    name="vehicle_make"
                    value={formData.vehicle_make}
                    onChange={handleChange}
                    placeholder="e.g. 2024 Toyota Land Cruiser 300 V6"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    License Plate / Fleet ID
                  </label>
                  <input
                    type="text"
                    name="license_plate"
                    value={formData.license_plate}
                    onChange={handleChange}
                    placeholder="e.g. OGD-VIP-99"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Account Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Registering VIP Partner...' : 'Register VIP Fleet Partner'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-500">
              Already a VIP Fleet partner?{' '}
              <Link to="/login" className="text-amber-400 font-bold hover:underline">
                Log in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
