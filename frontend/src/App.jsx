import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DiagnosisPage from './pages/DiagnosisPage';
import PatientRegistrationPage from './pages/PatientRegistrationPage';
import ExplainabilityPage from './pages/ExplainabilityPage';
import FairnessPage from './pages/FairnessPage';
import ProfilePage from './pages/ProfilePage';
import LoanPage from './pages/LoanPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import KnowledgePage from './pages/KnowledgePage';
import TestAllFeaturesPage from './pages/TestAllFeaturesPage';
import ToolsPage from './pages/ToolsPage';
import MedicalHistoryPage from './pages/MedicalHistoryPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { translations } from './utils/translations';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';

export default function App() {
    const [lang, setLang] = useState('en');
    const [diagnosisReport, setDiagnosisReport] = useState(null);
    const [reportScanResult, setReportScanResult] = useState(null); // Stores Village Vaidya scan results
    const [accessibilityMode, setAccessibilityMode] = useState(false);
    const [hasConsent, setHasConsent] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const t = translations[lang] || translations.en;
    const { speak } = useVoiceAssistant();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHasConsent(window.localStorage.getItem('seva-consent') === 'yes');
            setIsOffline(!window.navigator.onLine);

            const handleOnline = () => setIsOffline(false);
            const handleOffline = () => setIsOffline(true);

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);

    const handleDiagnosisComplete = (report) => {
        setDiagnosisReport(report);
        if (report?.risk) {
            speak(`Diagnosis ready. Risk level ${report.risk}.`);
        }
    };

    const handleReportScanComplete = (scanResult) => {
        setReportScanResult(scanResult);
    };

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
                <Header lang={lang} setLang={setLang} />

                {!hasConsent && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70">
                        <div className="max-w-lg w-full mx-4 p-6 rounded-2xl bg-white shadow-xl space-y-4 text-sm">
                            <h2 className="text-xl font-bold">Consent & Privacy</h2>
                            <p className="text-slate-600">
                                Your medical data stays on this device and is used only to generate AI-assisted
                                guidance. This demo is not a substitute for a real doctor.
                            </p>
                            <ul className="list-disc pl-5 text-slate-600 space-y-1">
                                <li>No data is sent to public servers.</li>
                                <li>Inputs are anonymised in audit logs.</li>
                                <li>You can close the app any time to clear the session.</li>
                            </ul>
                            <button
                                className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                                onClick={() => {
                                    setHasConsent(true);
                                    if (typeof window !== 'undefined') {
                                        window.localStorage.setItem('seva-consent', 'yes');
                                    }
                                }}
                            >
                                I Understand and Agree
                            </button>
                        </div>
                    </div>
                )}

                {isOffline && (
                    <div className="bg-amber-100 text-amber-900 text-xs py-2 text-center">
                        Offline mode: AI runs locally using approximate rules. Some reports may be limited until
                        internet returns.
                    </div>
                )}

                <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 md:py-10">
                    <Routes>
                        <Route path="/" element={<HomePage lang={lang} t={t} accessibilityMode={accessibilityMode} />} />
                        <Route
                            path="/register"
                            element={
                                <PatientRegistrationPage
                                    lang={lang}
                                    t={t}
                                    accessibilityMode={accessibilityMode}
                                />
                            }
                        />
                        <Route
                            path="/diagnosis"
                            element={
                                <DiagnosisPage
                                    lang={lang}
                                    t={t}
                                    accessibilityMode={accessibilityMode}
                                    onDiagnosisComplete={handleDiagnosisComplete}
                                    onReportScan={handleReportScanComplete}
                                    savedReport={diagnosisReport}
                                />
                            }
                        />
                        <Route
                            path="/explainability"
                            element={
                                <ExplainabilityPage
                                    report={diagnosisReport}
                                    reportScan={reportScanResult}
                                    lang={lang}
                                    t={t}
                                    accessibilityMode={accessibilityMode}
                                />
                            }
                        />
                        <Route
                            path="/fairness"
                            element={<FairnessPage report={diagnosisReport} lang={lang} t={t} accessibilityMode={accessibilityMode} />}
                        />
                        <Route
                            path="/loan"
                            element={<LoanPage report={diagnosisReport} lang={lang} t={t} accessibilityMode={accessibilityMode} />}
                        />
                        <Route
                            path="/doctor"
                            element={<DoctorDashboardPage lang={lang} t={t} accessibilityMode={accessibilityMode} />}
                        />
                        <Route path="/test-features" element={<TestAllFeaturesPage />} />
                        <Route path="/knowledge" element={<KnowledgePage lang={lang} t={t} />} />
                        <Route path="/profile" element={<ProfilePage lang={lang} t={t} accessibilityMode={accessibilityMode} />} />
                        <Route path="/tools" element={<ToolsPage lang={lang} t={t} />} />
                        <Route path="/history" element={<MedicalHistoryPage lang={lang} t={t} />} />
                    </Routes>
                </main>

                <Footer />
            </div>
        </BrowserRouter>
    );
}
