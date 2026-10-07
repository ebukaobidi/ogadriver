import React, { useState, useEffect } from 'react';
import { Gamepad2, Heart, Trophy, Timer, Play, RotateCcw, AlertTriangle, Minus, ArrowUpRight, User, RefreshCw, X, Shield, Eye, MapPin, Navigation, Zap, Ambulance, Truck, Car, Wrench, ZapOff, Dog, Wind, Cloud, Moon, Award, Target, Medal, Star, TrendingUp, BarChart3, Settings, Volume2, VolumeX } from 'lucide-react';
import api from '../api/axios';

const SCENARIOS = [
  // SIGNS
  {
    id: 'stop', category: 'sign', shape: 'octagon',
    render: () => (
      <div className="w-32 h-32 bg-red-600 border-4 border-white flex items-center justify-center shadow-2xl" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}>
        <span className="text-white font-black text-2xl tracking-widest">STOP</span>
      </div>
    ),
    correct: 'Come to a complete halt',
    options: ['Slow down and yield', 'Come to a complete halt', 'Stop only if traffic approaches', 'No parking allowed'],
    explanation: 'STOP signs require you to come to a complete halt. Rolling stops are illegal and dangerous. Stop at the stop line or before entering the intersection.'
  },
  {
    id: 'yield', category: 'sign', shape: 'triangle',
    render: () => (
      <div className="w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-t-[104px] border-t-red-600 relative filter drop-shadow-2xl">
         <div className="absolute -top-[95px] -left-[45px] w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-t-[75px] border-t-white flex items-center justify-center">
            <span className="absolute -top-[60px] -left-[20px] text-red-600 font-bold text-xs uppercase tracking-widest">Yield</span>
         </div>
      </div>
    ),
    correct: 'Slow down and give way to traffic',
    options: ['Stop completely', 'Merging traffic ahead', 'Slow down and give way to traffic', 'Pedestrian crossing'],
    explanation: 'Yield signs require you to slow down and give right of way to traffic on the intersecting road. Proceed only when the way is clear and safe.'
  },
  {
    id: 'speed_50', category: 'sign', shape: 'circle',
    render: () => (
      <div className="w-32 h-32 bg-white rounded-full border-[12px] border-red-600 flex items-center justify-center shadow-2xl">
        <span className="text-black font-black text-4xl">50</span>
      </div>
    ),
    correct: 'Maximum speed limit is 50 km/h',
    options: ['Minimum speed limit is 50 km/h', 'Maximum speed limit is 50 km/h', 'Distance to next city is 50 km', 'Route 50 ahead'],
    explanation: 'This is a maximum speed limit sign. You must not exceed 50 km/h. In Nigeria, urban areas typically have 50 km/h limits. Exceeding limits is dangerous and attracts fines.'
  },
  {
    id: 'speed_80', category: 'sign', shape: 'circle',
    render: () => (
      <div className="w-32 h-32 bg-white rounded-full border-[12px] border-red-600 flex items-center justify-center shadow-2xl">
        <span className="text-black font-black text-4xl">80</span>
      </div>
    ),
    correct: 'Maximum speed limit is 80 km/h',
    options: ['Minimum speed limit is 80 km/h', 'Maximum speed limit is 80 km/h', 'Recommended speed is 80 km/h', 'Distance to destination is 80 km'],
    explanation: 'This is a maximum speed limit sign. You must not exceed 80 km/h. This limit is common on highways and expressways in Nigeria. Always adjust speed for road conditions.'
  },
  {
    id: 'no_entry', category: 'sign', shape: 'circle',
    render: () => (
      <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
        <div className="w-20 h-4 bg-white"></div>
      </div>
    ),
    correct: 'No entry for vehicular traffic',
    options: ['One way traffic', 'Stop ahead', 'Road closed for construction', 'No entry for vehicular traffic'],
    explanation: 'No entry signs prohibit all vehicles from entering. Entering against this sign is illegal and dangerous. Find an alternative route or turn around safely.'
  },
  {
    id: 'pedestrian', category: 'sign', shape: 'square',
    render: () => (
      <div className="w-32 h-32 bg-blue-600 rounded-lg border-4 border-white flex flex-col items-center justify-center shadow-2xl">
        <div className="w-24 h-24 bg-white flex items-center justify-center relative" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
           <User size={48} className="text-black mb-4" />
           <div className="absolute bottom-2 flex gap-1">
             <div className="w-3 h-1 bg-black"></div><div className="w-3 h-1 bg-black"></div><div className="w-3 h-1 bg-black"></div>
           </div>
        </div>
      </div>
    ),
    correct: 'Pedestrian crossing',
    options: ['Pedestrian crossing', 'School zone ahead', 'Children playing', 'Hospital nearby'],
    explanation: 'Pedestrian crossing signs indicate areas where pedestrians frequently cross. Slow down and be prepared to stop. Pedestrians always have right of way at marked crossings.'
  },
  {
    id: 'no_uturn', category: 'sign', shape: 'circle',
    render: () => (
      <div className="w-32 h-32 bg-white rounded-full border-[10px] border-red-600 flex items-center justify-center relative shadow-2xl overflow-hidden">
        <div className="w-12 h-14 border-4 border-b-0 border-black rounded-t-full relative mt-4">
           <div className="absolute -left-3 bottom-0 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-black"></div>
        </div>
        <div className="absolute w-36 h-2 bg-red-600 -rotate-45"></div>
      </div>
    ),
    correct: 'No U-turn allowed',
    options: ['No right turn allowed', 'No U-turn allowed', 'Roundabout ahead', 'Sharp curve ahead'],
    explanation: 'No U-turn signs prohibit making U-turns at that location. U-turns in these areas are dangerous due to traffic flow or visibility issues. Continue to a safe turning point.'
  },
  {
    id: 'roundabout', category: 'sign', shape: 'circle',
    render: () => (
      <div className="w-32 h-32 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow-2xl">
        <RefreshCw size={56} className="text-white" />
      </div>
    ),
    correct: 'Roundabout ahead',
    options: ['Roundabout ahead', 'U-turn permitted', 'Circular intersection', 'Dead end'],
    explanation: 'Roundabout signs indicate a circular intersection ahead. Yield to traffic already in the roundabout (on your left in Nigeria). Move clockwise and exit at your desired point.'
  },
  {
    id: 'warning', category: 'sign', shape: 'triangle_up',
    render: () => (
      <div className="w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[104px] border-b-red-600 relative drop-shadow-2xl">
         <div className="absolute top-[8px] -left-[45px] w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[75px] border-b-white flex items-center justify-center">
            <AlertTriangle size={32} className="absolute top-[30px] -left-[16px] text-black" />
         </div>
      </div>
    ),
    correct: 'General danger or warning ahead',
    options: ['Yield to traffic', 'General danger or warning ahead', 'Road works ahead', 'Traffic signals ahead'],
    explanation: 'General warning signs alert you to potential hazards ahead. Slow down and be prepared for unexpected conditions. Look for additional signs specifying the exact danger.'
  },
  {
    id: 'hospital', category: 'sign', shape: 'square',
    render: () => (
      <div className="w-32 h-32 bg-blue-600 rounded-lg border-4 border-white flex items-center justify-center shadow-2xl">
        <span className="text-white font-black text-6xl">H</span>
      </div>
    ),
    correct: 'Hospital ahead',
    options: ['Helipad ahead', 'Hotel nearby', 'Hospital ahead', 'Highway intersection'],
    explanation: 'Hospital signs indicate medical facilities ahead. Be extra cautious as emergency vehicles may be entering/exiting. No honking zones are usually in effect near hospitals.'
  },
  {
    id: 'no_overtaking', category: 'sign', shape: 'circle',
    render: () => (
      <div className="w-32 h-32 bg-white rounded-full border-[10px] border-red-600 flex items-center justify-center relative shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="w-8 h-2 bg-red-600 rounded mb-1"></div>
          <div className="w-8 h-2 bg-red-600 rounded"></div>
        </div>
        <div className="absolute w-36 h-2 bg-red-600 -rotate-45"></div>
      </div>
    ),
    correct: 'No overtaking allowed',
    options: ['No parking allowed', 'No overtaking allowed', 'Two-way traffic ahead', 'Lane merging ahead']
  },
  {
    id: 'no_parking', category: 'sign', shape: 'circle',
    render: () => (
      <div className="w-32 h-32 bg-blue-600 rounded-full border-[10px] border-white flex items-center justify-center relative shadow-2xl">
        <div className="text-white font-black text-4xl">P</div>
        <div className="absolute w-36 h-2 bg-white -rotate-45"></div>
      </div>
    ),
    correct: 'No parking at any time',
    options: ['Parking available ahead', 'No stopping allowed', 'No parking at any time', 'Pedestrian zone']
  },
  {
    id: 'one_way', category: 'sign', shape: 'rectangle',
    render: () => (
      <div className="w-32 h-24 bg-white rounded-lg border-4 border-black flex items-center justify-center shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-black"></div>
        </div>
      </div>
    ),
    correct: 'One-way street - traffic flows in arrow direction only',
    options: ['Two-way traffic ahead', 'One-way street - traffic flows in arrow direction only', 'Lane merging ahead', 'Road narrows ahead']
  },
  {
    id: 'school_zone', category: 'sign', shape: 'diamond',
    render: () => (
      <div className="w-32 h-32 bg-yellow-400 border-4 border-black flex items-center justify-center shadow-2xl" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
        <div className="flex flex-col items-center">
          <div className="w-12 h-8 bg-black rounded-full mb-1"></div>
          <div className="w-8 h-4 bg-black rounded"></div>
        </div>
      </div>
    ),
    correct: 'School zone - reduce speed and watch for children',
    options: ['Playground ahead', 'School zone - reduce speed and watch for children', 'Pedestrian crossing', 'Children at play']
  },
  {
    id: 'road_works', category: 'sign', shape: 'triangle',
    render: () => (
      <div className="w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[104px] border-b-orange-500 relative drop-shadow-2xl">
         <div className="absolute top-[8px] -left-[45px] w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[75px] border-b-white flex items-center justify-center">
            <div className="absolute top-[25px] -left-[12px] w-6 h-6 border-4 border-black rounded-full flex items-center justify-center">
               <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
         </div>
      </div>
    ),
    correct: 'Road works ahead - slow down and follow traffic control',
    options: ['Construction zone ahead', 'Road works ahead - slow down and follow traffic control', 'Detour required', 'Lane closed ahead']
  },
  {
    id: 'slippery_road', category: 'sign', shape: 'diamond',
    render: () => (
      <div className="w-32 h-32 bg-yellow-400 border-4 border-black flex items-center justify-center shadow-2xl" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
        <div className="relative">
          <div className="w-16 h-8 border-4 border-black rounded-full transform -rotate-12"></div>
          <div className="absolute top-2 left-4 w-2 h-2 bg-black rounded-full"></div>
        </div>
      </div>
    ),
    correct: 'Slippery road surface ahead - reduce speed',
    options: ['Oil on road', 'Slippery road surface ahead - reduce speed', 'Wet road ahead', 'Icy conditions']
  },
  {
    id: 'sharp_curve', category: 'sign', shape: 'diamond',
    render: () => (
      <div className="w-32 h-32 bg-yellow-400 border-4 border-black flex items-center justify-center shadow-2xl" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
        <div className="w-16 h-8 border-4 border-black rounded-full"></div>
      </div>
    ),
    correct: 'Sharp curve ahead - slow down before entering',
    options: ['Road bends ahead', 'Sharp curve ahead - slow down before entering', 'Winding road', 'Hairpin bend']
  },
  {
    id: 'steep_hill', category: 'sign', shape: 'circle',
    render: () => (
      <div className="w-32 h-32 bg-blue-600 rounded-full border-[10px] border-white flex items-center justify-center shadow-2xl">
        <div className="text-white font-black text-3xl">15%</div>
      </div>
    ),
    correct: 'Steep gradient - use lower gear when descending',
    options: ['Speed limit 15 km/h', 'Steep gradient - use lower gear when descending', 'Distance 15 km', 'Height limit 15 feet']
  },
  {
    id: 'railway_crossing', category: 'sign', shape: 'circle',
    render: () => (
      <div className="w-32 h-32 bg-white rounded-full border-[8px] border-black flex items-center justify-center shadow-2xl">
        <div className="relative">
          <div className="w-24 h-2 bg-black mb-1"></div>
          <div className="w-24 h-2 bg-black"></div>
          <div className="absolute top-1 left-1 w-2 h-2 bg-white border-2 border-black"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-white border-2 border-black"></div>
        </div>
      </div>
    ),
    correct: 'Railway crossing ahead - stop and look both ways',
    options: ['Train station ahead', 'Railway crossing ahead - stop and look both ways', 'Level crossing', 'Metro line ahead']
  },
  {
    id: 'traffic_lights', category: 'sign', shape: 'triangle',
    render: () => (
      <div className="w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[104px] border-b-red-600 relative drop-shadow-2xl">
         <div className="absolute top-[8px] -left-[45px] w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[75px] border-b-white flex items-center justify-center">
            <div className="absolute top-[25px] -left-[16px] flex flex-col gap-1">
               <div className="w-4 h-4 rounded-full bg-red-500"></div>
               <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
               <div className="w-4 h-4 rounded-full bg-green-500"></div>
            </div>
         </div>
      </div>
    ),
    correct: 'Traffic lights ahead - prepare to stop if needed',
    options: ['Stop sign ahead', 'Traffic lights ahead - prepare to stop if needed', 'Road junction ahead', 'Police checkpoint']
  },
  {
    id: 'lane_merge', category: 'sign', shape: 'rectangle',
    render: () => (
      <div className="w-32 h-24 bg-white rounded-lg border-4 border-black flex items-center justify-center shadow-2xl">
        <div className="flex gap-2">
          <div className="w-8 h-16 bg-black"></div>
          <div className="w-8 h-16 bg-black transform -skew-x-12 origin-bottom"></div>
        </div>
      </div>
    ),
    correct: 'Lanes merging - alternate and yield to through traffic',
    options: ['Road narrowing', 'Lanes merging - alternate and yield to through traffic', 'Two lanes ahead', 'Lane closure']
  },
  {
    id: 'speed_hump', category: 'sign', shape: 'triangle',
    render: () => (
      <div className="w-0 h-0 border-l-[60px] border-l-transparent border-r-[60px] border-r-transparent border-b-[104px] border-b-blue-600 relative drop-shadow-2xl">
         <div className="absolute top-[8px] -left-[45px] w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[75px] border-b-white flex items-center justify-center">
            <div className="absolute top-[30px] -left-[12px] w-16 h-4 bg-blue-600 rounded-full"></div>
         </div>
      </div>
    ),
    correct: 'Speed hump ahead - slow down to avoid damage',
    options: ['Road bump ahead', 'Speed hump ahead - slow down to avoid damage', 'Uneven road', 'Pothole warning']
  },
  {
    id: 'no_honking', category: 'sign', shape: 'circle',
    render: () => (
      <div className="w-32 h-32 bg-white rounded-full border-[10px] border-red-600 flex items-center justify-center relative shadow-2xl">
        <div className="text-4xl">🔇</div>
        <div className="absolute w-36 h-2 bg-red-600 -rotate-45"></div>
      </div>
    ),
    correct: 'No horn blowing - silence zone (hospital/school area)',
    options: ['No music allowed', 'No horn blowing - silence zone (hospital/school area)', 'No talking', 'Sound limit']
  },
  {
    id: 'bus_lane', category: 'sign', 'shape': 'rectangle',
    render: () => (
      <div className="w-32 h-24 bg-white rounded-lg border-4 border-black flex items-center justify-center shadow-2xl">
        <div className="text-center">
          <div className="text-2xl">🚌</div>
          <div className="text-xs font-black text-black">BUS LANE</div>
        </div>
      </div>
    ),
    correct: 'Bus lane only - other vehicles prohibited during hours',
    options: ['Bus stop ahead', 'Bus lane only - other vehicles prohibited during hours', 'Public transport', 'Taxi stand']
  },

  // SECURITY PROTOCOLS
  {
    id: 'sec_hijack', category: 'security', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-amber-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
         <Shield size={48} className="text-amber-500 mb-2" />
         <span className="text-amber-500 font-bold text-center text-sm px-2">ANTI-HIJACK PROTOCOL</span>
      </div>
    ),
    correct: 'Lock all doors, roll up windows, and leave space to maneuver.',
    options: [
      'Stop the car and confront suspicious individuals.',
      'Lock all doors, roll up windows, and leave space to maneuver.',
      'Drive aggressively to scare them away.',
      'Turn off the engine to save fuel while waiting.'
    ]
  },
  {
    id: 'sec_fake_accident', category: 'security', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-950 border-4 border-red-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
         <AlertTriangle size={48} className="text-red-500 mb-2" />
         <span className="text-red-500 font-bold text-center text-xs px-2">SUSPICIOUS ACCIDENT / ROADBLOCK</span>
      </div>
    ),
    correct: 'Do not stop. Report to authorities while driving to a safe place.',
    options: [
      'Stop immediately to render first aid.',
      'Honk your horn loudly to warn others.',
      'Do not stop. Report to authorities while driving to a safe place.',
      'Roll down the window to ask if they need help.'
    ]
  },
  {
    id: 'sec_tailing', category: 'security', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-purple-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
         <ArrowUpRight size={48} className="text-purple-500 mb-2" />
         <span className="text-purple-500 font-bold text-center text-xs px-2">SUSPECTED TAILING</span>
      </div>
    ),
    correct: 'Make four consecutive right turns or drive to a police station.',
    options: [
      'Make four consecutive right turns or drive to a police station.',
      'Stop the car and confront the driver.',
      'Drive to your home immediately.',
      'Speed up and try to outrun them in residential areas.'
    ]
  },
  {
    id: 'sec_night', category: 'security', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-950 border-4 border-blue-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
         <Eye size={40} className="text-blue-400 mb-2" />
         <span className="text-blue-500 font-bold text-center text-xs px-2">NIGHT DRIVING (ISOLATED)</span>
      </div>
    ),
    correct: 'Stay in center lanes, avoid stopping, and remain highly vigilant.',
    options: [
      'Drive on the edge of the road to allow overtakes.',
      'Stay in center lanes, avoid stopping, and remain highly vigilant.',
      'Turn off your lights to avoid being seen by criminals.',
      'Pick up hitchhikers to have company.'
    ]
  },
  {
    id: 'sec_passenger', category: 'security', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-orange-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.5)]">
         <User size={48} className="text-orange-500 mb-2" />
         <span className="text-orange-500 font-bold text-center text-xs px-2">INQUISITIVE PASSENGER</span>
      </div>
    ),
    correct: 'Keep answers vague and maintain professional boundaries.',
    options: [
      'Share your daily routine and earnings to build trust.',
      'Keep answers vague and maintain professional boundaries.',
      'Ignore them completely and refuse to speak.',
      'Ask them equally personal questions back.'
    ]
  },
  {
    id: 'sec_checkpoint', category: 'security', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-rose-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)]">
         <Minus size={48} className="text-rose-500 mb-2" />
         <span className="text-rose-500 font-bold text-center text-xs px-2">UNOFFICIAL CHECKPOINT</span>
      </div>
    ),
    correct: 'Do not stop in isolated areas; drive to a safe, well-lit location.',
    options: [
      'Stop immediately and open your doors.',
      'Do not stop in isolated areas; drive to a safe, well-lit location.',
      'Speed through aggressively and try to run them over.',
      'Get out of the car to negotiate.'
    ]
  },

  // RULES OF THE ROAD
  {
    id: 'rule_distance', category: 'rule', shape: 'circle',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-brandMint rounded-full flex flex-col items-center justify-center shadow-[0_0_20px_rgba(28,209,136,0.5)]">
         <div className="flex gap-2 mb-2">
            <div className="w-8 h-4 bg-brandMint rounded"></div>
            <div className="w-8 h-4 bg-brandMint rounded opacity-50"></div>
         </div>
         <span className="text-brandMint font-bold text-center text-xs px-2">FOLLOWING DISTANCE</span>
      </div>
    ),
    correct: 'Maintain at least a 3-second gap from the vehicle ahead.',
    options: [
      'Stay as close as possible to prevent cutting in.',
      'Maintain at least a 3-second gap from the vehicle ahead.',
      'Flash headlights constantly to keep them moving.',
      'Overtake immediately regardless of traffic.'
    ]
  },
  {
    id: 'rule_rain', category: 'rule', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-cyan-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
         <div className="flex gap-1 mb-2">
           <div className="w-1 h-3 bg-cyan-400 rotate-12"></div>
           <div className="w-1 h-3 bg-cyan-400 rotate-12 mt-2"></div>
           <div className="w-1 h-3 bg-cyan-400 rotate-12"></div>
         </div>
         <span className="text-cyan-500 font-bold text-center text-xs px-2">HEAVY RAIN / HYDROPLANING</span>
      </div>
    ),
    correct: 'Reduce speed, ease off accelerator, avoid sudden braking.',
    options: [
      'Drive normally, modern tires handle water easily.',
      'Turn on hazard lights and speed up.',
      'Reduce speed, ease off accelerator, avoid sudden braking.',
      'Slam on the brakes if you feel the car sliding.'
    ]
  },
  {
    id: 'rule_pedestrian', category: 'rule', shape: 'circle',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-white rounded-full flex flex-col items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)]">
         <User size={48} className="text-white mb-2" />
         <span className="text-white font-bold text-center text-xs px-2">ZEBRA CROSSING</span>
      </div>
    ),
    correct: 'Pedestrians have the absolute right of way; stop and wait.',
    options: [
      'Honk to make pedestrians cross faster.',
      'Drive around them carefully without stopping.',
      'Pedestrians have the absolute right of way; stop and wait.',
      'Only stop if a traffic warden is present.'
    ]
  },
  {
    id: 'rule_blindspot', category: 'rule', shape: 'circle',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-yellow-400 rounded-full flex flex-col items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.5)]">
         <Eye size={40} className="text-yellow-400 mb-2" />
         <span className="text-yellow-400 font-bold text-center text-xs px-2">BLIND SPOT CHECK</span>
      </div>
    ),
    correct: 'Physically turn your head to check before changing lanes.',
    options: [
      'Rely completely on your side and rearview mirrors.',
      'Physically turn your head to check before changing lanes.',
      'Turn on your blinker; other drivers must yield.',
      'Accelerate rapidly while merging.'
    ]
  },
  {
    id: 'rule_heavy_truck', category: 'rule', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-orange-400 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(251,146,60,0.5)]">
         <div className="w-12 h-8 bg-orange-400 rounded flex mb-2"></div>
         <span className="text-orange-400 font-bold text-center text-xs px-2">OVERTAKING HEAVY TRUCKS</span>
      </div>
    ),
    correct: 'Pass quickly and maintain a wide berth due to massive blind spots.',
    options: [
      'Drive slowly alongside the truck to be safe.',
      'Tailgate the truck closely to reduce wind resistance.',
      'Pass quickly and maintain a wide berth due to massive blind spots.',
      'Overtake from the right side (blind side) if clear.'
    ]
  },
  {
    id: 'rule_yellow_light', category: 'rule', shape: 'circle',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-yellow-500 rounded-full flex flex-col items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)]">
         <div className="w-6 h-6 rounded-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,1)] mb-2"></div>
         <span className="text-yellow-500 font-bold text-center text-xs px-2">YELLOW TRAFFIC LIGHT</span>
      </div>
    ),
    correct: 'Prepare to stop if safe; do not accelerate to beat the red.',
    options: [
      'Accelerate quickly to beat the red light.',
      'Slam on the brakes immediately, regardless of cars behind you.',
      'Prepare to stop if safe; do not accelerate to beat the red.',
      'Honk to warn intersecting traffic and proceed.'
    ]
  },

  // EMERGENCY VEHICLE PROTOCOLS
  {
    id: 'emergency_ambulance', category: 'emergency', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-red-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
         <Ambulance size={48} className="text-red-500 mb-2" />
         <span className="text-red-500 font-bold text-center text-xs px-2">AMBULANCE WITH SIRENS</span>
      </div>
    ),
    correct: 'Pull over to the right and stop. Allow emergency vehicle to pass.',
    options: [
      'Speed up to get out of the way quickly.',
      'Pull over to the right and stop. Allow emergency vehicle to pass.',
      'Stop immediately in your current lane.',
      'Follow the ambulance to see where it\'s going.'
    ]
  },
  {
    id: 'emergency_fire', category: 'emergency', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-orange-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.5)]">
         <Truck size={48} className="text-orange-500 mb-2" />
         <span className="text-orange-500 font-bold text-center text-xs px-2">FIRE TRUCK EMERGENCY</span>
      </div>
    ),
    correct: 'Yield right of way. Move to the right edge of the road.',
    options: [
      'Continue at normal speed; you have right of way.',
      'Yield right of way. Move to the right edge of the road.',
      'Block the intersection to prevent others from moving.',
      'Honk to alert the fire truck to slow down.'
    ]
  },
  {
    id: 'emergency_police', category: 'emergency', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-blue-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
         <Shield size={48} className="text-blue-500 mb-2" />
         <span className="text-blue-500 font-bold text-center text-xs px-2">POLICE VEHICLE PURSUIT</span>
      </div>
    ),
    correct: 'Pull over safely. Do not interfere with police operation.',
    options: [
      'Try to follow the police to see what\'s happening.',
      'Pull over safely. Do not interfere with police operation.',
      'Speed up to stay ahead of the pursuit.',
      'Stop immediately and get out to ask what\'s wrong.'
    ]
  },

  // CONSTRUCTION ZONE
  {
    id: 'construction_narrow', category: 'construction', shape: 'diamond',
    render: () => (
      <div className="w-40 h-40 bg-orange-500 border-4 border-black flex items-center justify-center shadow-2xl" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
         <div className="flex flex-col items-center">
           <AlertTriangle size={32} className="text-black mb-1" />
           <span className="text-black font-black text-xs">NARROW</span>
         </div>
      </div>
    ),
    correct: 'Reduce speed, merge early, follow flagger instructions.',
    options: [
      'Maintain speed and merge at the last second.',
      'Reduce speed, merge early, follow flagger instructions.',
      'Use the shoulder to bypass the construction.',
      'Honk to make workers move faster.'
    ]
  },
  {
    id: 'construction_worker', category: 'construction', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-orange-500 border-4 border-black rounded-xl flex flex-col items-center justify-center shadow-2xl">
         <User size={48} className="text-black mb-2" />
         <span className="text-black font-bold text-center text-xs px-2">WORKERS AHEAD</span>
      </div>
    ),
    correct: 'Slow to posted limit, be prepared to stop, watch for workers.',
    options: [
      'Speed through to minimize time near workers.',
      'Slow to posted limit, be prepared to stop, watch for workers.',
      'Change lanes immediately without checking.',
      'Use high beams to see workers better.'
    ]
  },
  {
    id: 'construction_detour', category: 'construction', shape: 'rectangle',
    render: () => (
      <div className="w-40 h-32 bg-yellow-400 border-4 border-black rounded-lg flex flex-col items-center justify-center shadow-2xl">
         <Navigation size={32} className="text-black mb-2" />
         <span className="text-black font-black text-xs">DETOUR</span>
      </div>
    ),
    correct: 'Follow the detour signs. Do not enter closed road.',
    options: [
      'Take a shortcut through the closed section.',
      'Follow the detour signs. Do not enter closed road.',
      'Ignore detour if you know the area well.',
      'Reverse and find another route.'
    ]
  },

  // ROUNDABOUT ETIQUETTE
  {
    id: 'roundabout_enter', category: 'roundabout', shape: 'circle',
    render: () => (
      <div className="w-40 h-40 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow-2xl">
         <RefreshCw size={56} className="text-white" />
         <span className="absolute text-white font-black text-xs">ENTER</span>
      </div>
    ),
    correct: 'Yield to traffic already in the roundabout (on your left in Nigeria).',
    options: [
      'Enter immediately; traffic inside must yield.',
      'Yield to traffic already in the roundabout (on your left in Nigeria).',
      'Stop before entering regardless of traffic.',
      'Enter from the left lane only.'
    ]
  },
  {
    id: 'roundabout_exit', category: 'roundabout', shape: 'circle',
    render: () => (
      <div className="w-40 h-40 bg-green-600 rounded-full border-4 border-white flex items-center justify-center shadow-2xl">
         <ArrowUpRight size={48} className="text-white" />
         <span className="absolute text-white font-black text-xs">EXIT</span>
      </div>
    ),
    correct: 'Signal right before your exit, check mirrors, exit safely.',
    options: [
      'Exit without signaling; it\'s obvious where you\'re going.',
      'Signal right before your exit, check mirrors, exit safely.',
      'Change lanes immediately before exiting.',
      'Stop in the roundabout to check your exit.'
    ]
  },
  {
    id: 'roundabout_multi', category: 'roundabout', shape: 'circle',
    render: () => (
      <div className="w-40 h-40 bg-purple-600 rounded-full border-4 border-white flex items-center justify-center shadow-2xl">
         <div className="flex gap-1">
           <RefreshCw size={32} className="text-white" />
           <RefreshCw size={32} className="text-white" />
         </div>
      </div>
    ),
    correct: 'Stay in your lane, signal for each exit, don\'t change lanes inside.',
    options: [
      'Change lanes freely inside the roundabout.',
      'Stay in your lane, signal for each exit, don\'t change lanes inside.',
      'Take the shortest route regardless of lanes.',
      'Stop in the roundabout to let others pass.'
    ]
  },

  // HIGHWAY MERGING/EXIT
  {
    id: 'highway_merge', category: 'highway', shape: 'rectangle',
    render: () => (
      <div className="w-40 h-32 bg-blue-600 border-4 border-white rounded-lg flex flex-col items-center justify-center shadow-2xl">
         <Navigation size={32} className="text-white mb-2" />
         <span className="text-white font-black text-xs">MERGE</span>
      </div>
    ),
    correct: 'Match highway speed, signal, merge when there\'s a safe gap.',
    options: [
      'Stop at the end of the on-ramp and wait.',
      'Match highway speed, signal, merge when there\'s a safe gap.',
      'Force your way in regardless of traffic.',
      'Merge immediately at low speed.'
    ]
  },
  {
    id: 'highway_exit', category: 'highway', shape: 'rectangle',
    render: () => (
      <div className="w-40 h-32 bg-green-600 border-4 border-white rounded-lg flex flex-col items-center justify-center shadow-2xl">
         <ArrowUpRight size={32} className="text-white mb-2" />
         <span className="text-white font-black text-xs">EXIT</span>
      </div>
    ),
    correct: 'Signal early, move to right lane, exit at posted speed.',
    options: [
      'Cut across multiple lanes at the last second.',
      'Signal early, move to right lane, exit at posted speed.',
      'Exit from the left lane if it\'s faster.',
      'Stop on the highway to check the exit sign.'
    ]
  },
  {
    id: 'highway_passing', category: 'highway', shape: 'rectangle',
    render: () => (
      <div className="w-40 h-32 bg-slate-700 border-4 border-white rounded-lg flex flex-col items-center justify-center shadow-2xl">
         <Car size={32} className="text-white mb-2" />
         <span className="text-white font-black text-xs">PASSING</span>
      </div>
    ),
    correct: 'Signal left, check mirrors and blind spot, pass quickly on the left.',
    options: [
      'Pass on the right shoulder if the left lane is blocked.',
      'Signal left, check mirrors and blind spot, pass quickly on the left.',
      'Tailgate the car ahead to make them move over.',
      'Pass without signaling to save time.'
    ]
  },

  // VEHICLE BREAKDOWN
  {
    id: 'breakdown_highway', category: 'breakdown', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-amber-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
         <Wrench size={48} className="text-amber-500 mb-2" />
         <span className="text-amber-500 font-bold text-center text-xs px-2">HIGHWAY BREAKDOWN</span>
      </div>
    ),
    correct: 'Turn on hazards, move to shoulder if possible, stay with vehicle.',
    options: [
      'Stop in the traffic lane and get out to check.',
      'Turn on hazards, move to shoulder if possible, stay with vehicle.',
      'Leave the vehicle and walk to find help.',
      'Try to drive on the rim to the next exit.'
    ]
  },
  {
    id: 'breakdown_night', category: 'breakdown', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-950 border-4 border-blue-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
         <Moon size={48} className="text-blue-400 mb-2" />
         <Wrench size={32} className="text-blue-500" />
      </div>
    ),
    correct: 'Turn on hazards, use interior lights, stay inside with doors locked.',
    options: [
      'Turn off all lights to avoid attracting attention.',
      'Turn on hazards, use interior lights, stay inside with doors locked.',
      'Stand behind the vehicle with a flashlight.',
      'Walk along the roadside to find a phone.'
    ]
  },

  // TIRE BLOWOUT
  {
    id: 'tire_blowout', category: 'emergency', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-red-600 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
         <ZapOff size={48} className="text-red-500 mb-2" />
         <span className="text-red-500 font-bold text-center text-xs px-2">TIRE BLOWOUT</span>
      </div>
    ),
    correct: 'Grip steering firmly, ease off accelerator, do NOT brake immediately.',
    options: [
      'Slam on brakes immediately to stop quickly.',
      'Grip steering firmly, ease off accelerator, do NOT brake immediately.',
      'Accelerate to maintain control.',
      'Steer sharply to the shoulder.'
    ]
  },
  {
    id: 'tire_blowout_highway', category: 'emergency', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-900 border-4 border-orange-600 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.5)]">
         <ZapOff size={48} className="text-orange-500 mb-2" />
         <span className="text-orange-500 font-bold text-center text-xs px-2">HIGHWAY BLOWOUT</span>
      </div>
    ),
    correct: 'Maintain lane, gradual deceleration, signal, move to shoulder.',
    options: [
      'Immediately swerve across lanes to the shoulder.',
      'Maintain lane, gradual deceleration, signal, move to shoulder.',
      'Stop in your lane and put out flares.',
      'Exit at the next speed regardless of the tire.'
    ]
  },

  // ANIMAL CROSSING
  {
    id: 'animal_dog', category: 'animal', shape: 'diamond',
    render: () => (
      <div className="w-40 h-40 bg-yellow-400 border-4 border-black flex items-center justify-center shadow-2xl" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
         <Dog size={48} className="text-black" />
      </div>
    ),
    correct: 'Slow down, be prepared to stop, do not swerve to avoid small animals.',
    options: [
      'Swerve violently to avoid hitting the animal.',
      'Slow down, be prepared to stop, do not swerve to avoid small animals.',
      'Speed up to pass before the animal moves.',
      'Honk loudly to scare the animal away.'
    ]
  },
  {
    id: 'animal_cattle', category: 'animal', shape: 'rectangle',
    render: () => (
      <div className="w-40 h-32 bg-yellow-400 border-4 border-black rounded-lg flex flex-col items-center justify-center shadow-2xl">
         <span className="text-4xl">🐄</span>
         <span className="text-black font-black text-xs mt-1">CATTLE CROSSING</span>
      </div>
    ),
    correct: 'Stop completely, wait for animals to clear, proceed cautiously.',
    options: [
      'Drive slowly through the herd.',
      'Stop completely, wait for animals to clear, proceed cautiously.',
      'Honk to make them move faster.',
      'Use your horn and drive around them.'
    ]
  },

  // WEATHER CONDITIONS
  {
    id: 'weather_fog', category: 'weather', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-400 border-4 border-slate-600 rounded-xl flex flex-col items-center justify-center shadow-2xl opacity-70">
         <Cloud size={48} className="text-slate-700 mb-2" />
         <span className="text-slate-800 font-bold text-center text-xs px-2">DENSE FOG</span>
      </div>
    ),
    correct: 'Reduce speed significantly, use low beams, increase following distance.',
    options: [
      'Use high beams to see better in fog.',
      'Reduce speed significantly, use low beams, increase following distance.',
      'Maintain normal speed and follow taillights.',
      'Turn on hazard lights and drive normally.'
    ]
  },
  {
    id: 'weather_dust', category: 'weather', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-amber-200 border-4 border-amber-600 rounded-xl flex flex-col items-center justify-center shadow-2xl">
         <Wind size={48} className="text-amber-700 mb-2" />
         <span className="text-amber-800 font-bold text-center text-xs px-2">DUST STORM</span>
      </div>
    ),
    correct: 'Slow down, pull over if visibility is near zero, wait for conditions to improve.',
    options: [
      'Speed up to get through the dust quickly.',
      'Slow down, pull over if visibility is near zero, wait for conditions to improve.',
      'Follow the vehicle ahead closely for guidance.',
      'Turn on high beams to see through dust.'
    ]
  },
  {
    id: 'weather_heat', category: 'weather', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-orange-500 border-4 border-red-600 rounded-xl flex flex-col items-center justify-center shadow-2xl">
         <span className="text-4xl">🌡️</span>
         <span className="text-white font-bold text-center text-xs px-2 mt-1">EXTREME HEAT</span>
      </div>
    ),
    correct: 'Check tires frequently, stay hydrated, watch for overheating, avoid midday travel.',
    options: [
      'Drive faster to minimize time in the heat.',
      'Check tires frequently, stay hydrated, watch for overheating, avoid midday travel.',
      'Turn off AC to reduce engine strain.',
      'Drive with windows closed regardless of AC.'
    ]
  },

  // ENHANCED NIGHT DRIVING
  {
    id: 'night_rural', category: 'night', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-slate-950 border-4 border-indigo-500 rounded-xl flex flex-col items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
         <Moon size={48} className="text-indigo-400 mb-2" />
         <span className="text-indigo-400 font-bold text-center text-xs px-2">RURAL NIGHT</span>
      </div>
    ),
    correct: 'Use high beams when no oncoming traffic, watch for dark pedestrians/animals.',
    options: [
      'Always use high beams for maximum visibility.',
      'Use high beams when no oncoming traffic, watch for dark pedestrians/animals.',
      'Drive with parking lights only to save battery.',
      'Follow taillights of any vehicle ahead.'
    ],
    explanation: 'On unlit rural roads, use high beams when clear of oncoming traffic to spot unlit pedestrians, bicycles, or cattle. Always dip to low beams within 200m of approaching cars.'
  },
  {
    id: 'night_unlit', category: 'night', shape: 'square',
    render: () => (
      <div className="w-40 h-40 bg-black border-4 border-slate-700 rounded-xl flex flex-col items-center justify-center shadow-2xl">
         <X size={48} className="text-slate-600 mb-2" />
         <span className="text-slate-500 font-bold text-center text-xs px-2">UNLIT ROAD</span>
      </div>
    ),
    correct: 'Reduce speed, use high beams, be extra alert for hazards without lights.',
    options: [
      'Maintain highway speed on familiar roads.',
      'Reduce speed, use high beams, be extra alert for hazards without lights.',
      'Use hazard lights to increase visibility.',
      'Drive on the center line to avoid edges.'
    ],
    explanation: 'Unlit roads conceal potholes, broken-down trucks without reflectors, and pedestrians. Slow down significantly so your stopping distance never exceeds your headlight beam.'
  },

  // CARRIAGEWAY ROAD MARKINGS & LINES
  {
    id: 'mark_double_yellow_line', category: 'markings', shape: 'road',
    render: () => (
      <div className="w-44 h-40 bg-[#1e293b] border-4 border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
        <div className="w-full h-14 bg-slate-900 border-y-2 border-slate-800 flex flex-col items-center justify-center gap-1.5 px-2">
          <div className="w-full h-2 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
          <div className="w-full h-2 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
        </div>
        <span className="absolute bottom-2 text-[#1cd188] font-mono text-[9px] uppercase tracking-widest font-bold">Double Solid Centerline</span>
      </div>
    ),
    correct: 'Strictly no overtaking or crossing for traffic in both directions',
    options: [
      'Overtaking permitted if road is clear',
      'Strictly no overtaking or crossing for traffic in both directions',
      'Parking permitted along the yellow line',
      'Reversible express lane'
    ],
    explanation: 'Double solid yellow centerlines separate opposing traffic flows. Drivers in BOTH directions are strictly forbidden from crossing or straddling these lines to overtake.'
  },
  {
    id: 'mark_broken_white_line', category: 'markings', shape: 'road',
    render: () => (
      <div className="w-44 h-40 bg-[#1e293b] border-4 border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
        <div className="w-full h-12 bg-slate-900 border-y-2 border-slate-800 flex items-center justify-between px-2">
          <div className="w-6 h-1.5 bg-white"></div>
          <div className="w-6 h-1.5 bg-white"></div>
          <div className="w-6 h-1.5 bg-white"></div>
          <div className="w-6 h-1.5 bg-white"></div>
        </div>
        <span className="absolute bottom-2 text-slate-300 font-mono text-[9px] uppercase tracking-widest font-bold">Broken White Lane Line</span>
      </div>
    ),
    correct: 'Lane line - lane changing and overtaking allowed when safe',
    options: [
      'Do not change lanes',
      'Lane line - lane changing and overtaking allowed when safe',
      'Bus lane boundary',
      'Construction detours ahead'
    ],
    explanation: 'Broken white lines separate traffic lanes moving in the same or opposite direction. You may cross them to change lanes or overtake when safe to do so.'
  },
  {
    id: 'mark_yellow_box_junction', category: 'markings', shape: 'road',
    render: () => (
      <div className="w-44 h-40 bg-[#1e293b] border-4 border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
        <div className="w-28 h-28 border-4 border-yellow-400 relative" style={{
          backgroundImage: 'linear-gradient(45deg, #eab308 2px, transparent 2px), linear-gradient(-45deg, #eab308 2px, transparent 2px)',
          backgroundSize: '14px 14px'
        }} />
        <span className="absolute bottom-1 text-yellow-400 font-mono text-[9px] uppercase tracking-widest font-bold">Yellow Box Junction</span>
      </div>
    ),
    correct: 'Do not enter unless your exit route is clear',
    options: [
      'Stop and wait inside the box for traffic lights',
      'Do not enter unless your exit route is clear',
      'Reserved parking for emergency vehicles',
      'Speed bump zone'
    ],
    explanation: 'Yellow Box Junctions keep intersections clear. You MUST NOT enter the box unless your exit is completely clear. The only exception is if turning right and waiting for oncoming traffic.'
  },
  {
    id: 'mark_zebra_crossing', category: 'markings', shape: 'road',
    render: () => (
      <div className="w-44 h-40 bg-[#1e293b] border-4 border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center gap-2 p-3 shadow-2xl">
        <div className="w-32 h-3 bg-white rounded-sm"></div>
        <div className="w-32 h-3 bg-white rounded-sm"></div>
        <div className="w-32 h-3 bg-white rounded-sm"></div>
        <div className="w-32 h-3 bg-white rounded-sm"></div>
        <span className="absolute bottom-1 text-[#1cd188] font-mono text-[9px] uppercase tracking-widest font-bold">Zebra Crossing Markings</span>
      </div>
    ),
    correct: 'Pedestrian crossing - drivers MUST stop and give way to pedestrians',
    options: [
      'Pedestrians must yield to cars',
      'Pedestrian crossing - drivers MUST stop and give way to pedestrians',
      'No stopping or parking zone',
      'Speed reducer stripes'
    ],
    explanation: 'Zebra crossings designate pedestrian priority zones. Drivers MUST reduce speed when approaching and come to a complete stop if any pedestrian is waiting or crossing.'
  },
  {
    id: 'mark_solid_transverse_stop_line', category: 'markings', shape: 'road',
    render: () => (
      <div className="w-44 h-40 bg-[#1e293b] border-4 border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
        <div className="w-full h-12 bg-slate-900 border-l-8 border-white flex items-center justify-center">
          <span className="text-white font-black text-xs tracking-widest pl-2">STOP LINE</span>
        </div>
        <span className="absolute bottom-2 text-slate-300 font-mono text-[9px] uppercase tracking-widest font-bold">Transverse Stop Line</span>
      </div>
    ),
    correct: 'Stop completely behind this line before entering junction or signal',
    options: [
      'Drive past line before checking traffic',
      'Stop completely behind this line before entering junction or signal',
      'Yield line for bicycles only',
      'Pedestrian walkway boundary'
    ],
    explanation: 'Solid transverse stop lines indicate where your vehicle must come to a complete stop when signaled by a stop sign, traffic warden, or red traffic light.'
  },
  {
    id: 'mark_give_way_triangles', category: 'markings', shape: 'road',
    render: () => (
      <div className="w-44 h-40 bg-[#1e293b] border-4 border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
        <div className="flex gap-2 mb-2">
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-white" />
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-white" />
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-white" />
        </div>
        <span className="text-white font-mono text-[9px] uppercase tracking-widest font-bold">Yield Road Markings</span>
      </div>
    ),
    correct: 'Yield right-of-way to traffic on the main road ahead',
    options: [
      'Accelerate onto the main road',
      'Yield right-of-way to traffic on the main road ahead',
      'Sharp spikes on road ahead',
      'Three lane road ahead'
    ],
    explanation: 'Transverse white triangles painted on the road surface signal that you must yield right-of-way to vehicles on the major road you are about to join.'
  },
  {
    id: 'mark_hatched_chevron_zone', category: 'markings', shape: 'road',
    render: () => (
      <div className="w-44 h-40 bg-[#1e293b] border-4 border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
        <div className="w-32 h-24 border-2 border-white/80 relative" style={{
          backgroundImage: 'repeating-linear-gradient(135deg, #ffffff 0px, #ffffff 4px, transparent 4px, transparent 14px)',
        }} />
        <span className="absolute bottom-1 text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold">Hatched Chevron Zone</span>
      </div>
    ),
    correct: 'Neutral zone - driving or parking in hatched areas is prohibited',
    options: [
      'Parking zone for breakdown vehicles',
      'Neutral zone - driving or parking in hatched areas is prohibited',
      'Overtaking lane',
      'Speed acceleration zone'
    ],
    explanation: 'Hatched chevron zones separate diverging or merging traffic streams. Vehicles MUST NOT enter, cross, or park on hatched pavement markings.'
  },
  {
    id: 'mark_rumble_strips', category: 'markings', shape: 'road',
    render: () => (
      <div className="w-44 h-40 bg-[#1e293b] border-4 border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center gap-1.5 shadow-2xl">
        <div className="w-36 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
        <div className="w-36 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
        <div className="w-36 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
        <div className="w-36 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
        <span className="text-yellow-400 font-mono text-[9px] uppercase tracking-widest font-bold mt-1">Transverse Rumble Strips</span>
      </div>
    ),
    correct: 'Tactile warning strips - reduce speed for upcoming danger or toll gate',
    options: [
      'Road damage ahead',
      'Tactile warning strips - reduce speed for upcoming danger or toll gate',
      'Flat tire hazard',
      'No stopping zone'
    ],
    explanation: 'Rumble strips create audible sound and vibration through tires to alert drivers to reduce speed before approaching sharp curves, toll gates, or high-risk intersections.'
  },
  {
    id: 'mark_double_solid_red_yellow_kerb', category: 'markings', shape: 'road',
    render: () => (
      <div className="w-44 h-40 bg-[#1e293b] border-4 border-slate-700 rounded-xl relative overflow-hidden flex items-center justify-center shadow-2xl">
        <div className="w-full h-8 bg-slate-900 border-b-4 border-yellow-500 flex flex-col justify-end p-1">
          <div className="w-full h-1.5 bg-red-600 mb-0.5"></div>
          <div className="w-full h-1.5 bg-red-600"></div>
        </div>
        <span className="absolute bottom-2 text-red-400 font-mono text-[9px] uppercase tracking-widest font-bold">Double Red / Yellow Kerb</span>
      </div>
    ),
    correct: 'No stopping or parking at any time along the kerb',
    options: [
      'Parking allowed for 15 minutes max',
      'No stopping or parking at any time along the kerb',
      'Commercial loading zone',
      'Taxi drop-off zone'
    ],
    explanation: 'Double lines painted along the kerb or pavement edge mean NO STOPPING or PARKING at any time, even to pick up or drop off passengers.'
  },
  {
    id: 'mark_bus_only_pavement', category: 'markings', shape: 'road',
    render: () => (
      <div className="w-44 h-40 bg-red-950/60 border-4 border-red-500 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-2 shadow-2xl">
        <span className="text-[#1cd188] font-black text-lg tracking-widest border-2 border-[#1cd188] px-2 py-0.5 rounded">BUS ONLY</span>
        <span className="text-white font-mono text-[9px] uppercase tracking-widest font-bold mt-2">Red Pavement Marking</span>
      </div>
    ),
    correct: 'Bus Rapid Transit (BRT) lane - strictly restricted to authorized buses',
    options: [
      'Emergency vehicle parking',
      'Bus Rapid Transit (BRT) lane - strictly restricted to authorized buses',
      'High speed express lane for private cars',
      'Heavy truck lane only'
    ],
    explanation: 'Red-painted pavement or "BUS ONLY" markings designate BRT lanes (e.g. Lagos BRT corridor). Driving private vehicles on these lanes incurs heavy fines and impoundment.'
  }
];

