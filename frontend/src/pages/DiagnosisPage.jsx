import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Activity, AlertCircle, Brain, Pill, Calendar, Mic, ClipboardList, Info, ChevronRight, TrendingUp, User as UserIcon } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useSpeechInput } from '../hooks/useSpeechInput';
import VisualSymptomPicker from '../components/diagnosis/VisualSymptomPicker';
import VoiceAvatar from '../components/layout/VoiceAvatar';
import ConfidenceMeter from '../components/diagnosis/ConfidenceMeter';
import MedicineVisualGuide from '../components/diagnosis/MedicineVisualGuide';
import ReportScanner from '../components/diagnosis/ReportScanner';
import FarmStoryCard from '../components/diagnosis/FarmStoryCard';
import AnimatedThali from '../components/diagnosis/AnimatedThali';
import AnimatedStoryVideo from '../components/diagnosis/AnimatedStoryVideo';

export default function DiagnosisPage({ lang, t, onDiagnosisComplete, onReportScan, savedReport }) {
  const [activeTab, setActiveTab] = useState('input');

  // Patient Context (Removes hardcoding)
  const [age, setAge] = useState(45);
  const [gender, setGender] = useState('Female');

  // Vitals
  const [glucose, setGlucose] = useState(120);
  const [heartRate, setHeartRate] = useState(80);
  const [spo2, setSpo2] = useState(98);
  const [temperature, setTemperature] = useState(98.6);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [wearableConnected, setWearableConnected] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [farmStory, setFarmStory] = useState(null);
  const [diagnosisResults, setDiagnosisResults] = useState(null);
  const [reportScanData, setReportScanData] = useState(null);

  // Merged Features
  const [clinicalIntel, setClinicalIntel] = useState(null);
  const [similarCases, setSimilarCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const getLangCode = (code) => {
    const map = {
      'hi': 'hi-IN', 'te': 'te-IN', 'ta': 'ta-IN', 'kn': 'kn-IN',
      'ml': 'ml-IN', 'bn': 'bn-IN', 'gu': 'gu-IN', 'mr': 'mr-IN', 'en': 'en-IN'
    };
    return map[code] || 'en-US';
  };

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  const speech = useSpeechInput(getLangCode(lang));

  useEffect(() => {
    if (savedReport && !report) {
      setReport(savedReport);
      setActiveTab('result');
      if (savedReport.age) setAge(savedReport.age);
      if (savedReport.gender) setGender(savedReport.gender);
      if (savedReport.farmStory) setFarmStory(savedReport.farmStory);
      if (savedReport.diagnosisResults) setDiagnosisResults(savedReport.diagnosisResults);
      if (savedReport.similarCases) setSimilarCases(savedReport.similarCases);
      if (savedReport.clinicalIntel) setClinicalIntel(savedReport.clinicalIntel);
    }
  }, [savedReport]);

  const handleSymptomSelect = (data) => {
    const text = typeof data === 'object' ? data.description : data;
    setSymptoms(text);
    setVoiceText(`You said: ${text}. Analyzing symptoms...`);
  };

  const handleReportScan = (scanData) => {
    setReportScanData(scanData);
    if (onReportScan) onReportScan(scanData);
    if (scanData && scanData.success) autoAnalyzeFromReport(scanData);
  };

  const autoAnalyzeFromReport = (scanData) => {
    const autoReport = {
      patient_id: `PAT-AUTO-${Date.now().toString(16).slice(-6).toUpperCase()}`,
      risk: scanData.severity >= 7 ? 'high' : scanData.severity >= 4 ? 'medium' : 'low',
      risk_score: scanData.severity || 5,
      confidence: 0.8,
      explanation: scanData.explanation || 'Analysis complete',
      diseases: [{ name: scanData.report_type || 'Finding', probability: 0.8 }],
      triage: scanData.severity >= 7 ? 'RED' : scanData.severity >= 4 ? 'YELLOW' : 'GREEN',
      treatment_plan: { medications: [], procedures: [scanData.action_needed || 'Consult doctor'], follow_up: '1 week' },
      isFromReport: true,
      timestamp: new Date().toISOString()
    };
    setReport(autoReport);
    setDiagnosisResults({ ...autoReport, recommended_foods: scanData.eat_foods || [], avoid_foods: scanData.avoid_foods || [] });
    setActiveTab('result');
  };

  const handleDiagnose = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('glucose', glucose);
      formData.append('heart_rate', heartRate);
      formData.append('systolic', systolic);
      formData.append('diastolic', diastolic);
      formData.append('spo2', spo2);
      formData.append('temperature', temperature);
      formData.append('symptoms', symptoms);
      formData.append('age', age);
      formData.append('gender', gender);
      formData.append('language', lang);

      // BRAIN SYNC
      const result = await apiClient.diagnose(formData);

      let intel = null;
      try {
        intel = await apiClient.clinicalIntelligence({
          age: age, temp: temperature, symptoms,
          heart_rate: heartRate, bp: `${systolic}/${diastolic}`, o2: spo2
        });
      } catch (e) { console.warn('Clinical Intel failed', e); }

      let cases = [];
      try {
        const casesRes = await apiClient.getSimilarCases(symptoms);
        cases = casesRes.similar_cases || [];
      } catch (e) { console.warn('Similar cases failed', e); }

      const mappedReport = {
        ...result,
        age, gender,
        patient_id: result.patient_id,
        risk: result.risk,
        triage: result.risk === 'high' ? 'RED' : result.risk === 'medium' ? 'YELLOW' : 'GREEN',
        clinicalIntel: intel,
        similarCases: cases,
        isFromReport: false
      };

      setReport(mappedReport);
      setClinicalIntel(intel);
      setSimilarCases(cases);
      setDiagnosisResults({ ...result, severity: result.risk_score || 5 });
      setFarmStory(result.farmStory || null);
      setActiveTab('result');
      onDiagnosisComplete?.(mappedReport);

      if (result.explanation) setVoiceText(result.explanation);
    } catch (error) {
      console.error('❌ Diagnosis error:', error);
      alert(`Diagnosis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Stethoscope size={32} className="text-blue-600" />
          {activeTab === 'input' ? 'Diagnostic Hub' : 'Analysis Results'}
        </h1>
        {activeTab === 'result' && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            BRAIN SYNC COMPLETE
          </div>
        )}
      </div>

      <AnimatePresence mode='wait'>
        {activeTab === 'input' ? (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* 1. Report Scanner (NEXUS_2) */}
            <ReportScanner language={lang} onResult={handleReportScan} />

            {/* 2. Patient Context (Removes Hardcoding) */}
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg"><UserIcon size={20} className="text-indigo-600" /></div>
                <div>
                  <h3 className="font-bold">Patient Information</h3>
                  <p className="text-xs text-slate-500">Essential context for accurate diagnosis</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 font-semibold"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Vitals Hub (nexmed_ai integration) */}
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg"><Activity size={20} className="text-rose-600" /></div>
                  <h3 className="font-bold">Live Sensor Telemetry</h3>
                </div>
                <button onClick={() => setWearableConnected(!wearableConnected)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${wearableConnected ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-slate-100 text-slate-500'}`}>
                  {wearableConnected ? '✅ SENSORS SYNCED' : '📡 SYNC SENSORS'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'GLUCOSE', unit: 'mg/dL', val: glucose, set: setGlucose },
                  { label: 'HR', unit: 'BPM', val: heartRate, set: setHeartRate },
                  { label: 'SPO2', unit: '%', val: spo2, set: setSpo2 },
                  { label: 'TEMP', unit: '°F', val: temperature, set: setTemperature },
                  { label: 'SYSTOLIC', unit: 'mmHg', val: systolic, set: setSystolic },
                  { label: 'DIASTOLIC', unit: 'mmHg', val: diastolic, set: setDiastolic },
                ].map(vital => (
                  <div key={vital.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{vital.label} ({vital.unit})</label>
                    <input type="number" value={vital.val} onChange={e => vital.set(e.target.value)} className="w-full bg-transparent font-black text-xl text-slate-900 border-none focus:outline-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Symptoms (NEXUS_2 Storytelling integration) */}
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg"><ClipboardList size={20} className="text-amber-600" /></div>
                <h3 className="font-bold">Tell Your Story</h3>
              </div>
              <VisualSymptomPicker onSymptomSelect={handleSymptomSelect} t={t} />
              <div className="flex gap-2 mt-6 pt-6 border-t border-slate-100">
                <textarea
                  value={speech.transcript || symptoms}
                  onChange={(e) => { setSymptoms(e.target.value); speech.setTranscript(''); }}
                  className="flex-1 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 text-slate-700 text-sm font-medium"
                  placeholder="Describe how you feel..." rows={3}
                />
                <button onClick={speech.isListening ? speech.stop : speech.start} className={`p-4 rounded-2xl transition-all ${speech.isListening ? 'bg-red-500 text-white animate-pulse shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <Mic size={24} />
                </button>
              </div>
            </div>

            <button onClick={handleDiagnose} disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl">
              {loading ? <><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> RUNNING BRAIN ANALYTICS...</> : <><Brain size={28} /> SYNC ONE BRAIN</>}
            </button>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {report && (
                <>
                  <div className={`p-8 rounded-[2.5rem] border-2 shadow-xl ${report.triage === 'RED' ? 'bg-red-50 border-red-200' : report.triage === 'YELLOW' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <div className="flex items-center gap-6">
                      <div className="text-6xl">{report.triage === 'RED' ? '🚨' : report.triage === 'YELLOW' ? '⚠️' : '✅'}</div>
                      <div className="flex-1">
                        <div className={`text-sm font-black uppercase tracking-widest ${report.triage === 'RED' ? 'text-red-700' : report.triage === 'YELLOW' ? 'text-amber-700' : 'text-emerald-700'}`}>Recommended Action</div>
                        <div className="text-3xl font-black text-slate-900">{report.triage} PRIORITY</div>
                        <p className="text-slate-600 font-medium mt-1">
                          {report.triage === 'RED' ? 'Seek immediate medical attention.' : report.triage === 'YELLOW' ? 'Consult a doctor soon.' : 'Follow home care guidelines.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Brain size={120} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                      <TrendingUp size={24} className="text-blue-600" /> Diagnosis Explanation
                    </h3>
                    <div className="p-6 bg-slate-50 rounded-3xl text-slate-800 text-lg leading-relaxed font-semibold italic border-l-8 border-slate-900">
                      "{report.explanation}"
                    </div>
                    {report.diseases?.length > 0 && (
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {report.diseases.map((d, i) => (
                          <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                            <div className="font-bold text-slate-800">{d.name}</div>
                            <div className={`px-3 py-1 rounded-full text-xs font-black ${d.probability > 0.8 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {Math.round(d.probability * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* nexmed_ai Storytelling */}
                  <AnimatedStoryVideo diagnosis={diagnosisResults} language={lang} />

                  {/* NEXUS_2 Living Thali */}
                  <AnimatedThali
                    eatFoods={diagnosisResults?.recommended_foods || []}
                    avoidFoods={diagnosisResults?.avoid_foods || []}
                    language={lang}
                  />
                  <MedicineVisualGuide />
                </>
              )}
            </div>

            <div className="space-y-8">
              <ConfidenceMeter confidence={report?.confidence || 0.85} severity={report?.risk || 'medium'} />

              {clinicalIntel && (
                <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-white/10"><Info size={80} /></div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-6">Clinical Intelligence</h4>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-white/10 rounded-2xl text-3xl font-black">{clinicalIntel.age_adjusted_analysis?.derived_vitals?.sirs_score || 0}<span className="text-xs opacity-50">/3</span></div>
                    <div className="font-bold">SIRS Score<br /><span className="text-xs opacity-60 font-medium">Sepsis Screening</span></div>
                  </div>
                  {clinicalIntel.red_flags?.length > 0 && (
                    <ul className="space-y-3">
                      {clinicalIntel.red_flags.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-bold text-red-50">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {report?.similarCases?.length > 0 && (
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2">
                    <ClipboardList size={24} className="text-indigo-600" /> Similar Cases
                  </h3>
                  <div className="space-y-3">
                    {report.similarCases.slice(0, 3).map((c, i) => (
                      <div key={i} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-black text-slate-900 text-sm">{c.diagnosis}</div>
                          <div className="text-[10px] font-black px-2 py-0.5 bg-indigo-600 text-white rounded-full">{c.similarity}%</div>
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold">{c.doctor} · {c.date.split('T')[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report?.treatment_plan?.medications?.length > 0 && (
                <div className="p-8 bg-emerald-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-white/5"><Pill size={80} /></div>
                  <h3 className="font-black text-xl mb-6">Care Plan</h3>
                  <div className="space-y-4">
                    {report.treatment_plan.medications.map((m, i) => (
                      <div key={i} className="flex gap-4 p-3 bg-white/10 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold">{i + 1}</div>
                        <div>
                          <div className="font-bold">{m.name}</div>
                          <div className="text-[10px] opacity-70 font-bold uppercase">{m.dose} · {m.frequency}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-8 py-4 bg-white text-emerald-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-50 transition">
                    Send SMS to Caretaker
                  </button>
                </div>
              )}

              <button onClick={() => setActiveTab('input')} className="w-full py-5 bg-slate-100 text-slate-600 font-black rounded-[2rem] hover:bg-slate-200 transition uppercase tracking-widest text-xs">
                Run New Analysis
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeTab === 'input' && (
          <VoiceAvatar key={lang} textToSpeak={voiceText || "Brain synchronized. I am listening to your symptoms."} isListening={speech.isListening} lang={lang} />
        )}
      </AnimatePresence>
    </div>
  );
}
