import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, RotateCcw } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export default function VeinFinder({ lang }) {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        setLoading(true); setError(null); setResult(null);
        try {
            const data = await apiClient.findVeins(file);
            if (data.status === 'success') setResult(data.image);
            else setError(data.error || 'Analysis failed');
        } catch (err) {
            setError('API error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => { setPreview(null); setResult(null); setError(null); setSelectedFile(null); };

    return (
        <div className="space-y-4">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition"
            >
                <Upload size={24} /> Upload Hand / Arm Image
            </button>

            <p className="text-sm text-slate-500 text-center">
                Upload a photo of your hand or arm. The AI will enhance the image to visualize veins using advanced CLAHE processing.
            </p>

            {loading && (
                <div className="flex items-center justify-center gap-2 py-6 text-blue-600">
                    <Loader2 size={24} className="animate-spin" /> Processing vein map...
                </div>
            )}

            {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">⚠️ {error}</div>}

            {(preview || result) && !loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {preview && result && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-xs font-semibold text-slate-500 mb-1">Original</div>
                                <img src={preview} alt="Original" className="w-full rounded-xl shadow" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-slate-500 mb-1">Vein Map</div>
                                <img src={result} alt="Vein Map" className="w-full rounded-xl shadow" />
                            </div>
                        </div>
                    )}

                    <button onClick={reset} className="w-full py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2">
                        <RotateCcw size={14} /> Upload New Image
                    </button>
                </motion.div>
            )}
        </div>
    );
}