// Utility to shuffle arrays
const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export default function RoadSimulator() {
  const [mainTab, setMainTab] = useState('game'); // 'game' | 'library'
  const [libraryCategory, setLibraryCategory] = useState('all');
  const [gameCategoryFilter, setGameCategoryFilter] = useState('all');
  const [gameState, setGameState] = useState('start'); // start, playing, gameover
  const [difficulty, setDifficulty] = useState('beginner'); // beginner, intermediate, advanced, expert
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);
  
  const [currentSign, setCurrentSign] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
  
  const [shake, setShake] = useState(false);
  const [showBonus, setShowBonus] = useState(null); // String like '+500'

  // Progress tracking
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [showStats, setShowStats] = useState(false);

  // Achievement system
  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem('roadSimulatorAchievements');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  // Audio system
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('roadSimulatorSound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Leaderboard system
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardDifficulty, setLeaderboardDifficulty] = useState('all');
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Certificate system
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const response = await api.get(`/drivers/simulator/leaderboard?difficulty=${leaderboardDifficulty}`);
      setLeaderboard(response.data.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const fetchCertificate = async () => {
    setLoadingCertificate(true);
    try {
      const response = await api.get('/drivers/simulator/certificate');
      setCertificate(response.data.data);
    } catch (err) {
      console.error('Failed to fetch certificate:', err);
    } finally {
      setLoadingCertificate(false);
    }
  };

  useEffect(() => {
    if (showLeaderboard) {
      fetchLeaderboard();
    }
  }, [showLeaderboard, leaderboardDifficulty]);

  useEffect(() => {
    if (showCertificate) {
      fetchCertificate();
    }
  }, [showCertificate]);

  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'correct':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'wrong':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'achievement':
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3); // C6
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'gameover':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'click':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
    }
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('roadSimulatorSound', JSON.stringify(newState));
    if (newState) playSound('click');
  };

  const ACHIEVEMENTS = [
    { id: 'first_blood', name: 'First Blood', description: 'Answer your first question correctly', icon: '🎯', condition: (stats) => stats.correctAnswers >= 1 },
    { id: 'streak_5', name: 'On Fire', description: 'Achieve a 5-question streak', icon: '🔥', condition: (stats) => stats.streak >= 5 },
    { id: 'streak_10', name: 'Unstoppable', description: 'Achieve a 10-question streak', icon: '⚡', condition: (stats) => stats.streak >= 10 },
    { id: 'score_1000', name: 'Road Scholar', description: 'Score 1,000 points in one session', icon: '📚', condition: (stats) => stats.score >= 1000 },
    { id: 'score_5000', name: 'Master Driver', description: 'Score 5,000 points in one session', icon: '🏆', condition: (stats) => stats.score >= 5000 },
    { id: 'score_10000', name: 'Legend', description: 'Score 10,000 points in one session', icon: '👑', condition: (stats) => stats.score >= 10000 },
    { id: 'accuracy_80', name: 'Sharpshooter', description: 'Achieve 80% accuracy in a session', icon: '🎯', condition: (stats) => stats.totalQuestions >= 5 && (stats.correctAnswers / stats.totalQuestions) >= 0.8 },
    { id: 'accuracy_90', name: 'Precision', description: 'Achieve 90% accuracy in a session', icon: '💎', condition: (stats) => stats.totalQuestions >= 10 && (stats.correctAnswers / stats.totalQuestions) >= 0.9 },
    { id: 'expert_mode', name: 'Expert', description: 'Complete a session on Expert difficulty', icon: '🌟', condition: (stats) => stats.difficulty === 'expert' && stats.totalQuestions >= 5 },
    { id: 'perfect_session', name: 'Perfect', description: 'Complete a session with 100% accuracy (min 10 questions)', icon: '✨', condition: (stats) => stats.totalQuestions >= 10 && stats.wrongAnswers === 0 },
  ];

  // Load high scores for each difficulty
  useEffect(() => {
    const loadHighScores = () => {
      const scores = {};
      ['beginner', 'intermediate', 'advanced', 'expert'].forEach(diff => {
        const saved = localStorage.getItem(`roadSimulatorHighScore_${diff}`);
        if (saved) scores[diff] = parseInt(saved, 10);
      });
      setHighScore(scores[difficulty] || 0);
    };
    loadHighScores();
  }, [difficulty]);

  const getDifficultySettings = () => {
    const settings = {
      beginner: {
        timeLimit: 20,
        lives: 5,
        categories: ['sign', 'rule'],
        pointsMultiplier: 1
      },
      intermediate: {
        timeLimit: 15,
        lives: 3,
        categories: ['sign', 'rule', 'security'],
        pointsMultiplier: 1.5
      },
      advanced: {
        timeLimit: 12,
        lives: 3,
        categories: ['sign', 'rule', 'security', 'emergency', 'construction'],
        pointsMultiplier: 2
      },
      expert: {
        timeLimit: 8,
        lives: 2,
        categories: ['sign', 'rule', 'security', 'emergency', 'construction', 'roundabout', 'highway', 'breakdown', 'animal', 'weather', 'night'],
        pointsMultiplier: 3
      }
    };
    return settings[difficulty];
  };

  const startGame = () => {
    setScore(0);
    const settings = getDifficultySettings();
    setLives(settings.lives);
    setStreak(0);
    setTotalQuestions(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setShowStats(false);
    setNewAchievement(null);
    setGameState('playing');
    nextQuestion();
  };

  const checkAchievements = () => {
    const stats = {
      score,
      streak,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      difficulty
    };

    ACHIEVEMENTS.forEach(achievement => {
      if (!achievements.includes(achievement.id) && achievement.condition(stats)) {
        const newAchievements = [...achievements, achievement.id];
        setAchievements(newAchievements);
        localStorage.setItem('roadSimulatorAchievements', JSON.stringify(newAchievements));
        setNewAchievement(achievement);
        playSound('achievement');
        setTimeout(() => setNewAchievement(null), 3000);
      }
    });
  };

  // Check achievements on score change
  useEffect(() => {
    if (gameState === 'playing') {
      checkAchievements();
    }
  }, [score, streak]);

  const getDynamicTimeLimit = () => {
    const settings = getDifficultySettings();
    const baseTime = settings.timeLimit;
    
    // Reduce time as score increases
    if (score < 1000) return baseTime;
    if (score < 3000) return baseTime - 3;
    if (score < 6000) return baseTime - 5;
    if (score < 10000) return baseTime - 7;
    return Math.max(3, baseTime - 9);
  };

  const getRoadAnimationDuration = () => {
    if (score < 1000) return '1s';
    if (score < 3000) return '0.7s';
    if (score < 6000) return '0.4s';
    return '0.2s';
  };

  const nextQuestion = () => {
    const settings = getDifficultySettings();
    const filteredScenarios = SCENARIOS.filter(s => {
      if (gameCategoryFilter !== 'all') {
        if (gameCategoryFilter === 'sign') return s.category === 'sign';
        if (gameCategoryFilter === 'marking') return s.category === 'marking';
        if (gameCategoryFilter === 'scenario') return s.category === 'scenario' || s.category === 'hazard';
        if (gameCategoryFilter === 'emergency') return s.category === 'emergency' || s.category === 'security';
      }
      return settings.categories.includes(s.category);
    });
    
    const pool = filteredScenarios.length > 0 ? filteredScenarios : SCENARIOS;
    
    // Pick random question from filtered scenarios
    let randomSign;
    do {
      randomSign = pool[Math.floor(Math.random() * pool.length)];
    } while (currentSign && randomSign.id === currentSign.id && pool.length > 1);
    
    setCurrentSign(randomSign);
    setShuffledOptions(shuffle([...randomSign.options]));
    setTimeLeft(getDynamicTimeLimit());
    setFeedback(null);
    setShowBonus(null);
  };

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && feedback === null) {
      timer = setInterval(() => {
         setTimeLeft((prev) => {
            if (prev <= 1) {
               handleTimeout();
               return 0;
            }
            return prev - 1;
         });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, feedback]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleTimeout = () => {
    handleAnswer('TIMEOUT');
  };

  const handleAnswer = (selected) => {
    if (feedback !== null) return; // Prevent double clicks
    
    const settings = getDifficultySettings();
    setTotalQuestions(prev => prev + 1);
    
    if (selected === currentSign.correct) {
      setFeedback('correct');
      setCorrectAnswers(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      playSound('correct');
      
      let basePoints = 100 * settings.pointsMultiplier;
      let timeBonus = timeLeft * 10 * settings.pointsMultiplier;
      let streakBonus = 0;
      
      if (newStreak >= 3) streakBonus = 50 * newStreak * settings.pointsMultiplier;
      
      const totalGained = Math.round(basePoints + timeBonus + streakBonus);
      setScore(s => s + totalGained);
      setShowBonus(`+${totalGained}`);
      
      setTimeout(nextQuestion, 1200);
    } else {
      setFeedback('incorrect');
      setWrongAnswers(prev => prev + 1);
      setStreak(0);
      setLives(l => l - 1);
      triggerShake();
      playSound('wrong');
      
      if (lives - 1 <= 0) {
         setTimeout(async () => {
            playSound('gameover');
            // Save result to backend
            try {
              await api.post('/drivers/simulator/result', {
                score: score,
                difficulty: difficulty
              });
            } catch (err) {
              console.error('Failed to save simulator result:', err);
            }
            
            if (score > highScore) {
               setHighScore(score);
               localStorage.setItem(`roadSimulatorHighScore_${difficulty}`, score.toString());
            }
            setGameState('gameover');
         }, 1500);
      } else {
         // setTimeout(nextQuestion, 1500); // Disabled for learning mode
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Professional Container */}
      <div className={`bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-transform ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Gamepad2 className="w-8 h-8 text-brandMint" />
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Road Safety Simulator</h1>
            </div>
            <p className="text-slate-400 text-sm">Master defensive driving, security protocols, and road rules</p>
          </div>
          
          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={toggleSound}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-brandMint" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
              title="View Statistics"
            >
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </button>
            <button
              onClick={() => setShowAchievements(!showAchievements)}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 relative"
              title="Achievements"
            >
              <Award className="w-5 h-5 text-amber-400" />
              {achievements.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {achievements.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setShowLeaderboard(!showLeaderboard); playSound('click'); }}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
              title="Leaderboard"
            >
              <Trophy className="w-5 h-5 text-brandMint" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-6 max-w-md mx-auto md:mx-0">
          <button
            onClick={() => { setMainTab('game'); playSound('click'); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mainTab === 'game' ? 'bg-[#1cd188] text-[#0f172a] shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" /> 🎮 Training Simulator
          </button>
          <button
            onClick={() => { setMainTab('library'); playSound('click'); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mainTab === 'library' ? 'bg-[#1cd188] text-[#0f172a] shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" /> 📖 Signs & Markings Library
          </button>
        </div>

        {/* Game Mode View */}
        {mainTab === 'game' && (
          <>
            {/* Start Screen */}
        {gameState === 'start' && (
          <div className="bg-slate-950 rounded-xl border border-slate-800 min-h-[500px] flex flex-col items-center justify-center text-center p-8 relative">
            <Gamepad2 className="w-16 h-16 text-brandMint mb-4" />
            <h2 className="text-3xl font-black text-white mb-2">Ready to Test Your Skills?</h2>
            <p className="text-slate-400 mb-6 max-w-md">Choose your difficulty level and start the road safety training simulation.</p>

            {/* Difficulty Selection */}
            <div className="mb-6">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Select Difficulty</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {[
                  { id: 'beginner', label: 'Beginner', color: 'bg-green-500' },
                  { id: 'intermediate', label: 'Intermediate', color: 'bg-blue-500' },
                  { id: 'advanced', label: 'Advanced', color: 'bg-orange-500' },
                  { id: 'expert', label: 'Expert', color: 'bg-red-500' }
                ].map(diff => (
                  <button
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                      difficulty === diff.id 
                        ? `${diff.color} text-white shadow-lg` 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Practice Category Selection */}
            <div className="mb-6">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Practice Category / Topic</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {[
                  { id: 'all', label: 'All Topics' },
                  { id: 'sign', label: '🛑 Road Signs' },
                  { id: 'marking', label: '🛣️ Road Markings' },
                  { id: 'scenario', label: '⚠️ Hazards' },
                  { id: 'emergency', label: '🚨 Emergency' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setGameCategoryFilter(cat.id); playSound('click'); }}
                    className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all ${
                      gameCategoryFilter === cat.id 
                        ? 'bg-brandMint text-corporateNavy shadow-lg' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Info */}
            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800 max-w-md">
              <div className="grid grid-cols-2 gap-4 text-left text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Time Limit:</span>
                  <span className="text-white font-bold">{getDifficultySettings().timeLimit}s</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Lives:</span>
                  <span className="text-white font-bold">{getDifficultySettings().lives}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Multiplier:</span>
                  <span className="text-white font-bold">x{getDifficultySettings().pointsMultiplier}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Categories:</span>
                  <span className="text-white font-bold">{getDifficultySettings().categories.length}</span>
                </div>
              </div>
            </div>

            {highScore > 0 && (
              <div className="mb-6 font-mono text-amber-400 uppercase tracking-widest bg-amber-400/10 px-6 py-2 rounded-full border border-amber-400/30">
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} High Score: {highScore}
              </div>
            )}

            <button 
              onClick={startGame}
              className="px-8 py-3 bg-brandMint text-corporateNavy font-black text-lg rounded-lg uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg"
            >
              Start Training
            </button>
          </div>
        )}

        {/* Achievements Modal */}
        {showAchievements && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" /> Achievements
                </h3>
                <button onClick={() => setShowAchievements(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ACHIEVEMENTS.map(achievement => {
                  const unlocked = achievements.includes(achievement.id);
                  return (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${unlocked ? 'bg-amber-500/20 border-amber-500/50' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <p className="font-bold text-sm text-white">{achievement.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{achievement.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-brandMint" /> Leaderboard
                </h3>
                <button onClick={() => setShowLeaderboard(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <select 
                value={leaderboardDifficulty}
                onChange={(e) => setLeaderboardDifficulty(e.target.value)}
                className="w-full bg-slate-800 text-white text-sm rounded-lg px-4 py-2 border border-slate-700 mb-4"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              
              {loadingLeaderboard ? (
                <div className="text-center text-slate-500 py-8">Loading...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No scores yet</div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div 
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-amber-500/20 border border-amber-500/50' :
                        index === 1 ? 'bg-slate-400/20 border border-slate-400/50' :
                        index === 2 ? 'bg-orange-600/20 border border-orange-600/50' :
                        'bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-bold w-8 ${index < 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                          #{index + 1}
                        </span>
                        <span className="text-white font-medium">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-brandMint font-bold">{entry.score}</span>
                        <span className="text-xs text-slate-500 block capitalize">{entry.difficulty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Modal */}
        {showStats && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-brandMint" /> Session Statistics
                </h3>
                <button onClick={() => setShowStats(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Questions</span>
                    <span className="text-white font-bold text-xl">{totalQuestions}</span>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Correct Answers</span>
                    <span className="text-brandMint font-bold text-xl">{correctAnswers}</span>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Wrong Answers</span>
                    <span className="text-red-400 font-bold text-xl">{wrongAnswers}</span>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Accuracy</span>
                    <span className="text-white font-bold text-xl">
                      {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Best Streak</span>
                    <span className="text-amber-400 font-bold text-xl">{streak}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && (
          <div className="bg-slate-950 rounded-xl border border-slate-800 min-h-[500px] flex flex-col relative">
            
            {/* Achievement Notification */}
            {newAchievement && (
              <div className="absolute top-4 right-4 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-xl shadow-2xl animate-bounce border-2 border-amber-300">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{newAchievement.icon}</span>
                  <div>
                    <p className="font-black text-sm uppercase">Achievement Unlocked!</p>
                    <p className="font-bold">{newAchievement.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* HUD / Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-6">
                <div className="text-left">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase">Score</span>
                  <span className="text-2xl font-black font-mono text-brandMint tracking-widest leading-none relative">
                    {score.toString().padStart(6, '0')}
                    {showBonus && (
                      <span className="absolute -top-6 left-0 text-emerald-400 text-sm font-black animate-[floatUp_1s_ease-out_forwards]">
                        {showBonus}
                      </span>
                    )}
                  </span>
                </div>
                {streak >= 3 && (
                  <div className="flex items-center gap-1 text-orange-500 text-xs font-black uppercase animate-pulse">
                    <Zap size={12} /> Streak x{streak}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Timer className={`w-6 h-6 ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                  <span className={`text-2xl font-black font-mono tracking-widest w-8 text-center ${timeLeft <= 3 ? 'text-red-500' : 'text-white'}`}>
                    {timeLeft}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map(i => (
                    <Heart 
                      key={i} 
                      className={`w-6 h-6 ${i <= lives ? 'text-red-500 fill-red-500' : 'text-slate-700 fill-slate-700'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Category Flash */}
            <div className="text-center py-4 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {currentSign?.category || 'Loading...'}
              </span>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="flex flex-col items-center">
                {currentSign?.render()}
              </div>
            </div>

            {/* Options */}
            <div className="p-6 border-t border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shuffledOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={feedback !== null}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      feedback === null
                        ? 'bg-slate-800 border-slate-700 hover:border-brandMint hover:bg-slate-700'
                        : feedback === 'correct' && option === currentSign.correct
                          ? 'bg-brandMint/20 border-brandMint text-brandMint'
                          : feedback === 'incorrect' && option === currentSign.correct
                            ? 'bg-brandMint/20 border-brandMint text-brandMint'
                            : feedback === 'incorrect' && option !== currentSign.correct
                              ? 'bg-red-500/20 border-red-500 text-red-400 opacity-50'
                              : 'bg-slate-800 border-slate-700 opacity-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                ))}
              </div>

              {/* Educational Feedback Box */}
              {feedback && (
                <div className={`mt-6 p-5 rounded-xl text-left border ${
                  feedback === 'correct' 
                    ? 'bg-[#1e293b] border-brandMint text-white shadow-xl' 
                    : 'bg-[#1e293b] border-red-500 text-white shadow-xl'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-black text-sm uppercase tracking-widest flex items-center gap-2 ${
                      feedback === 'correct' ? 'text-brandMint' : 'text-red-400'
                    }`}>
                      {feedback === 'correct' ? '✓ Correct Answer!' : '✕ Incorrect'}
                    </span>
                    <button 
                      onClick={nextQuestion}
                      className="px-5 py-2.5 bg-brandMint text-corporateNavy font-black text-xs rounded-xl uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      Next Question →
                    </button>
                  </div>
                  {currentSign?.explanation && (
                    <div className="text-xs leading-relaxed text-slate-200 mt-2 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
                      <span className="text-brandMint font-bold block mb-1">💡 Highway Code & Road Safety Note:</span>
                      {currentSign.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="bg-slate-950 rounded-xl border border-slate-800 min-h-[500px] flex flex-col items-center justify-center text-center p-8 relative">
            <div className="text-6xl mb-4">🏁</div>
            <h2 className="text-3xl font-black text-white mb-2">Training Complete</h2>
            <p className="text-slate-400 mb-6">Here's how you performed</p>

            <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <span className="block text-xs text-slate-500 uppercase">Final Score</span>
                <span className="text-2xl font-black text-brandMint">{score}</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <span className="block text-xs text-slate-500 uppercase">Accuracy</span>
                <span className="text-2xl font-black text-white">
                  {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                </span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <span className="block text-xs text-slate-500 uppercase">Correct</span>
                <span className="text-2xl font-black text-brandMint">{correctAnswers}</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <span className="block text-xs text-slate-500 uppercase">Best Streak</span>
                <span className="text-2xl font-black text-amber-400">{streak}</span>
              </div>
            </div>

            {score > highScore && (
              <div className="mb-6 font-mono text-amber-400 uppercase tracking-widest bg-amber-400/10 px-6 py-2 rounded-full border border-amber-400/30">
                New High Score!
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={startGame}
                className="px-6 py-3 bg-brandMint text-corporateNavy font-black rounded-lg uppercase tracking-widest hover:bg-emerald-400 transition-all"
              >
                Try Again
              </button>
              <button 
                onClick={() => setGameState('start')}
                className="px-6 py-3 bg-slate-800 text-white font-black rounded-lg uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
              >
                Main Menu
              </button>
            </div>
          </div>
        )}
        </>
        )}

        {/* Reference Library View */}
        {mainTab === 'library' && (
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 min-h-[500px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-brandMint" /> Highway Code Reference Library
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Comprehensive study guide of Nigerian road signs, carriageway markings, and hazard rules.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'sign', label: '🛑 Road Signs' },
                  { id: 'marking', label: '🛣️ Road Markings' },
                  { id: 'scenario', label: '⚠️ Hazards' },
                  { id: 'emergency', label: '🚨 Emergency' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setLibraryCategory(cat.id); playSound('click'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      libraryCategory === cat.id
                        ? 'bg-brandMint text-corporateNavy shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SCENARIOS.filter(s => {
                if (libraryCategory === 'all') return true;
                if (libraryCategory === 'sign') return s.category === 'sign';
                if (libraryCategory === 'marking') return s.category === 'marking';
                if (libraryCategory === 'scenario') return s.category === 'scenario' || s.category === 'hazard';
                if (libraryCategory === 'emergency') return s.category === 'emergency' || s.category === 'security';
                return true;
              }).map((item, index) => (
                <div key={item.id || index} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center text-center hover:border-slate-700 transition-all shadow-lg">
                  {/* Visual Render */}
                  <div className="h-36 w-full bg-slate-950/60 rounded-lg flex items-center justify-center p-3 mb-4 border border-slate-800 overflow-hidden">
                    {item.render ? item.render() : <AlertTriangle className="w-12 h-12 text-amber-400" />}
                  </div>

                  {/* Badge */}
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 mb-2 border border-slate-700">
                    {item.category === 'sign' ? 'Road Sign' : item.category === 'marking' ? 'Carriageway Marking' : item.category}
                  </span>

                  {/* Correct Action Title */}
                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                    {item.correct}
                  </h3>

                  {/* Explanation */}
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 w-full text-left mt-auto">
                    {item.explanation || 'Refer to Highway Code regulations.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
