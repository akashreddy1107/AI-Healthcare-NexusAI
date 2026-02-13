import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export default function CoughAnalyzer({ lang }) {
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [time, setTime] = useState(0);

    const startRecording = async () => {
        try {
            setError(null); setResult(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } });
            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            recorder.onstop = () => stream.getTracks().forEach(t => t.stop());
            mediaRecorderRef.current = recorder;
            recorder.start();
            setRecording(true); setTime(0);
            timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
        } catch (err) {
            setError('Microphone access denied: ' + err.message);
        }
    };

    const stopAndAnalyze = () => {
        if (!mediaRecorderRef.current) return;
        setLoading(true); setError(null);
        clearInterval(timerRef.current);
        mediaRecorderRef.current.stop();
        setRecording(false);

        setTimeout(async () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onload = async () => {
                const b64 = reader.result.split(',')[1];
                try {
                    const data = await apiClient.analyzeCough(b64, time * 1000);
                    if (data.status === 'success') setResult(data);
                    else setError(data.error || 'Analysis failed');
                } catch (err) {
                    setError('API error: ' + err.message);
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsDataURL(blob);
        }, 500);
    };

    const riskColor = (level) => ({
        Low: '#22c55e', 'Low-Medium': '#84cc16', Medium: '#f59e0b',
        'Medium-High': '#f97316', High: '#ef4444', Critical: '#dc2626'
    }[level] || '#3b82f6');

    return (
        <div className="space-y-4">
            {!recording ? (
                <button onClick={startRecording} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition">
                    <Mic size={24} /> Start Recording Cough
                </button>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3 py-4 rounded-xl bg-red-50 border border-red-200">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-semibold text-red-700">Recording... {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</span>
                    </div>
                    <button onClick={stopAndAnalyze} disabled={loading} className="w-full py-3 rounded-xl bg-slate-800 text-white font-semibold flex items-center justify-center gap-2">
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><Square size={18} /> Stop & Analyze</>}
                    </button>
                </div>
            )}

            <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-sm">
                💡 Hold phone close to mouth, record in quiet area, 2–5 seconds of cough is sufficient
            </div>

            {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">⚠️ {error}</div>}

            {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="p-4 rounded-xl text-white font-bold text-center" style={{ backgroundColor: riskColor(result.risk_level) }}>
                        <div className="text-lg">{result.cough_type}</div>
                        <div className="text-sm opacity-90">{result.risk_level} Risk · {result.severity_level}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-white border">
                            <div className="text-xs text-slate-500">Signal Energy</div>
                            <div className="mt-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(result.acoustic_analysis?.rms_energy * 200 || 0, 100)}%` }} />
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white border">
                            <div className="text-xs text-slate-500">Frequency</div>
                            <div className="mt-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(result.acoustic_analysis?.zero_crossing_rate * 200 || 0, 100)}%` }} />
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white border text-center">
                            <div className="text-xs text-slate-500">Spectral Centroid</div>
                            <div className="text-lg font-bold">{result.acoustic_analysis?.spectral_centroid || 0} Hz</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white border text-center">
                            <div className="text-xs text-slate-500">Confidence</div>
                            <div className="text-lg font-bold">{result.confidence_score}</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">🏥 Predicted Conditions</h4>
                        <div className="flex flex-wrap gap-2">
                            {result.predicted_conditions?.map((c, i) => (
                                <span key={i} className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200">{c}</span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">💊 Recommendations</h4>
                        <ul className="space-y-1">
                            {result.recommendations?.map((r, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><span className="text-green-500">✓</span> {r}</li>
                            ))}
                        </ul>
                    </div>

                    {result.urgent_action && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold text-center">
                            🚨 High-risk respiratory condition detected. Seek immediate medical attention.
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
