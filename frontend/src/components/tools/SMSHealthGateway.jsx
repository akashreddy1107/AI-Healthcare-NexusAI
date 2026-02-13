import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Phone, User, Clock, CheckCircle, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export default function SMSHealthGateway({ lang }) {
    const [patientId, setPatientId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState([
        { id: 1, to: '+91 98XXX XXX01', msg: 'Daily Reminder: Take Paracetamol 500mg at 9:00 AM', time: '10:30 AM', status: 'delivered', gateway: 'GlobalRelay' },
        { id: 2, to: '+91 98XXX XXX01', msg: 'Alert: SpO2 levels dropped to 92%. Please rest and monitor.', time: '09:15 AM', status: 'delivered', gateway: 'GlobalRelay' }
    ]);

    const handleSendMessage = async () => {
        if (!phoneNumber || !message) return;

        setSending(true);
        try {
            const response = await apiClient.sendSMS(phoneNumber, message);

            if (response.success) {
                setHistory([
                    {
                        id: Date.now(),
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        to: phoneNumber,
                        msg: message, // Keep message for display
                        status: 'Transmitted',
                        gateway: response.gateway || 'GlobalRelay'
                    },
                    ...history
                ]);
                setMessage('');
            } else {
                alert("Failed to send: " + response.error);
            }
        } catch (err) {
            alert("Transmission error: " + err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-sm flex gap-3">
                <ShieldAlert className="flex-shrink-0" size={20} />
                <p>
                    <strong>Health Gateway Active:</strong> This tool allows doctors to send real-time alerts, reminders, and encoded health data to patients even in low-bandwidth areas via SMS.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Composer */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Patient ID</label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={patientId}
                                    onChange={e => setPatientId(e.target.value)}
                                    placeholder="PAT-123"
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    placeholder="+91 00000 00000"
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Message Body</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="e.g. Your blood test results are ready. Please visit the clinic tomorrow at 10 AM."
                            className="w-full p-4 text-sm rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-200 min-h-[120px]"
                        />
                    </div>

                    <button
                        onClick={handleSendMessage}
                        disabled={sending || !phoneNumber || !message}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                        {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                        Transmit SMS Alert
                    </button>
                </div>

                {/* History */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" /> Transmission Log
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {history.map(item => (
                            <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-sm">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-slate-900">{item.to}</span>
                                    <span className="text-[10px] text-slate-400 font-medium uppercase">{item.time}</span>
                                </div>
                                <p className="text-slate-600 text-xs leading-relaxed mb-2">{item.msg}</p>
                                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600">
                                    <CheckCircle size={10} /> {item.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
