import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import HeaderBar from '../../components/HeaderBar';
import { simulatorService } from '../../api/api';

/**
 * Authentic Road Sign Graphic Visualizer Component
 * Displays Nigerian & International Highway Code Road Signs with shapes, borders and symbols
 */
function RoadSignVisualizer({ sign, isDark }) {
  if (!sign) return null;

  const {
    shape = 'circle', // 'octagon' | 'triangle' | 'inverted_triangle' | 'circle' | 'square'
    code = 'FRSC R-01',
    category = 'REGULATORY SIGN',
    bgColor = '#dc2626',
    borderColor = '#dc2626',
    textColor = '#ffffff',
    text = '',
    subText = '',
    icon = '',
    hasSlash = false
  } = sign;

  const isRed = category.includes('REGULATORY') || category.includes('PROHIBITORY');
  const isYellow = category.includes('WARNING') || category.includes('HAZARD');

  const badgeBg = isRed 
    ? (isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.12)')
    : isYellow 
      ? (isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.12)')
      : (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)');

  const badgeBorder = isRed ? '#ef4444' : isYellow ? '#f59e0b' : '#3b82f6';
  const badgeText = isRed ? '#ef4444' : isYellow ? '#f59e0b' : '#3b82f6';

  return (
    <View className="items-center justify-center my-3">
      {/* Category & FRSC Code Pill */}
      <View 
        style={{
          backgroundColor: badgeBg,
          borderColor: badgeBorder,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 3,
          marginBottom: 10
        }}
      >
        <Text 
          style={{ 
            color: badgeText,
            fontSize: 10,
            fontWeight: 'normal',
            textTransform: 'uppercase'
          }}
        >
          {category} • {code}
        </Text>
      </View>

      {/* Visual Road Sign Plate */}
      <View 
        style={{
          width: 140,
          height: 140,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 5
        }}
      >
        {/* 1. OCTAGON (STOP SIGN) */}
        {shape === 'octagon' && (
          <View
            style={{
              width: 124,
              height: 124,
              backgroundColor: bgColor,
              borderColor: '#ffffff',
              borderWidth: 4,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: textColor, fontSize: 26, fontWeight: 'bold', letterSpacing: 2 }}>
              {text || 'STOP'}
            </Text>
          </View>
        )}

        {/* 2. INVERTED TRIANGLE (GIVE WAY / YIELD) */}
        {shape === 'inverted_triangle' && (
          <View
            style={{
              width: 124,
              height: 124,
              backgroundColor: bgColor,
              borderColor: borderColor,
              borderWidth: 7,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ rotate: '180deg' }]
            }}
          >
            <View style={{ transform: [{ rotate: '180deg' }], alignItems: 'center' }}>
              <Text style={{ color: textColor, fontSize: 13, fontWeight: 'bold', textAlign: 'center', letterSpacing: 0.5 }}>
                {text || 'GIVE\nWAY'}
              </Text>
            </View>
          </View>
        )}

        {/* 3. WARNING TRIANGLE (YELLOW/RED BORDER) */}
        {shape === 'triangle' && (
          <View
            style={{
              width: 124,
              height: 124,
              backgroundColor: bgColor,
              borderColor: borderColor,
              borderWidth: 7,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon ? (
              <Ionicons name={icon} size={44} color="#0f172a" />
            ) : (
              <Text style={{ color: '#0f172a', fontSize: 14, fontWeight: 'bold' }}>
                {text}
              </Text>
            )}
          </View>
        )}

        {/* 4. CIRCLE (SPEED LIMIT, NO ENTRY, PROHIBITORY, MANDATORY) */}
        {shape === 'circle' && (
          <View
            style={{
              width: 124,
              height: 124,
              borderRadius: 62,
              backgroundColor: bgColor,
              borderColor: borderColor,
              borderWidth: 7,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {text ? (
              <View className="items-center justify-center">
                <Text style={{ color: textColor, fontSize: 32, fontWeight: 'bold' }}>
                  {text}
                </Text>
                {subText ? (
                  <Text style={{ color: textColor, fontSize: 9, fontWeight: 'bold', marginTop: -3 }}>
                    {subText}
                  </Text>
                ) : null}
              </View>
            ) : icon ? (
              <Ionicons name={icon} size={48} color={textColor} />
            ) : null}

            {/* Red diagonal slash for prohibitory signs */}
            {hasSlash && (
              <View
                style={{
                  position: 'absolute',
                  width: 130,
                  height: 6,
                  backgroundColor: '#dc2626',
                  transform: [{ rotate: '45deg' }]
                }}
              />
            )}
          </View>
        )}

        {/* 5. SQUARE / RECTANGLE (PEDESTRIAN, INFORMATORY) */}
        {shape === 'square' && (
          <View
            style={{
              width: 124,
              height: 124,
              backgroundColor: bgColor,
              borderColor: borderColor,
              borderWidth: 4,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon ? (
              <Ionicons name={icon} size={48} color={textColor} />
            ) : (
              <Text style={{ color: textColor, fontSize: 16, fontWeight: 'bold' }}>
                {text}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export default function DriverAssessmentScreen({ navigation }) {
  const { isDark } = useTheme();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('BEGINNER'); // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  const [selectedModule, setSelectedModule] = useState(2); // Default to Road Signs Module!
  const [inQuiz, setInQuiz] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Gamification: Streaks & XP Points
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);

  // Status and Leaderboard
  const [activeTab, setActiveTab] = useState('modules'); // 'modules' | 'leaderboard'
  const [driverCertificate, setDriverCertificate] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const themeStyles = {
    screenBg: isDark ? '#090d16' : '#ffffff',
    cardBg: isDark ? '#121927' : '#f8fafc',
    cardBorder: isDark ? '#1e293b' : '#e2e8f0',
    itemBg: isDark ? '#090d16' : '#ffffff',
    itemBorder: isDark ? '#1e293b' : '#cbd5e1',
    titleText: isDark ? '#ffffff' : '#047857',
    primaryText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    brandGreen: isDark ? '#00e588' : '#059669',
  };

  const SIMULATOR_MODULES = [
    {
      id: 2,
      title: 'FRSC Road Signs Challenge',
      badge: 'FEATURED GAME',
      icon: 'trail-sign-outline',
      duration: '15 Signs',
      description: 'Interactive visual road sign recognition: Regulatory, Warning, Mandatory & Priority signs.'
    },
    {
      id: 1,
      title: 'Customer Service & VIP Protocol',
      icon: 'star-outline',
      duration: '15 min',
      description: 'Executive etiquette, passenger communication, and professional de-escalation.'
    },
    {
      id: 3,
      title: 'Lane Discipline & Roundabouts',
      icon: 'git-merge-outline',
      duration: '15 min',
      description: 'Yellow box junctions, double solid lines, lane changes, and priority rules.'
    },
    {
      id: 4,
      title: 'Emergency & Wet Weather Hazard',
      icon: 'rainy-outline',
      duration: '15 min',
      description: 'Defensive maneuvers, brake failure protocols, and heavy tropical rain handling.'
    }
  ];

  const FALLBACK_QUESTIONS = {
    // MODULE 2: COMPREHENSIVE NIGERIAN & INTERNATIONAL ROAD SIGNS (VISUAL IDENTIFICATION)
    2: [
      {
        id: 201,
        sign: {
          shape: 'octagon',
          code: 'FRSC R-01',
          category: 'REGULATORY (MANDATORY)',
          bgColor: '#dc2626',
          textColor: '#ffffff',
          text: 'STOP'
        },
        question: 'What does this octagonal road sign mandate under the Nigerian Highway Code?',
        options: [
          'Bring the vehicle to a complete standstill behind the stop line, check all directions, and proceed only when clear.',
          'Slow down to 20 km/h and proceed without stopping if no cross-traffic is approaching.',
          'Honk loudly and maintain cruising speed to claim right of way.',
          'Stop only if traffic police or FRSC officers are physically standing on the road.'
        ],
        correct: 0,
        explanation: 'A STOP sign mandates a 100% complete halt of vehicle wheels at the demarcation line. Rolling through is a punishable traffic infraction.'
      },
      {
        id: 202,
        sign: {
          shape: 'inverted_triangle',
          code: 'FRSC R-02',
          category: 'REGULATORY (PRIORITY)',
          bgColor: '#ffffff',
          borderColor: '#dc2626',
          textColor: '#dc2626',
          text: 'GIVE\nWAY'
        },
        question: 'When approaching this inverted triangular road sign, what is required of the driver?',
        options: [
          'Accelerate quickly to cross the junction before oncoming vehicles arrive.',
          'Give way and yield the right of way to all traffic moving on the intersecting major road.',
          'Vehicles on the intersecting road must stop to allow you passage.',
          'Indicates that the speed limit restriction has ended.'
        ],
        correct: 1,
        explanation: 'An inverted triangle with red border mandates yielding priority to cross-traffic already traveling on the major carriageway.'
      },
      {
        id: 203,
        sign: {
          shape: 'circle',
          code: 'FRSC P-01',
          category: 'PROHIBITORY (NO ENTRY)',
          bgColor: '#dc2626',
          borderColor: '#ffffff',
          textColor: '#ffffff',
          icon: 'remove-outline'
        },
        question: 'What does this red circular sign with a thick white horizontal bar prohibit?',
        options: [
          'No parking between 8:00 AM and 6:00 PM on weekdays.',
          'Temporary road closure for official motorcade escort only.',
          'No Entry — Vehicular entry is strictly forbidden from this direction (One-Way violation).',
          'Expressway electronic toll collection booth ahead.'
        ],
        correct: 2,
        explanation: 'No Entry forbids any vehicle from entering the roadway in that direction. Entering constitutes driving against traffic (One-Way).'
      },
      {
        id: 204,
        sign: {
          shape: 'circle',
          code: 'FRSC R-10',
          category: 'REGULATORY (SPEED LIMIT)',
          bgColor: '#ffffff',
          borderColor: '#dc2626',
          textColor: '#0f172a',
          text: '100',
          subText: 'km/h'
        },
        question: 'What does this circular sign with a red border and the number "100" dictate?',
        options: [
          'Maximum statutory legal speed limit of 100 km/h on Federal Expressways for private cars.',
          'Minimum required speed on express lanes to prevent traffic congestion.',
          'Distance remaining to the next interstate interchange is 100 km.',
          'Speed limit strictly reserved for articulated commercial heavy trucks.'
        ],
        correct: 0,
        explanation: '100 km/h is the statutory maximum speed limit for motor cars on dual carriage expressways under FRSC regulations (80 km/h for commercial buses).'
      },
      {
        id: 205,
        sign: {
          shape: 'circle',
          code: 'FRSC R-11',
          category: 'REGULATORY (URBAN SPEED)',
          bgColor: '#ffffff',
          borderColor: '#dc2626',
          textColor: '#0f172a',
          text: '50',
          subText: 'km/h'
        },
        question: 'Where is this 50 km/h speed limit sign typically enforced across Nigeria?',
        options: [
          'On inter-state toll corridors during clear daylight conditions.',
          'Only inside international airport cargo terminals.',
          'Exclusively on express flyovers and elevated bridges.',
          'In built-up municipal areas, residential zones, and city centers to protect pedestrians.'
        ],
        correct: 3,
        explanation: '50 km/h is the legal maximum speed in all built-up urban zones and city streets to prevent severe pedestrian collisions.'
      },
      {
        id: 206,
        sign: {
          shape: 'triangle',
          code: 'FRSC W-08',
          category: 'WARNING (ROUNDABOUT)',
          bgColor: '#fef08a',
          borderColor: '#dc2626',
          icon: 'sync-outline'
        },
        question: 'What is the priority rule when approaching a junction marked by this Roundabout sign?',
        options: [
          'Vehicles approaching fastest toward the entry lane take absolute right-of-way.',
          'Give priority to vehicles approaching from your left already circulating inside the roundabout.',
          'Vehicles on the outside entering the roundabout take automatic priority.',
          'Maintain speed and honk continuously to force circular traffic to stop.'
        ],
        correct: 1,
        explanation: 'Traffic approaching a roundabout in Nigeria must give way to traffic on their left already circulating inside the roundabout.'
      },
      {
        id: 207,
        sign: {
          shape: 'triangle',
          code: 'FRSC W-15',
          category: 'WARNING (PEDESTRIAN)',
          bgColor: '#fef08a',
          borderColor: '#dc2626',
          icon: 'walk-outline'
        },
        question: 'What is a chauffeur legally required to do when seeing this Pedestrian Crossing sign?',
        options: [
          'Slow down and come to a complete stop if any pedestrian is crossing or waiting to cross.',
          'Honk the horn continuously to warn pedestrians not to step into the roadway.',
          'Accelerate smoothly to clear the crossing before the pedestrian reaches the center.',
          'Switch on emergency hazard flashers and drive through without stopping.'
        ],
        correct: 0,
        explanation: 'Pedestrians on or about to step onto zebra crossings have statutory right of way. Drivers must stop completely.'
      },
      {
        id: 208,
        sign: {
          shape: 'circle',
          code: 'FRSC P-04',
          category: 'PROHIBITORY (OVERTAKING)',
          bgColor: '#ffffff',
          borderColor: '#dc2626',
          icon: 'car-sport-outline'
        },
        question: 'What maneuver is strictly forbidden when driving past this No Overtaking sign?',
        options: [
          'Using your turn indicator to signal lane position.',
          'Driving at night with low-beam illumination.',
          'Passing or overtaking any moving motor vehicle ahead of you until the restriction ends.',
          'Coming to a stop to inspect tire pressure.'
        ],
        correct: 2,
        explanation: 'No Overtaking is placed along blind hill crests, sharp curves, or narrow corridors where passing risks severe head-on collisions.'
      },
      {
        id: 209,
        sign: {
          shape: 'circle',
          code: 'FRSC P-08',
          category: 'PROHIBITORY (U-TURN)',
          bgColor: '#ffffff',
          borderColor: '#dc2626',
          textColor: '#0f172a',
          icon: 'return-down-back-outline',
          hasSlash: true
        },
        question: 'What driving maneuver is banned by this road sign?',
        options: [
          'Turning left into an adjacent fuel filling station.',
          'Making a 180-degree U-turn to travel in the opposite direction.',
          'Parallel parking along the curbside.',
          'Reversing straight for less than 10 meters.'
        ],
        correct: 1,
        explanation: 'No U-Turn signs prohibit reversing direction across dual carriageways or intersections with high opposing traffic speed.'
      },
      {
        id: 210,
        sign: {
          shape: 'triangle',
          code: 'FRSC W-03',
          category: 'WARNING (DOUBLE BEND)',
          bgColor: '#fef08a',
          borderColor: '#dc2626',
          icon: 'git-network-outline'
        },
        question: 'How should a professional chauffeur negotiate a roadway marked with this Double Bend sign?',
        options: [
          'Accelerate aggressively into the first bend to slide through the second.',
          'Shift the transmission into neutral to freewheel through both corners.',
          'Overtake slower traffic before reaching the middle apex.',
          'Decelerate before the first corner, stay centered in your lane, and avoid abrupt braking mid-curve.'
        ],
        correct: 3,
        explanation: 'Braking before the turn and maintaining steady throttle through bends maintains tire traction and passenger comfort.'
      },
      {
        id: 211,
        sign: {
          shape: 'triangle',
          code: 'FRSC W-12',
          category: 'WARNING (NARROW BRIDGE)',
          bgColor: '#fef08a',
          borderColor: '#dc2626',
          icon: 'git-commit-outline'
        },
        question: 'When approaching a single-lane bridge marked with this sign, what is the right-of-way protocol?',
        options: [
          'Slow down, look for priority directional arrows, and yield to oncoming vehicles already crossing the bridge.',
          'The vehicle with the loudest horn or largest engine takes right of way.',
          'Speed up to cross the bridge before opposing cars can reach it.',
          'Overtake queued cars on the road shoulder.'
        ],
        correct: 0,
        explanation: 'Narrow bridges have restricted clearance. Drivers must decelerate and yield to vehicles already traversing the structure.'
      },
      {
        id: 212,
        sign: {
          shape: 'circle',
          code: 'FRSC P-15',
          category: 'PROHIBITORY (NO PARKING)',
          bgColor: '#2563eb',
          borderColor: '#dc2626',
          icon: 'close-outline',
          hasSlash: true
        },
        question: 'What does a circular blue sign with a red border and diagonal red slash mandate?',
        options: [
          'Free municipal parking lot available 24/7.',
          'Designated drop-off point for diplomatic escorts only.',
          'No Parking — Drivers are forbidden from leaving vehicles standing or unattended along this curb.',
          'Electric vehicle rapid charging station ahead.'
        ],
        correct: 2,
        explanation: 'No Parking prohibits unattended vehicle standing along the marked perimeter to ensure unhindered traffic flow.'
      },
      {
        id: 213,
        sign: {
          shape: 'circle',
          code: 'FRSC M-02',
          category: 'MANDATORY (OBLIGATION)',
          bgColor: '#2563eb',
          borderColor: '#ffffff',
          textColor: '#ffffff',
          icon: 'arrow-forward-outline'
        },
        question: 'What do circular blue signs with white symbols indicate in the Highway Code?',
        options: [
          'Optional advisory suggestions that can be ignored at night.',
          'Mandatory positive instruction — Road users are legally obligated to obey the specific action indicated.',
          'Tourist and leisure landmark directions.',
          'Private security road restriction.'
        ],
        correct: 1,
        explanation: 'Blue circular signs convey mandatory positive instructions. Disobeying them is an offense.'
      },
      {
        id: 214,
        sign: {
          shape: 'circle',
          code: 'FRSC P-22',
          category: 'PROHIBITORY (SILENT ZONE)',
          bgColor: '#ffffff',
          borderColor: '#dc2626',
          icon: 'volume-mute-outline',
          hasSlash: true
        },
        question: 'What does this road sign indicate when passing hospitals, courts, or schools?',
        options: [
          'Silent Zone / No Horn — Sounding vehicle horns is strictly prohibited in this vicinity.',
          'Horn is mandatory to alert patients inside the hospital.',
          'Car audio system must be turned to full volume.',
          'Vehicle muffler must be checked for exhaust noise.'
        ],
        correct: 0,
        explanation: 'Silent Zones protect hospitals and schools from noise disturbance. Sounding horns here attracts FRSC enforcement.'
      },
      {
        id: 215,
        sign: {
          shape: 'triangle',
          code: 'FRSC W-20',
          category: 'WARNING (SPEED HUMP)',
          bgColor: '#fef08a',
          borderColor: '#dc2626',
          icon: 'ellipsis-horizontal-outline'
        },
        question: 'What is the consequence of failing to brake smoothly before a speed hump marked with this sign?',
        options: [
          'Immediate fine from automated satellite cameras.',
          'Radiator overheating within 5 minutes.',
          'Tire air pressure will instantly drop to zero.',
          'Severe passenger discomfort, suspension damage, scraping chassis, and potential loss of steering control.'
        ],
        correct: 3,
        explanation: 'Speed humps calm traffic in residential/school zones. Chauffeurs must brake smoothly to maintain VIP comfort and vehicle integrity.'
      }
    ],

    // MODULE 1: CUSTOMER SERVICE & VIP PROTOCOL
    1: [
      {
        id: 101,
        question: 'A high-profile passenger becomes agitated due to intense traffic gridlock. What is the standard professional response?',
        options: [
          'Remain calm, acknowledge their concern politely, and focus safely on navigation.',
          'Argue back and explain that Nigerian traffic is not your fault.',
          'Cancel the trip immediately and ask the passenger to exit into traffic.',
          'Turn up the radio volume to drown out their comments.'
        ],
        correct: 0,
        explanation: 'Executive chauffeurs maintain composure, empathize respectfully, and ensure a calm cabin atmosphere.'
      },
      {
        id: 102,
        question: 'Before welcoming an executive passenger, what essential cabin checks are required?',
        options: [
          'Pristine seats, clean interior, working air conditioning, and zero personal clutter.',
          'Driver personal belongings placed across the back passenger seat.',
          'Windows fully down in dusty traffic to save fuel.',
          'No preparation needed if the vehicle was washed two days ago.'
        ],
        correct: 0,
        explanation: 'A clean, odor-neutral, climate-controlled cabin is standard for 5-star chauffeur service.'
      },
      {
        id: 103,
        question: 'A passenger leaves an expensive smartphone or wrist watch in the back seat. What is your mandatory protocol?',
        options: [
          'Report item immediately on OgaDriver app and arrange safe return through verified support.',
          'Keep the device as a tip for good service.',
          'Hand it to a roadside vendor for safekeeping.',
          'Wait until the passenger contacts you after several weeks.'
        ],
        correct: 0,
        explanation: 'Integrity and instant lost-and-found reporting protect your partner license and earn trust badges.'
      }
    ],

    // MODULE 3: LANE DISCIPLINE & ROUNDABOUTS
    3: [
      {
        id: 301,
        sign: {
          shape: 'square',
          code: 'FRSC M-05',
          category: 'ROAD MARKING (BARRIER)',
          bgColor: '#0f172a',
          borderColor: '#f59e0b',
          textColor: '#f59e0b',
          text: '══ ══\nDOUBLE SOLID'
        },
        question: 'What is the strict legal meaning of double solid yellow lines painted along the road center?',
        options: [
          'Overtaking and lane crossing are strictly prohibited in both directions.',
          'Overtaking is permissible only during daylight hours.',
          'Vehicles may park on either side for short stops.',
          'The right lane is strictly dedicated to articulated lorries.'
        ],
        correct: 0,
        explanation: 'Double solid center lines form a legal barrier: overtaking across them is a severe traffic infraction.'
      },
      {
        id: 302,
        sign: {
          shape: 'square',
          code: 'FRSC M-08',
          category: 'ROAD MARKING (JUNCTION)',
          bgColor: '#0f172a',
          borderColor: '#f59e0b',
          textColor: '#f59e0b',
          text: '☒ ☒\nYELLOW BOX'
        },
        question: 'When approaching a Yellow Box Junction grid, when may a driver lawfully enter the box?',
        options: [
          'Only when the exit road is clear and your vehicle can exit without blocking cross traffic.',
          'Whenever the traffic signal turns green, regardless of exit gridlock.',
          'To make a quick turn even if your car will block oncoming lanes.',
          'At any time if driving a commercial passenger vehicle.'
        ],
        correct: 0,
        explanation: 'Never enter a yellow box unless your vehicle has a clear exit passage to prevent gridlock.'
      }
    ],

    // MODULE 4: EMERGENCY & WET WEATHER HAZARD
    4: [
      {
        id: 401,
        sign: {
          shape: 'triangle',
          code: 'FRSC W-24',
          category: 'HAZARD (SLIPPERY ROAD)',
          bgColor: '#fef08a',
          borderColor: '#dc2626',
          icon: 'rainy-outline'
        },
        question: 'When driving in heavy tropical rainfall with reduced visibility, what driving practice is mandatory?',
        options: [
          'Increase following distance, turn on low-beam headlights, and reduce speed smoothly.',
          'Turn on hazard blinkers and overtake vehicles to escape the rain zone quickly.',
          'Tailgate the vehicle ahead to track its tyre paths closely.',
          'Use cruise control to maintain a steady speed across standing puddles.'
        ],
        correct: 0,
        explanation: 'Wet asphalt increases braking distance dramatically; low-beams and ample headway prevent hydroplaning.'
      },
      {
        id: 402,
        sign: {
          shape: 'triangle',
          code: 'FRSC W-28',
          category: 'HAZARD (BRAKE FAILURE)',
          bgColor: '#fef08a',
          borderColor: '#dc2626',
          icon: 'warning-outline'
        },
        question: 'What is the correct immediate action if your foot brakes fail while driving on an expressway slope?',
        options: [
          'Pump foot brake, drop to lower engine gears, apply handbrake gradually, and steer to an escape path.',
          'Turn off the engine ignition key immediately while at high speed.',
          'Jump out of the moving vehicle onto the shoulder.',
          'Shift directly into Reverse gear while driving forward.'
        ],
        correct: 0,
        explanation: 'Engine braking downshifts and modulated handbrake application bring a vehicle to a controlled halt safely.'
      }
    ]
  };

  useEffect(() => {
    loadDriverCertificate();
    loadQuestionsForModule(selectedModule);
  }, []);

  useEffect(() => {
    loadQuestionsForModule(selectedModule);
  }, [selectedModule]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboardData();
    }
  }, [activeTab, difficulty]);

  const loadDriverCertificate = async () => {
    try {
      const res = await simulatorService.getCertificate();
      if (res?.success && res.data) {
        setDriverCertificate(res.data);
      }
    } catch (e) {
      // Non-blocking
    }
  };

  const loadLeaderboardData = async () => {
    try {
      setLoadingLeaderboard(true);
      const res = await simulatorService.getLeaderboard(difficulty.toLowerCase());
      if (res?.success && Array.isArray(res.data)) {
        setLeaderboard(res.data);
      } else {
        setLeaderboard([
          { id: 1, name: 'Chinedu Eze', score: 100, difficulty: difficulty, completed_at: '2026-10-10' },
          { id: 2, name: 'Babatunde Alao', score: 95, difficulty: difficulty, completed_at: '2026-10-11' },
          { id: 3, name: 'Emeka Nwosu', score: 90, difficulty: difficulty, completed_at: '2026-10-12' },
          { id: 4, name: 'Ibrahim Danladi', score: 85, difficulty: difficulty, completed_at: '2026-10-12' },
        ]);
      }
    } catch (e) {
      setLeaderboard([
        { id: 1, name: 'Chinedu Eze', score: 100, difficulty: difficulty, completed_at: '2026-10-10' },
        { id: 2, name: 'Babatunde Alao', score: 95, difficulty: difficulty, completed_at: '2026-10-11' },
        { id: 3, name: 'Emeka Nwosu', score: 90, difficulty: difficulty, completed_at: '2026-10-12' },
      ]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const loadQuestionsForModule = async (moduleId) => {
    try {
      setLoading(true);
      const res = await simulatorService.getQuestions(moduleId);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setQuestions(res.data);
      } else {
        setQuestions(FALLBACK_QUESTIONS[moduleId] || FALLBACK_QUESTIONS[1]);
      }
    } catch (e) {
      setQuestions(FALLBACK_QUESTIONS[moduleId] || FALLBACK_QUESTIONS[1]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (inQuiz && !quizFinished) {
      Alert.alert(
        'Exit Simulation?',
        'Your current test session will be cancelled. Are you sure you want to return to simulator menu?',
        [
          { text: 'Keep Going', style: 'cancel' },
          { text: 'Exit Test', style: 'destructive', onPress: () => setInQuiz(false) }
        ]
      );
    } else if (inQuiz && quizFinished) {
      setInQuiz(false);
    } else {
      navigation?.goBack();
    }
  };

  const handleStartSimulation = () => {
    setAnswers({});
    setCurrentQ(0);
    setQuizFinished(false);
    setFinalScore(0);
    setStreak(0);
    setPoints(0);
    setInQuiz(true);
  };

  const handleSelect = (idx) => {
    if (answers[currentQ] !== undefined) return;
    
    const isCorrect = idx === (questions[currentQ]?.correct ?? 0);
    setAnswers((prev) => ({ ...prev, [currentQ]: idx }));

    if (isCorrect) {
      setStreak((prev) => {
        const nextStreak = prev + 1;
        const streakBonus = (nextStreak - 1) * 10;
        setPoints((p) => p + 100 + streakBonus);
        return nextStreak;
      });
    } else {
      setStreak(0);
    }
  };

  const nextQ = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const submitScore = async () => {
    let correctCount = 0;
    const totalQ = questions.length || 1;
    
    questions.forEach((q, idx) => {
      const selected = answers[idx];
      const correctIdx = q.correct ?? 0;
      if (selected === correctIdx) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / totalQ) * 100);
    setFinalScore(calculatedScore);
    setQuizFinished(true);

    try {
      setSubmitting(true);
      const res = await simulatorService.saveResult(calculatedScore, difficulty.toLowerCase());
      if (res?.data) {
        setDriverCertificate((prev) => ({
          ...prev,
          score: res.data.score || calculatedScore,
          difficulty: res.data.difficulty || difficulty.toLowerCase(),
          completed_at: new Date().toISOString(),
        }));
      }
    } catch (e) {
      // Non-blocking
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.screenBg }}>
      {/* Top Header Bar with Back navigation */}
      <HeaderBar 
        navigation={navigation} 
        title="Driver Simulator Game" 
        subtitle="Highway code & defensive tactics"
        showBack={true}
        onBack={handleBackPress}
      />

      <ScrollView className="flex-1 px-4 pt-3 pb-12" showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <View className="mb-4">
          <Text style={{ color: themeStyles.titleText, fontSize: 24, fontWeight: 'normal' }}>
            Driver Simulator Game
          </Text>
          <Text style={{ color: themeStyles.subText, fontSize: 13, marginTop: 2, fontWeight: 'normal' }}>
            Interactive Nigerian road code, security protocols & defensive mastery
          </Text>
        </View>

        {!inQuiz ? (
          <>
            {/* Top Navigation Tabs: Modules vs Leaderboard */}
            <View 
              style={{
                backgroundColor: themeStyles.cardBg,
                borderColor: themeStyles.cardBorder,
                borderWidth: 1
              }}
              className="flex-row rounded-2xl p-1 mb-4"
            >
              <TouchableOpacity
                onPress={() => setActiveTab('modules')}
                style={{
                  backgroundColor: activeTab === 'modules' ? themeStyles.brandGreen : 'transparent'
                }}
                className="flex-1 py-2.5 rounded-xl items-center justify-center flex-row"
              >
                <Ionicons 
                  name="shield-checkmark-outline" 
                  size={16} 
                  color={activeTab === 'modules' ? '#090d16' : themeStyles.primaryText} 
                  className="mr-1.5" 
                />
                <Text 
                  style={{
                    color: activeTab === 'modules' ? '#090d16' : themeStyles.primaryText,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginLeft: 6
                  }}
                >
                  Training Modules
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('leaderboard')}
                style={{
                  backgroundColor: activeTab === 'leaderboard' ? themeStyles.brandGreen : 'transparent'
                }}
                className="flex-1 py-2.5 rounded-xl items-center justify-center flex-row"
              >
                <Ionicons 
                  name="trophy-outline" 
                  size={16} 
                  color={activeTab === 'leaderboard' ? '#090d16' : themeStyles.primaryText} 
                  className="mr-1.5" 
                />
                <Text 
                  style={{
                    color: activeTab === 'leaderboard' ? '#090d16' : themeStyles.primaryText,
                    fontSize: 12,
                    fontWeight: 'normal',
                    marginLeft: 6
                  }}
                >
                  Leaderboard
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'modules' ? (
              <>
                {/* 1. Main Welcome & Accreditation Status Banner */}
                <View 
                  style={{
                    backgroundColor: themeStyles.cardBg,
                    borderColor: themeStyles.cardBorder,
                    borderWidth: 1
                  }}
                  className="rounded-3xl p-5 mb-4 shadow-md"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View 
                        style={{
                          backgroundColor: isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)',
                          borderColor: themeStyles.brandGreen,
                          borderWidth: 1
                        }}
                        className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                      >
                        <Ionicons name="game-controller" size={24} color={themeStyles.brandGreen} />
                      </View>
                      <View className="flex-1">
                        <Text style={{ color: themeStyles.primaryText, fontSize: 16, fontWeight: 'normal' }}>
                          Road Safety Simulator
                        </Text>
                        <Text style={{ color: themeStyles.subText, fontSize: 12, fontWeight: 'normal', marginTop: 1 }}>
                          Live simulation for verified partner standards
                        </Text>
                      </View>
                    </View>

                    {/* Sound & Controls */}
                    <TouchableOpacity
                      onPress={() => setSoundEnabled(!soundEnabled)}
                      style={{
                        backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                        borderWidth: 1
                      }}
                      className="p-2 rounded-xl"
                    >
                      <Ionicons 
                        name={soundEnabled ? "volume-high-outline" : "volume-mute-outline"} 
                        size={18} 
                        color={soundEnabled ? themeStyles.brandGreen : themeStyles.subText} 
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{ color: themeStyles.subText, fontSize: 12, lineHeight: 18, fontWeight: 'normal', marginBottom: 12 }}>
                    Test your knowledge against official FRSC regulations, LASTMA lane protocols, bad-weather hazard mitigation, and executive passenger etiquette.
                  </Text>

                  {/* Driver Accreditation Status Ribbon */}
                  {driverCertificate?.score ? (
                    <View 
                      style={{
                        backgroundColor: isDark ? 'rgba(0, 229, 136, 0.1)' : 'rgba(5, 150, 105, 0.08)',
                        borderColor: themeStyles.brandGreen,
                        borderWidth: 1
                      }}
                      className="p-3 rounded-2xl flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1 mr-2">
                        <Ionicons name="ribbon" size={18} color={themeStyles.brandGreen} className="mr-2" />
                        <View className="flex-1 ml-2">
                          <Text style={{ color: themeStyles.brandGreen, fontSize: 12, fontWeight: 'normal' }}>
                            Accredited Chauffeur Rating
                          </Text>
                          <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal', marginTop: 1 }}>
                            High Score: {driverCertificate.score}% • Tier: {String(driverCertificate.difficulty || 'Beginner').toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View 
                        style={{ backgroundColor: themeStyles.brandGreen }} 
                        className="px-2.5 py-1 rounded-full"
                      >
                        <Text className="text-slate-950 text-[10px] uppercase font-normal">
                          Verified ✓
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View 
                      style={{
                        backgroundColor: isDark ? 'rgba(0, 229, 136, 0.1)' : 'rgba(5, 150, 105, 0.08)',
                        borderColor: themeStyles.brandGreen,
                        borderWidth: 1
                      }}
                      className="p-3 rounded-2xl flex-row items-center"
                    >
                      <Ionicons name="information-circle-outline" size={18} color={themeStyles.brandGreen} className="mr-2" />
                      <Text style={{ color: themeStyles.brandGreen, fontSize: 11, fontWeight: 'normal', flex: 1, marginLeft: 6 }}>
                        Score 70%+ on any module to earn accreditation, unlock priority ride dispatch, and merit for Instant Fuel Advance.
                      </Text>
                    </View>
                  )}
                </View>

                {/* 2. Difficulty Selector */}
                <View 
                  style={{
                    backgroundColor: themeStyles.cardBg,
                    borderColor: themeStyles.cardBorder,
                    borderWidth: 1
                  }}
                  className="rounded-3xl p-5 mb-4 shadow-sm"
                >
                  <Text style={{ color: themeStyles.primaryText, fontSize: 14, fontWeight: 'normal', marginBottom: 3 }}>
                    Select Difficulty Level
                  </Text>
                  <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 12 }}>
                    Higher difficulty yields greater platform merit score boost
                  </Text>

                  <View className="flex-row flex-wrap justify-between">
                    {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((lvl) => {
                      const isSelected = difficulty === lvl;
                      return (
                        <TouchableOpacity
                          key={lvl}
                          onPress={() => setDifficulty(lvl)}
                          style={{
                            backgroundColor: isSelected 
                              ? (isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)')
                              : themeStyles.itemBg,
                            borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
                            borderWidth: 1,
                            width: '48%',
                            paddingVertical: 10,
                            paddingHorizontal: 8,
                            borderRadius: 14,
                            marginBottom: 8,
                            alignItems: 'center'
                          }}
                        >
                          <Text 
                            style={{
                              color: isSelected ? themeStyles.brandGreen : themeStyles.primaryText,
                              fontSize: 12,
                              fontWeight: 'normal'
                            }}
                          >
                            {lvl}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 3. Training Modules Grid */}
                <View 
                  style={{
                    backgroundColor: themeStyles.cardBg,
                    borderColor: themeStyles.cardBorder,
                    borderWidth: 1
                  }}
                  className="rounded-3xl p-5 mb-4 shadow-sm"
                >
                  <Text style={{ color: themeStyles.primaryText, fontSize: 14, fontWeight: 'normal', marginBottom: 3 }}>
                    Choose Training Module
                  </Text>
                  <Text style={{ color: themeStyles.subText, fontSize: 11, fontWeight: 'normal', marginBottom: 12 }}>
                    Select a topic to launch the interactive simulation
                  </Text>

                  <View className="space-y-2.5">
                    {SIMULATOR_MODULES.map((mod) => {
                      const isSelected = selectedModule === mod.id;
                      return (
                        <TouchableOpacity
                          key={mod.id}
                          onPress={() => setSelectedModule(mod.id)}
                          style={{
                            backgroundColor: isSelected 
                              ? (isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.1)')
                              : themeStyles.itemBg,
                            borderColor: isSelected ? themeStyles.brandGreen : themeStyles.cardBorder,
                            borderWidth: 1
                          }}
                          className="p-3.5 rounded-2xl flex-row items-center justify-between mb-2"
                        >
                          <View className="flex-row items-center flex-1 mr-3">
                            <View 
                              style={{
                                backgroundColor: isSelected ? themeStyles.brandGreen : (isDark ? '#1e293b' : '#e2e8f0'),
                              }}
                              className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                            >
                              <Ionicons 
                                name={mod.icon} 
                                size={18} 
                                color={isSelected ? '#090d16' : themeStyles.primaryText} 
                              />
                            </View>
                            <View className="flex-1">
                              <Text style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal' }}>
                                {mod.title}
                              </Text>
                              <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal', marginTop: 1 }} numberOfLines={1}>
                                {mod.description}
                              </Text>
                            </View>
                          </View>
                          <View className="items-end">
                            <Text style={{ color: themeStyles.brandGreen, fontSize: 11, fontWeight: 'normal' }}>
                              {mod.duration}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Launch Simulation CTA */}
                <TouchableOpacity
                  onPress={handleStartSimulation}
                  disabled={loading}
                  style={{
                    backgroundColor: themeStyles.brandGreen,
                    shadowColor: themeStyles.brandGreen,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6
                  }}
                  className="py-4 rounded-2xl items-center justify-center mb-8"
                >
                  {loading ? (
                    <ActivityIndicator color="#090d16" />
                  ) : (
                    <Text className="text-slate-950 text-sm uppercase tracking-wider font-normal">
                      Start Interactive Simulation
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              /* Leaderboard View */
              <View 
                style={{
                  backgroundColor: themeStyles.cardBg,
                  borderColor: themeStyles.cardBorder,
                  borderWidth: 1
                }}
                className="rounded-3xl p-5 mb-8 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text style={{ color: themeStyles.primaryText, fontSize: 16, fontWeight: 'normal' }}>
                      Top Certified Chauffeurs
                    </Text>
                    <Text style={{ color: themeStyles.subText, fontSize: 12, fontWeight: 'normal', marginTop: 1 }}>
                      Nationwide performance ranking in {difficulty}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={loadLeaderboardData}
                    className="p-2"
                  >
                    <Ionicons name="refresh-outline" size={18} color={themeStyles.brandGreen} />
                  </TouchableOpacity>
                </View>

                {loadingLeaderboard ? (
                  <View className="py-12 items-center justify-center">
                    <ActivityIndicator color={themeStyles.brandGreen} />
                    <Text style={{ color: themeStyles.subText, fontSize: 12, marginTop: 8 }}>
                      Loading leaderboard...
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-2 mt-2">
                    {leaderboard.map((item, idx) => (
                      <View 
                        key={item.id || idx}
                        style={{
                          backgroundColor: themeStyles.itemBg,
                          borderColor: themeStyles.cardBorder,
                          borderWidth: 1
                        }}
                        className="p-3.5 rounded-2xl flex-row items-center justify-between mb-2"
                      >
                        <View className="flex-row items-center flex-1 mr-2">
                          <View 
                            style={{
                              backgroundColor: idx === 0 
                                ? '#f59e0b' 
                                : idx === 1 
                                ? '#94a3b8' 
                                : idx === 2 
                                ? '#b45309' 
                                : (isDark ? '#1e293b' : '#e2e8f0')
                            }}
                            className="w-7 h-7 rounded-full items-center justify-center mr-3"
                          >
                            <Text 
                              style={{ 
                                color: idx < 3 ? '#ffffff' : themeStyles.subText, 
                                fontSize: 11, 
                                fontWeight: 'normal' 
                              }}
                            >
                              {idx + 1}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text style={{ color: themeStyles.primaryText, fontSize: 13, fontWeight: 'normal' }}>
                              {item.name}
                            </Text>
                            <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal', marginTop: 1 }}>
                              Accredited Chauffeur
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text style={{ color: themeStyles.brandGreen, fontSize: 14, fontWeight: 'normal' }}>
                            {item.score}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        ) : quizFinished ? (
          /* Quiz Results & Certificate Card */
          <View 
            style={{
              backgroundColor: themeStyles.cardBg,
              borderColor: themeStyles.cardBorder,
              borderWidth: 1
            }}
            className="rounded-3xl p-6 mb-8 items-center shadow-xl"
          >
            <View 
              style={{
                backgroundColor: finalScore >= 70 ? 'rgba(0, 229, 136, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: finalScore >= 70 ? themeStyles.brandGreen : '#ef4444',
                borderWidth: 2
              }}
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
            >
              <Ionicons 
                name={finalScore >= 70 ? "ribbon" : "alert-circle"} 
                size={38} 
                color={finalScore >= 70 ? themeStyles.brandGreen : '#ef4444'} 
              />
            </View>

            <Text style={{ color: themeStyles.primaryText, fontSize: 22, fontWeight: 'normal', marginBottom: 2 }}>
              {finalScore >= 70 ? 'Simulation Passed!' : 'Need More Practice'}
            </Text>
            <Text style={{ color: themeStyles.subText, fontSize: 13, fontWeight: 'normal', textAlign: 'center', marginBottom: 16 }}>
              {finalScore >= 70 
                ? `You achieved an outstanding ${finalScore}% in ${difficulty} tier.`
                : `You achieved ${finalScore}%. Passing grade is 70% to qualify for instant fuel advances.`
              }
            </Text>

            {/* Score Breakdown Pill */}
            <View 
              style={{
                backgroundColor: themeStyles.itemBg,
                borderColor: themeStyles.cardBorder,
                borderWidth: 1
              }}
              className="w-full p-4 rounded-2xl mb-6 flex-row justify-around"
            >
              <View className="items-center">
                <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>SCORE</Text>
                <Text style={{ color: themeStyles.brandGreen, fontSize: 18, fontWeight: 'normal', marginTop: 2 }}>
                  {finalScore}%
                </Text>
              </View>
              <View className="items-center">
                <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>XP EARNED</Text>
                <Text style={{ color: '#f59e0b', fontSize: 16, fontWeight: 'normal', marginTop: 2 }}>
                  +{points} XP
                </Text>
              </View>
              <View className="items-center">
                <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>TIER</Text>
                <Text style={{ color: themeStyles.primaryText, fontSize: 14, fontWeight: 'normal', marginTop: 2 }}>
                  {difficulty}
                </Text>
              </View>
              <View className="items-center">
                <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>STATUS</Text>
                <Text style={{ color: finalScore >= 70 ? themeStyles.brandGreen : '#f59e0b', fontSize: 14, fontWeight: 'normal', marginTop: 2 }}>
                  {finalScore >= 70 ? 'Certified ✓' : 'Retry'}
                </Text>
              </View>
            </View>

            {/* Benefits Unlocked on Pass */}
            {finalScore >= 70 && (
              <View 
                style={{
                  backgroundColor: isDark ? 'rgba(0, 229, 136, 0.08)' : 'rgba(5, 150, 105, 0.08)',
                  borderColor: themeStyles.brandGreen,
                  borderWidth: 1
                }}
                className="w-full p-4 rounded-2xl mb-6"
              >
                <Text style={{ color: themeStyles.brandGreen, fontSize: 12, fontWeight: 'normal', marginBottom: 4 }}>
                  Benefits Earned:
                </Text>
                <Text style={{ color: themeStyles.subText, fontSize: 11, lineHeight: 18, fontWeight: 'normal' }}>
                  • +15 Platform Merit Rating boost{'\n'}
                  • Priority Dispatch Queue for Executive & VIP trips{'\n'}
                  • Qualification merit towards 0% Instant Fuel Advances{'\n'}
                  • Chauffeur Safety Badge displayed on your profile
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <TouchableOpacity
              onPress={handleStartSimulation}
              style={{ backgroundColor: themeStyles.brandGreen }}
              className="w-full py-3.5 rounded-2xl items-center justify-center mb-3"
            >
              <Text className="text-slate-950 text-xs uppercase tracking-wider font-normal">
                Retake Simulation
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setInQuiz(false)}
              style={{
                backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                borderWidth: 1
              }}
              className="w-full py-3.5 rounded-2xl items-center justify-center"
            >
              <Text style={{ color: themeStyles.primaryText, fontSize: 12, fontWeight: 'normal' }}>
                Return to Simulator Modules
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Active Road Sign Simulation Question */
          <View 
            style={{
              backgroundColor: themeStyles.cardBg,
              borderColor: themeStyles.cardBorder,
              borderWidth: 1
            }}
            className="rounded-3xl p-5 mb-8 shadow-xl"
          >
            {/* Top HUD: Question Progress + XP + Streak + Difficulty */}
            <View 
              style={{ borderBottomColor: themeStyles.cardBorder, borderBottomWidth: 1 }} 
              className="flex-row justify-between items-center mb-3 pb-3"
            >
              <View>
                <Text style={{ color: themeStyles.brandGreen, fontSize: 12, fontWeight: 'normal' }}>
                  Question {currentQ + 1} of {questions.length}
                </Text>
                <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal', marginTop: 1 }}>
                  FRSC Highway Code Game
                </Text>
              </View>

              <View className="flex-row items-center">
                {/* Score / XP Pill */}
                <View 
                  style={{ 
                    backgroundColor: isDark ? 'rgba(0, 229, 136, 0.12)' : 'rgba(5, 150, 105, 0.1)',
                    borderColor: themeStyles.brandGreen,
                    borderWidth: 1
                  }} 
                  className="px-2.5 py-1 rounded-full flex-row items-center mr-1.5"
                >
                  <Text style={{ fontSize: 10 }}>🏆 </Text>
                  <Text style={{ color: themeStyles.brandGreen, fontSize: 11, fontWeight: 'normal' }}>
                    {points} XP
                  </Text>
                </View>

                {/* Streak Badge (if streak > 0) */}
                {streak > 0 && (
                  <View 
                    style={{ 
                      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.12)',
                      borderColor: '#f59e0b',
                      borderWidth: 1
                    }} 
                    className="px-2 py-1 rounded-full flex-row items-center mr-1.5"
                  >
                    <Text style={{ fontSize: 10 }}>🔥 </Text>
                    <Text style={{ color: '#f59e0b', fontSize: 10, fontWeight: 'normal' }}>
                      {streak}
                    </Text>
                  </View>
                )}

                {/* Difficulty Pill */}
                <View 
                  style={{ backgroundColor: themeStyles.itemBg, borderColor: themeStyles.cardBorder, borderWidth: 1 }} 
                  className="px-2.5 py-1 rounded-full"
                >
                  <Text style={{ color: themeStyles.subText, fontSize: 10, fontWeight: 'normal' }}>
                    {difficulty}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View 
              style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }} 
              className="w-full h-1.5 rounded-full mb-4 overflow-hidden"
            >
              <View 
                style={{ 
                  backgroundColor: themeStyles.brandGreen, 
                  width: `${((currentQ + 1) / (questions.length || 1)) * 100}%` 
                }} 
                className="h-full rounded-full" 
              />
            </View>

            {/* Visual Road Sign Graphic Plate (if sign metadata exists) */}
            {questions[currentQ]?.sign && (
              <RoadSignVisualizer sign={questions[currentQ].sign} isDark={isDark} />
            )}

            {/* Question Text */}
            <Text style={{ color: themeStyles.primaryText, fontSize: 15, lineHeight: 22, fontWeight: 'normal', marginVertical: 14 }}>
              {questions[currentQ]?.question || questions[currentQ]?.text || 'What does this road sign mandate under Nigerian road regulations?'}
            </Text>

            {/* 4 Interactive Option Choices */}
            <View className="space-y-2.5 mb-4">
              {(questions[currentQ]?.options || []).map((opt, idx) => {
                const isAnswered = answers[currentQ] !== undefined;
                const isSelected = answers[currentQ] === idx;
                const isCorrect = idx === (questions[currentQ]?.correct ?? 0);
                const letters = ['A', 'B', 'C', 'D'];

                let itemBg = themeStyles.itemBg;
                let itemBorder = themeStyles.cardBorder;
                let textColor = themeStyles.primaryText;
                let badgeBg = isDark ? '#1e293b' : '#e2e8f0';
                let badgeText = themeStyles.subText;
                let statusIcon = null;

                if (isAnswered) {
                  if (isCorrect) {
                    itemBg = isDark ? 'rgba(0, 229, 136, 0.16)' : 'rgba(5, 150, 105, 0.12)';
                    itemBorder = themeStyles.brandGreen;
                    textColor = themeStyles.brandGreen;
                    badgeBg = themeStyles.brandGreen;
                    badgeText = '#090d16';
                    statusIcon = 'checkmark-circle';
                  } else if (isSelected && !isCorrect) {
                    itemBg = isDark ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.12)';
                    itemBorder = '#ef4444';
                    textColor = '#ef4444';
                    badgeBg = '#ef4444';
                    badgeText = '#ffffff';
                    statusIcon = 'close-circle';
                  }
                } else if (isSelected) {
                  itemBg = isDark ? 'rgba(0, 229, 136, 0.15)' : 'rgba(5, 150, 105, 0.12)';
                  itemBorder = themeStyles.brandGreen;
                  textColor = themeStyles.brandGreen;
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    disabled={isAnswered}
                    onPress={() => handleSelect(idx)}
                    style={{
                      backgroundColor: itemBg,
                      borderColor: itemBorder,
                      borderWidth: 1
                    }}
                    className="p-3.5 rounded-2xl mb-2.5 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View 
                        style={{ backgroundColor: badgeBg }}
                        className="w-7 h-7 rounded-xl items-center justify-center mr-3"
                      >
                        <Text style={{ color: badgeText, fontSize: 11, fontWeight: 'normal' }}>
                          {letters[idx] || `${idx + 1}`}
                        </Text>
                      </View>
                      <Text 
                        style={{
                          color: textColor,
                          fontSize: 13,
                          lineHeight: 18,
                          fontWeight: 'normal',
                          flex: 1
                        }}
                      >
                        {opt}
                      </Text>
                    </View>

                    {statusIcon && (
                      <Ionicons 
                        name={statusIcon} 
                        size={20} 
                        color={statusIcon === 'checkmark-circle' ? themeStyles.brandGreen : '#ef4444'} 
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Instant Answer Feedback & FRSC Highway Protocol Rationale */}
            {answers[currentQ] !== undefined && (
              <View 
                style={{
                  backgroundColor: answers[currentQ] === (questions[currentQ]?.correct ?? 0)
                    ? (isDark ? 'rgba(0, 229, 136, 0.1)' : 'rgba(5, 150, 105, 0.08)')
                    : (isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)'),
                  borderColor: answers[currentQ] === (questions[currentQ]?.correct ?? 0)
                    ? themeStyles.brandGreen
                    : '#ef4444',
                  borderWidth: 1
                }}
                className="p-3.5 rounded-2xl mb-5"
              >
                <View className="flex-row items-center mb-1">
                  <Ionicons 
                    name={answers[currentQ] === (questions[currentQ]?.correct ?? 0) ? "checkmark-circle" : "alert-circle"} 
                    size={16} 
                    color={answers[currentQ] === (questions[currentQ]?.correct ?? 0) ? themeStyles.brandGreen : "#ef4444"} 
                  />
                  <Text 
                    style={{ 
                      color: answers[currentQ] === (questions[currentQ]?.correct ?? 0) ? themeStyles.brandGreen : "#ef4444", 
                      fontSize: 12, 
                      fontWeight: 'normal',
                      marginLeft: 6
                    }}
                  >
                    {answers[currentQ] === (questions[currentQ]?.correct ?? 0) 
                      ? `Correct Answer! +100 XP ${streak > 1 ? `(🔥 ${streak}x Streak!)` : ''}`
                      : 'Incorrect — FRSC Protocol Violation'
                    }
                  </Text>
                </View>
                
                {answers[currentQ] !== (questions[currentQ]?.correct ?? 0) && (
                  <Text style={{ color: themeStyles.primaryText, fontSize: 11, fontWeight: 'normal', marginBottom: 4 }}>
                    Correct: {questions[currentQ]?.options?.[questions[currentQ]?.correct ?? 0]}
                  </Text>
                )}

                {questions[currentQ]?.explanation && (
                  <Text style={{ color: themeStyles.subText, fontSize: 11, lineHeight: 16, fontWeight: 'normal' }}>
                    FRSC Rule: {questions[currentQ]?.explanation}
                  </Text>
                )}
              </View>
            )}

            {/* Bottom Navigation Buttons */}
            <View className="flex-row justify-between items-center pt-2">
              <TouchableOpacity
                onPress={handleBackPress}
                className="px-3 py-2"
              >
                <Text style={{ color: themeStyles.subText, fontSize: 12, fontWeight: 'normal' }}>
                  Exit Game
                </Text>
              </TouchableOpacity>

              {currentQ < questions.length - 1 ? (
                <TouchableOpacity
                  onPress={nextQ}
                  disabled={answers[currentQ] === undefined}
                  style={{
                    backgroundColor: themeStyles.brandGreen,
                    opacity: answers[currentQ] === undefined ? 0.4 : 1
                  }}
                  className="px-6 py-3 rounded-xl flex-row items-center"
                >
                  <Text className="text-slate-950 text-xs uppercase font-normal mr-1.5">
                    Next Question
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#090d16" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={submitScore}
                  disabled={submitting || answers[currentQ] === undefined}
                  style={{
                    backgroundColor: themeStyles.brandGreen,
                    opacity: answers[currentQ] === undefined ? 0.4 : 1
                  }}
                  className="px-6 py-3 rounded-xl flex-row items-center"
                >
                  <Text className="text-slate-950 text-xs uppercase font-normal mr-1.5">
                    {submitting ? 'Calculating...' : 'Finish Simulation'}
                  </Text>
                  <Ionicons name="trophy" size={14} color="#090d16" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
