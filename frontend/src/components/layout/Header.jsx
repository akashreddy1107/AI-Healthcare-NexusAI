import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, Home, Stethoscope, FileText, Scale, IndianRupee, User, Users, Info, LogIn, MessageCircle, Wrench, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ lang, setLang }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    { path: '/diagnosis', label: 'Diagnosis', icon: <Stethoscope size={18} /> },
    { path: '/tools', label: 'Tools', icon: <Wrench size={18} /> },
    { path: '/history', label: 'History', icon: <ClipboardList size={18} /> },
    { path: '/explainability', label: 'XAI', icon: <FileText size={18} /> },
    { path: '/fairness', label: 'Fairness', icon: <Scale size={18} /> },
    { path: '/doctor', label: 'Doctors', icon: <Users size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition transform group-hover:scale-105">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                Nexus<span className="text-blue-600">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Healthcare for All</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                  ${isActive(item.path)
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {item.icon}
                {item.label}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-blue-100/50 -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            <div className="h-6 w-px bg-slate-200 mx-2" />

            {/* Language Selector */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
            </select>

            <Link
              to="/register"
              className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition transform hover:-translate-y-0.5"
            >
              Register
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-xl"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3
                    ${isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-2">
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Register New Patient
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
