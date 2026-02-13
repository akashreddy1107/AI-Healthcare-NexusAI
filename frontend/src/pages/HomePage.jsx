import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Activity, Heart, Brain, Scale, Landmark,
  User, ArrowRight, Zap, CheckCircle2, Eye, Mic,
  Droplets, Bone, ClipboardList, MessageSquare, Search
} from 'lucide-react';

export default function HomePage({ lang, t, accessibilityMode }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  const quickTools = [
    { id: 'anemia', name: 'Anemia Scan', icon: <Eye size={20} />, color: 'bg-rose-500', path: '/tools' },
    { id: 'cough', name: 'Cough Analysis', icon: <Mic size={20} />, color: 'bg-amber-500', path: '/tools' },
    { id: 'vein', name: 'Vein Finder', icon: <Droplets size={20} />, color: 'bg-blue-500', path: '/tools' },
    { id: 'xray', name: 'X-Ray Logic', icon: <Bone size={20} />, color: 'bg-violet-500', path: '/tools' },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Unified Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow-2xl shadow-blue-900/30 isolate">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-blue-600/30 blur-3xl mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-3xl mix-blend-screen" />

        <div className="relative z-10 p-8 md:p-16 lg:p-20 flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6 text-sm font-semibold text-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span>Unified Healthcare Intelligence</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight text-white">
              The <span className="text-blue-400">One Brain</span> <br />
              for Your Health.
            </h1>

            <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mb-10 leading-relaxed font-light">
              NexusAI integrates diagnostics, explainability, and history into a single, cohesive body.
              Analyze X-rays, check anemia, record coughs, and search your medical past with live AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/diagnosis"
                className="group relative px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg hover:bg-blue-400 transition shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                Start Diagnosis <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/history"
                className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition flex items-center gap-2 justify-center"
              >
                <ClipboardList size={20} /> View History
              </Link>
            </div>
          </motion.div>

          {/* Quick Tools Floating Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block w-80 p-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-300 mb-6 flex items-center gap-2">
              <Zap size={16} /> Quick Diagnostic Tools
            </h3>
            <div className="space-y-4">
              {quickTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition border border-white/5 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center text-white shadow-lg`}>
                    {tool.icon}
                  </div>
                  <span className="font-semibold text-white/90">{tool.name}</span>
                  <ArrowRight size={14} className="ml-auto text-white/30 group-hover:text-white transition" />
                </Link>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <div className="text-xs text-white/50 mb-1 font-medium">System Status</div>
              <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-green-400" /> AI CORE: ONLINE
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Unified Capabilities (The "One Brain" concept) */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">One System. All Features.</h2>
          <div className="h-1 flex-1 bg-slate-100 ml-6 rounded-full" />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              icon: Brain,
              title: 'Explainable Core',
              desc: 'Every diagnosis is explained through visual heatmaps and storytelling analogies for patients.',
              color: 'bg-purple-500',
              shadow: 'shadow-purple-200'
            },
            {
              icon: Scale,
              title: 'Fairness First',
              desc: 'Demographic audit logs ensure unbiased diagnostics across gender, age, and background.',
              color: 'bg-emerald-500',
              shadow: 'shadow-emerald-200'
            },
            {
              icon: Activity,
              title: 'Multi-Modal Hub',
              desc: 'X-rays, audio (coughs), visual scans, and vitals processed in a single neural thread.',
              color: 'bg-orange-500',
              shadow: 'shadow-orange-200'
            },
            {
              icon: Search,
              title: 'Semantic Memory',
              desc: 'AI-powered clinical history lookup and similar case matching across your medical records.',
              color: 'bg-blue-500',
              shadow: 'shadow-blue-200'
            }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                variants={item}
                className="group p-8 rounded-[2rem] bg-white shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.color} text-white flex items-center justify-center mb-6 shadow-xl ${feature.shadow} transform group-hover:scale-110 group-hover:rotate-6 transition duration-300`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {feature.desc}
                </p>
                <div className="mt-6 flex items-center text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Explore <ArrowRight size={16} className="ml-2" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Integration Showcase */}
      <section className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-200/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Integrated Healthcare Ecosystem</h2>
          <p className="text-slate-500 font-medium mb-12">
            No more fragmented apps. NexusAI merges clinical intelligence from NexMed and the semantic power of Nexus_2 into a single cohesive platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600 mb-4 ring-8 ring-blue-50">
                <MessageSquare size={32} />
              </div>
              <h4 className="font-bold text-slate-800">SMS Gateway</h4>
              <p className="text-xs text-slate-500">Offline patient communication</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-rose-600 mb-4 ring-8 ring-rose-50">
                <Heart size={32} />
              </div>
              <h4 className="font-bold text-slate-800">Triage Engine</h4>
              <p className="text-xs text-slate-500">Real-time risk assessment</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-amber-600 mb-4 ring-8 ring-amber-50">
                <ShieldCheck size={32} />
              </div>
              <h4 className="font-bold text-slate-800">Audit Logs</h4>
              <p className="text-xs text-slate-500">HIPAA compliant history</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Add Search icon import if missing from lucide-react (handled above)
// End of HomePage
