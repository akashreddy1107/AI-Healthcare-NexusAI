import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Mic, Droplets, Bone, TrendingUp, MessageSquare, ChevronDown, ChevronUp, Zap, Radio, LineChart } from 'lucide-react';
import AnemiaScanner from '../components/tools/AnemiaScanner';
import CoughAnalyzer from '../components/tools/CoughAnalyzer';
import VeinFinder from '../components/tools/VeinFinder';
import XrayAnalyzer from '../components/tools/XrayAnalyzer';
import SMSHealthGateway from '../components/tools/SMSHealthGateway';

const tools = [
    {
        id: 'anemia',
        name: 'Anemia Eye Scanner',
        description: 'Detect anemia through conjunctiva color analysis using your camera or uploaded eye image.',
        icon: <Eye size={28} />,
        gradient: 'from-rose-500 to-pink-600',
        shadow: 'shadow-rose-500/30',
        component: AnemiaScanner,
    },
    {
        id: 'cough',
        name: 'Cough-to-Cure Analyzer',
        description: 'Record your cough and get AI-powered respiratory condition detection and recommendations.',
        icon: <Mic size={28} />,
        gradient: 'from-amber-500 to-orange-600',
        shadow: 'shadow-amber-500/30',
        component: CoughAnalyzer,
    },
    {
        id: 'vein',
        name: 'Vein Finder',
        description: 'Visualize veins using enhanced CLAHE imaging techniques for easier medical procedures.',
        icon: <Droplets size={28} />,
        gradient: 'from-blue-500 to-cyan-600',
        shadow: 'shadow-blue-500/30',
        component: VeinFinder,
    },
    {
        id: 'xray',
        name: 'X-Ray Fracture Detector',
        description: 'Advanced Sobel-based AI for detecting fractures and tagging attention sites on X-ray images.',
        icon: <Bone size={28} />,
        gradient: 'from-violet-500 to-purple-600',
        shadow: 'shadow-violet-500/30',
        component: XrayAnalyzer,
    },
    {
        id: 'sms',
        name: 'Health SMS Gateway',
        description: 'Transmit real-time health alerts and reminders to patients in low-connectivity areas.',
        icon: <Radio size={28} />,
        gradient: 'from-indigo-500 to-indigo-700',
        shadow: 'shadow-indigo-500/30',
        component: SMSHealthGateway,
    },
    {
        id: 'risk',
        name: 'Risk Projection',
        description: 'Analyze disease progression heatmaps based on historical data and current symptoms.',
        icon: <LineChart size={28} />,
        gradient: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/30',
        component: () => (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-teal-200">
                <LineChart size={48} className="mx-auto text-teal-200 mb-4" />
                <h4 className="font-bold text-slate-800">Risk Projection Engine</h4>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
                    This engine uses the backend Risk Projection algorithm to generate 7-day health trend heatmaps.
                </p>
                <button className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold opacity-50 cursor-not-allowed">
                    Module Updating...
                </button>
            </div>
        ),
    },
];

export default function ToolsPage({ lang, t }) {
    const [activeTool, setActiveTool] = useState(null);

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full mb-4">
                    <Zap size={16} className="text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-700 uppercase tracking-widest">Diagnostic Toolkit</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                    Advanced AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Diagnostics</span>
                </h1>
                <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                    Integrated intelligence from NexMed and Nexus_2. Choose a specialized module to perform
                    deep diagnostic analysis on specific medical conditions.
                </p>
            </motion.div>

            {/* Tool Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, index) => (
                    <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div
                            className={`h-full flex flex-col rounded-3xl border transition-all duration-500 overflow-hidden
                ${activeTool === tool.id
                                    ? 'border-indigo-300 ring-4 ring-indigo-50 shadow-2xl bg-white'
                                    : 'border-slate-100 bg-white/60 backdrop-blur-sm hover:border-slate-300 shadow-lg hover:shadow-xl hover:-translate-y-1'
                                }`}
                        >
                            <div className="p-6 flex-1">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} text-white shadow-lg ${tool.shadow} flex items-center justify-center mb-6`}>
                                    {tool.icon}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{tool.name}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{tool.description}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                                className={`w-full p-4 text-sm font-black uppercase tracking-widest border-t transition-colors
                  ${activeTool === tool.id
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}
                            >
                                {activeTool === tool.id ? 'Close Module' : 'Open Module'}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Active Tool Area */}
            <AnimatePresence>
                {activeTool && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/40 backdrop-blur-md"
                        onClick={() => setActiveTool(null)}
                    >
                        <motion.div
                            initial={{ y: 50 }}
                            animate={{ y: 0 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative no-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tools.find(t => t.id === activeTool).gradient} text-white flex items-center justify-center`}>
                                        {tools.find(t => t.id === activeTool).icon}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{tools.find(t => t.id === activeTool).name}</h2>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Diagnostic Mode</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTool(null)}
                                    className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition"
                                >
                                    <ChevronDown size={24} />
                                </button>
                            </div>

                            <div className="p-8">
                                {React.createElement(tools.find(t => t.id === activeTool).component, { lang })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
