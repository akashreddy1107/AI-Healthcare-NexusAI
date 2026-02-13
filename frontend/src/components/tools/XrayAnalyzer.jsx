import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export default function XrayAnalyzer({ lang }) {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [symptoms, setSymptoms] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        setLoading(true); setError(null); setResult(null);
        try {
            const data = await apiClient.analyzeXray(file, symptoms);
            if (data.status === 'success') setResult(data);
            else setError(data.error || 'Analysis failed');
        } catch (err) {
            setError('API error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => { setPreview(null); setResult(null); setError(null); };

    return (
        <div className="space-y-4">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

            <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="(Optional) Describe symptoms: e.g., pain in left wrist after fall"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition"
            >
                <Upload size={24} /> Upload X-Ray Image
            </button>

            {loading && (
                <div className="flex items-center justify-center gap-2 py-6 text-violet-600">
                    <Loader2 size={24} className="animate-spin" /> Analyzing X-ray for fractures...
                </div>
            )}

            {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">⚠️ {error}</div>}

            {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className={`p-4 rounded-xl text-white font-bold text-center ${result.is_fracture ? 'bg-red-500' : 'bg-green-500'}`}>
                        <div className="flex items-center justify-center gap-2 text-lg">
                            {result.is_fracture ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                            {result.diagnosis}
                        </div>
                        <div className="text-sm opacity-90 mt-1">Confidence: {result.confidence}%</div>
                    </div>

                    {preview && (
                        <div className="relative">
                            <img src={preview} alt="X-ray" className="w-full rounded-xl shadow" />
                            {result.attention_targets?.map((target, i) => (
                                <div key={i} className="absolute" style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}>
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full border-2 border-red-500 animate-ping absolute" />
                                        <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-red-500/20 flex items-center justify-center text-xs text-white font-bold relative">{i + 1}</div>
                                        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">{target.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white border text-center">
                            <div className="text-xs text-slate-500">Fracture?</div>
                            <div className={`text-lg font-bold ${result.is_fracture ? 'text-red-600' : 'text-green-600'}`}>{result.is_fracture ? 'YES' : 'NO'}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white border text-center">
                            <div className="text-xs text-slate-500">Sites Found</div>
                            <div className="text-lg font-bold text-slate-900">{result.fracture_sites}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white border text-center">
                            <div className="text-xs text-slate-500">Severity</div>
                            <div className={`text-lg font-bold ${result.is_severe ? 'text-red-600' : 'text-green-600'}`}>{result.is_severe ? 'Severe' : 'Mild'}</div>
                        </div>
                    </div>

                    {result.precautions?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">⚕️ Precautions</h4>
                            <ul className="space-y-1">
                                {result.precautions.map((p, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><span className="text-violet-500">•</span> {p}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.similar_cases?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">📋 Similar Cases Found</h4>
                            {result.similar_cases.map((c, i) => (
                                <div key={i} className="p-3 rounded-xl bg-violet-50 border border-violet-100 mb-2">
                                    <div className="font-medium text-violet-800">{c.diagnosis}</div>
                                    <div className="text-xs text-violet-600">{c.similarity}% match</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button onClick={reset} className="w-full py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2">
                        <RotateCcw size={14} /> Analyze Another X-Ray
                    </button>
                </motion.div>
            )}
        </div>
    );
}
