import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Pill, AlertCircle, Loader2, Clock, User, Upload } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export default function MedicalHistoryPage({ lang, t }) {
    const [patientId, setPatientId] = useState('');
    const [history, setHistory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [tab, setTab] = useState('history');

    const fetchHistory = async () => {
        if (!patientId.trim()) return;
        setLoading(true);
        try {
            const data = await apiClient.getMedicalHistory(patientId.trim());
            setHistory(data);
        } catch (err) {
            setHistory({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const semanticSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        try {
            const data = await apiClient.semanticSearch(searchQuery.trim(), patientId || undefined);
            setSearchResults(data);
        } catch (err) {
            setSearchResults({ results: [], error: err.message });
        } finally {
            setSearchLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 rounded-full mb-4">
                    <FileText size={16} className="text-teal-600" />
                    <span className="text-sm font-semibold text-teal-700">Medical Records</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                    Medical <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">History</span>
                </h1>
                <p className="text-slate-500 max-w-xl mx-auto">
                    View patient records, prescriptions, and search through medical history using AI-powered semantic search.
                </p>
            </motion.div>

            {/* Patient ID Input */}
            <div className="max-w-lg mx-auto flex gap-3">
                <div className="flex-1 relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
                        placeholder="Enter Patient ID (e.g., PAT-ABC12345)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                </div>
                <button
                    onClick={fetchHistory}
                    disabled={loading || !patientId.trim()}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    Search
                </button>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-2">
                {[
                    { id: 'history', label: 'Patient History', icon: <Clock size={16} /> },
                    { id: 'search', label: 'Semantic Search', icon: <Search size={16} /> },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition
              ${tab === item.id ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {item.icon} {item.label}
                    </button>
                ))}
            </div>

            {/* History Tab */}
            {tab === 'history' && history && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {history.error ? (
                        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-center">⚠️ {history.error}</div>
                    ) : (
                        <>
                            {history.patient_info && (
                                <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-teal-600 text-white"><User size={20} /></div>
                                        <div>
                                            <div className="font-bold text-slate-900">{history.patient_info.name}</div>
                                            <div className="text-xs text-slate-500">
                                                {history.patient_info.age && `${history.patient_info.age} yrs`}
                                                {history.patient_info.gender && ` · ${history.patient_info.gender}`}
                                                {` · ${history.total_prescriptions} prescriptions`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {history.prescriptions?.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                                    <p className="font-medium">No medical history found for this patient</p>
                                    <p className="text-sm">Records will appear here after prescriptions are uploaded</p>
                                </div>
                            )}

                            {history.prescriptions?.map((pres, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-slate-900">{pres.diagnosis}</div>
                                            <div className="text-xs text-slate-500">{pres.date} · Dr. {pres.doctor_name}</div>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 font-medium">
                                            {pres.duration_days} days
                                        </span>
                                    </div>
                                    {pres.symptoms && (
                                        <div className="text-sm text-slate-600">
                                            <span className="font-medium text-slate-700">Symptoms:</span> {pres.symptoms}
                                        </div>
                                    )}
                                    {pres.medicines?.length > 0 && (
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><Pill size={12} /> Medicines</div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {pres.medicines.map((med, j) => (
                                                    <div key={j} className="p-2 rounded-lg bg-slate-50 text-xs">
                                                        <div className="font-semibold text-slate-800">{med.name}</div>
                                                        <div className="text-slate-500">{med.dosage} · {med.frequency}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {history.allergies?.length > 0 && (
                                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                                    <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                                        <AlertCircle size={18} /> Known Allergies
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {history.allergies.map((a, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
                                                {a.allergen} ({a.severity})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {history.chronic_conditions?.length > 0 && (
                                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                                    <h3 className="font-bold text-rose-800 mb-2">🩺 Chronic Conditions</h3>
                                    {history.chronic_conditions.map((c, i) => (
                                        <div key={i} className="text-sm text-rose-700">
                                            <span className="font-medium">{c.condition}</span> — {c.status}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            )}

            {/* Semantic Search Tab */}
            {tab === 'search' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="max-w-lg mx-auto flex gap-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && semanticSearch()}
                            placeholder="Search medical records: e.g., 'fever with cough and body pain'"
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                        />
                        <button onClick={semanticSearch} disabled={searchLoading || !searchQuery.trim()} className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold disabled:opacity-50">
                            {searchLoading ? <Loader2 size={18} className="animate-spin" /> : '🔍'}
                        </button>
                    </div>

                    {searchResults && (
                        <div className="space-y-3">
                            {searchResults.results?.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Search size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No matching records found. Add data via prescriptions or the learn endpoint to build the knowledge base.</p>
                                </div>
                            ) : (
                                searchResults.results?.map((r, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div className="font-semibold text-slate-900">{r.metadata?.diagnosis || r.metadata?.input_text || 'Record'}</div>
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                                                {(r.similarity * 100).toFixed(1)}% match
                                            </span>
                                        </div>
                                        {r.metadata?.symptoms && <div className="text-sm text-slate-500 mt-1">Symptoms: {r.metadata.symptoms}</div>}
                                        {r.metadata?.patient_id && <div className="text-xs text-slate-400 mt-1">Patient: {r.metadata.patient_id}</div>}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
