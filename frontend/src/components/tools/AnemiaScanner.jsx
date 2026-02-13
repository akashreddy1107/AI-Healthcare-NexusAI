import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, RotateCcw, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export default function AnemiaScanner({ lang }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const startCamera = async () => {
        try {
            setError(null); setPreview(null); setResult(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setScanning(true);
            }
        } catch (err) {
            setError('Camera access denied: ' + err.message);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            setScanning(false);
        }
    };

    const captureAndAnalyze = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        setPreview(canvasRef.current.toDataURL('image/jpeg'));
        stopCamera();
        canvasRef.current.toBlob(blob => analyzeImage(blob), 'image/jpeg', 0.95);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => { setPreview(reader.result); setResult(null); setError(null); };
        reader.readAsDataURL(file);
    };

    const analyzeUploadedImage = async () => {
        if (!preview) return;
        const res = await fetch(preview);
        const blob = await res.blob();
        analyzeImage(blob);
    };

    const analyzeImage = async (blob) => {
        setLoading(true); setError(null);
        try {
            const data = await apiClient.anemiaEyeScan(blob);
            if (data.status === 'success') setResult(data);
            else setError(data.error || 'Analysis failed');
        } catch (err) {
            setError('API error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const riskColor = (level) => ({ Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444', Critical: '#dc2626' }[level] || '#3b82f6');
    const reset = () => { setPreview(null); setResult(null); setError(null); stopCamera(); };

    return (
        <div className="space-y-4">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <canvas ref={canvasRef} className="hidden" />

            {!scanning && !preview && (
                <div className="flex gap-3">
                    <button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition">
                        <Camera size={20} /> Start Eye Scan
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition">
                        <Upload size={20} /> Upload Image
                    </button>
                </div>
            )}

            {scanning && (
                <div className="space-y-3">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl shadow-lg" />
                    <div className="flex gap-3">
                        <button onClick={captureAndAnalyze} disabled={loading} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-semibold">
                            {loading ? '⏳ Analyzing...' : '📸 Capture & Analyze'}
                        </button>
                        <button onClick={stopCamera} className="px-4 py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold">⏹ Stop</button>
                    </div>
                </div>
            )}

            {preview && !scanning && (
                <div className="space-y-3">
                    <img src={preview} alt="Preview" className="w-full max-h-64 object-contain rounded-xl shadow" />
                    <div className="flex gap-3">
                        <button onClick={analyzeUploadedImage} disabled={loading || result} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-semibold disabled:opacity-50">
                            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Analyzing...</span> : result ? '✅ Analyzed' : '🔬 Analyze'}
                        </button>
                        <button onClick={reset} className="px-4 py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold flex items-center gap-2">
                            <RotateCcw size={16} /> Retry
                        </button>
                    </div>
                </div>
            )}

            {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">⚠️ {error}</div>}

            {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="p-4 rounded-xl text-white font-bold text-center text-lg" style={{ backgroundColor: riskColor(result.risk_level) }}>
                        {result.hemoglobin_status} — {result.risk_level} Risk
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white border text-center">
                            <div className="text-xs text-slate-500">Hb Estimate</div>
                            <div className="text-xl font-bold text-slate-900">{result.hgb_estimate} <span className="text-xs">g/dL</span></div>
                        </div>
                        <div className="p-3 rounded-xl bg-white border text-center">
                            <div className="text-xs text-slate-500">Erythema Index</div>
                            <div className="text-xl font-bold text-slate-900">{result.erythema_index}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white border text-center">
                            <div className="text-xs text-slate-500">Confidence</div>
                            <div className="text-xl font-bold text-slate-900">{result.confidence_score}</div>
                        </div>
                    </div>
                    {result.processed_image && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">👁️ AI Vision Heatmap</h4>
                            <img src={`data:image/jpeg;base64,${result.processed_image}`} alt="AI Analysis" className="w-full rounded-xl shadow" />
                        </div>
                    )}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">💊 Recommendations</h4>
                        <ul className="space-y-1">
                            {result.recommendations?.map((r, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><span className="text-green-500">✓</span> {r}</li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
