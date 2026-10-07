import { useState, useEffect } from 'react';
import {
  Phone,
  Mic,
  MicOff,
  Play,
  Pause,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Shield,
  Brain,
  Activity,
  FileText,
  UserCheck,
  Loader2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import api from '../../api/axios';

const AIGuarantorVerifier = ({ guarantor, driver, onVerificationComplete }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [conversationTranscript, setConversationTranscript] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [locationData, setLocationData] = useState(null);
  const [certificationScore, setCertificationScore] = useState(0);

  const verificationQuestions = [
    {
      id: 'relationship',
      question: 'Can you confirm your relationship with the driver and how long you have known them?',
      category: 'relationship_verification',
      weight: 0.25
    },
    {
      id: 'understanding',
      question: 'Do you understand that you are guaranteeing this driver\'s professional conduct and financial obligations?',
      category: 'guarantor_understanding',
      weight: 0.30
    },
    {
      id: 'financial',
      question: 'Are you aware of the potential financial liabilities you are undertaking as a guarantor?',
      category: 'financial_awareness',
      weight: 0.25
    },
    {
      id: 'location',
      question: 'Can you confirm the driver\'s current residential address and how long they have lived there?',
      category: 'location_verification',
      weight: 0.20
    }
  ];

  useEffect(() => {
    let interval;
    if (isCalling && !isRecording) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCalling, isRecording]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initiateCall = async () => {
    setIsCalling(true);
    setIsRecording(true);
    setCurrentQuestion(0);
    setAnswers({});
    setAiAnalysis(null);
    setConversationTranscript('');
    setCertificationScore(0);

    try {
      // Simulate AI-powered call initiation
      const response = await api.post('/admin/ai/guarantor-call', {
        guarantor_id: guarantor.id,
        driver_id: driver.id,
        questions: verificationQuestions
      });

      if (response.data.success) {
        setLocationData(response.data.location_data);
      }
    } catch (err) {
      console.error('Failed to initiate AI call:', err);
    }
  };

  const endCall = async () => {
    setIsCalling(false);
    setIsRecording(false);
    setIsAnalyzing(true);

    try {
      // Analyze conversation with AI
      const response = await api.post('/admin/ai/analyze-guarantor-call', {
        guarantor_id: guarantor.id,
        driver_id: driver.id,
        transcript: conversationTranscript,
        answers: answers,
        duration: callDuration
      });

      if (response.data.success) {
        setAiAnalysis(response.data.analysis);
        setCertificationScore(response.data.certification_score);
      }
    } catch (err) {
      console.error('Failed to analyze call:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const recordAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    if (currentQuestion < verificationQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-brandMint';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-brandMint/10 border-brandMint/30';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brandMint/10 rounded-xl">
              <Brain className="text-brandMint" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI-Powered Guarantor Verification</h3>
              <p className="text-sm text-slate-400">Automated verification with conversation analysis</p>
            </div>
          </div>
          {isCalling && (
            <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl">
              <Activity className="text-red-400 animate-pulse" size={16} />
              <span className="font-mono text-white">{formatDuration(callDuration)}</span>
            </div>
          )}
        </div>

        {/* Guarantor Info */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-slate-950 rounded-xl p-4">
            <p className="text-xs font-mono text-slate-500 uppercase mb-1">Guarantor Name</p>
            <p className="font-bold text-white">{guarantor.name}</p>
          </div>
          <div className="bg-slate-950 rounded-xl p-4">
            <p className="text-xs font-mono text-slate-500 uppercase mb-1">Phone</p>
            <p className="font-mono text-white">{guarantor.phone}</p>
          </div>
          <div className="bg-slate-950 rounded-xl p-4">
            <p className="text-xs font-mono text-slate-500 uppercase mb-1">Occupation</p>
            <p className="text-white">{guarantor.occupation || 'N/A'}</p>
          </div>
          <div className="bg-slate-950 rounded-xl p-4">
            <p className="text-xs font-mono text-slate-500 uppercase mb-1">Company</p>
            <p className="text-white">{guarantor.company || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      {!isCalling && !aiAnalysis && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
          <Phone className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-white mb-2">Initiate AI Verification Call</h4>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            The AI will call the guarantor, ask verification questions, and analyze their responses to ensure they understand their obligations.
          </p>
          <button
            onClick={initiateCall}
            className="px-8 py-3 bg-brandMint text-corporateNavy font-black rounded-xl uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center gap-2 mx-auto"
          >
            <Phone size={18} /> Start AI Call
          </button>
        </div>
      )}

      {/* Active Call Interface */}
      {isCalling && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Live Call in Progress</span>
            </div>
            <button
              onClick={endCall}
              className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-400 transition-colors"
            >
              End Call & Analyze
            </button>
          </div>

          {/* Current Question */}
          <div className="bg-slate-950 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-slate-500">
                Question {currentQuestion + 1} of {verificationQuestions.length}
              </span>
              <div className="flex gap-1">
                {verificationQuestions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentQuestion ? 'bg-brandMint' :
                      idx < currentQuestion ? 'bg-brandMint/50' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h4 className="text-lg font-bold text-white mb-4">
              {verificationQuestions[currentQuestion]?.question}
            </h4>
            <textarea
              value={answers[verificationQuestions[currentQuestion]?.id] || ''}
              onChange={(e) => recordAnswer(verificationQuestions[currentQuestion]?.id, e.target.value)}
              placeholder="Record the guarantor's response..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-brandMint outline-none resize-none h-32"
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => setCurrentQuestion(Math.min(verificationQuestions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === verificationQuestions.length - 1}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* AI Analysis Results */}
      {isAnalyzing && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
          <Loader2 className="w-12 h-12 text-brandMint animate-spin mx-auto mb-4" />
          <h4 className="text-lg font-bold text-white mb-2">AI Analyzing Conversation</h4>
          <p className="text-slate-400 text-sm">Processing transcript and generating verification report...</p>
        </div>
      )}

      {aiAnalysis && (
        <div className="space-y-6">
          {/* Certification Score */}
          <div className={`bg-slate-900 border rounded-2xl p-6 ${getScoreBackground(certificationScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-white mb-1">Guarantor Verification Score</h4>
                <p className="text-sm text-slate-400">AI confidence in guarantor reliability</p>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-black ${getScoreColor(certificationScore)}`}>
                  {certificationScore}%
                </p>
                <p className="text-xs font-mono text-slate-500 uppercase mt-1">
                  {certificationScore >= 80 ? 'High Confidence' :
                   certificationScore >= 60 ? 'Moderate Confidence' : 'Low Confidence'}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={20} /> AI Analysis Breakdown
            </h4>
            <div className="space-y-4">
              {aiAnalysis.categories?.map((category, idx) => (
                <div key={idx} className="bg-slate-950 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{category.name}</span>
                    <span className={`font-mono ${getScoreColor(category.score)}`}>
                      {category.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        category.score >= 80 ? 'bg-brandMint' :
                        category.score >= 60 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{category.assessment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Location Verification */}
          {locationData && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin size={20} /> Location-Based Certification
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 rounded-xl p-4">
                  <p className="text-xs font-mono text-slate-500 uppercase mb-1">Address Match</p>
                  <p className={`font-bold ${locationData.address_match ? 'text-brandMint' : 'text-red-400'}`}>
                    {locationData.address_match ? 'VERIFIED' : 'MISMATCH'}
                  </p>
                </div>
                <div className="bg-slate-950 rounded-xl p-4">
                  <p className="text-xs font-mono text-slate-500 uppercase mb-1">Geolocation</p>
                  <p className={`font-bold ${locationData.geo_verified ? 'text-brandMint' : 'text-amber-400'}`}>
                    {locationData.geo_verified ? 'CONFIRMED' : 'PENDING'}
                  </p>
                </div>
                <div className="bg-slate-950 rounded-xl p-4">
                  <p className="text-xs font-mono text-slate-500 uppercase mb-1">Residence Duration</p>
                  <p className="font-bold text-white">{locationData.residence_duration || 'N/A'}</p>
                </div>
                <div className="bg-slate-950 rounded-xl p-4">
                  <p className="text-xs font-mono text-slate-500 uppercase mb-1">Location Risk</p>
                  <p className={`font-bold ${locationData.risk_level === 'low' ? 'text-brandMint' : 'text-amber-400'}`}>
                    {locationData.risk_level?.toUpperCase() || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Brain size={20} /> AI Recommendations
            </h4>
            <div className="space-y-3">
              {aiAnalysis.recommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-xl ${
                    rec.type === 'approve' ? 'bg-brandMint/10 border border-brandMint/30' :
                    rec.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
                    'bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  {rec.type === 'approve' && <CheckCircle className="text-brandMint shrink-0" size={20} />}
                  {rec.type === 'warning' && <AlertTriangle className="text-amber-400 shrink-0" size={20} />}
                  {rec.type === 'reject' && <XCircle className="text-red-400 shrink-0" size={20} />}
                  <div>
                    <p className="font-bold text-white">{rec.title}</p>
                    <p className="text-sm text-slate-400 mt-1">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => onVerificationComplete({
                guarantor_id: guarantor.id,
                verified: true,
                score: certificationScore,
                analysis: aiAnalysis
              })}
              className="flex-1 py-4 bg-brandMint text-corporateNavy font-black rounded-xl uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} /> Accept Verification
            </button>
            <button
              onClick={() => onVerificationComplete({
                guarantor_id: guarantor.id,
                verified: false,
                score: certificationScore,
                analysis: aiAnalysis
              })}
              className="flex-1 py-4 bg-slate-950 border border-slate-700 text-slate-400 font-bold rounded-xl uppercase tracking-wider hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={20} /> Reject Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIGuarantorVerifier;
