const API_BASE_URL = 'http://localhost:8000';

export const apiClient = {
    BASE_URL: API_BASE_URL,

    async healthCheck() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Backend not available:', error);
            return { status: 'degraded' };
        }
    },

    async registerPatient(patientData) {
        try {
            // Store patient in the medical history database
            const response = await fetch(`${API_BASE_URL}/api/medical-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patient_id: patientData.patientId || `PAT-${Date.now().toString(36).toUpperCase()}` })
            });
            const existing = await response.json();

            // Also store via learn endpoint to seed the vector DB with patient data
            const learnData = {
                patient_id: patientData.patientId || `PAT-${Date.now().toString(36).toUpperCase()}`,
                input_text: `Patient: ${patientData.name || 'Unknown'}, Age: ${patientData.age || 'N/A'}, Gender: ${patientData.gender || 'N/A'}, Location: ${patientData.location || 'N/A'}`,
                diagnosis: 'Registration',
                confidence: 100,
                verified: true
            };

            await fetch(`${API_BASE_URL}/api/learn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(learnData)
            });

            return {
                success: true,
                patientId: learnData.patient_id,
                ...patientData
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: true,
                patientId: `PAT-${Date.now().toString(36).toUpperCase()}`,
                ...patientData
            };
        }
    },

    async diagnose(formData) {
        try {
            console.log('🚀 Sending diagnosis request to backend...');
            const response = await fetch(`${API_BASE_URL}/api/diagnose`, {
                method: 'POST',
                body: formData,
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Backend error:', errorText);
                throw new Error(`Backend returned ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Diagnosis successful:', result);
            return result;
        } catch (error) {
            console.error('💥 Diagnosis failed:', error);
            alert(`Diagnosis Error: ${error.message}. Check console for details.`);
            throw error;
        }
    },

    async getFairnessReport() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/fairness-report/all`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch fairness report:', error);
            throw error;
        }
    },

    async getAuditLogs() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/audit-logs`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
            throw error;
        }
    },

    async getPatientSummary(patientId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patient/${encodeURIComponent(patientId)}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch patient summary:', error);
            throw error;
        }
    },

    // ═══════ MERGED API CALLS (from nexmed_ai + NEXUS_2) ═══════

    async anemiaEyeScan(imageBlob) {
        const fd = new FormData();
        fd.append('file', imageBlob, 'eye_scan.jpg');
        const response = await fetch(`${API_BASE_URL}/api/anemia-eye-scanner`, { method: 'POST', body: fd });
        return await response.json();
    },

    async analyzeCough(audioData, durationMs) {
        const response = await fetch(`${API_BASE_URL}/api/cough-analyzer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioData, duration: durationMs })
        });
        return await response.json();
    },

    async findVeins(imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const response = await fetch(`${API_BASE_URL}/api/vein-finder`, { method: 'POST', body: fd });
        return await response.json();
    },

    async analyzeXray(imageFile, symptoms = '') {
        const fd = new FormData();
        fd.append('file', imageFile);
        fd.append('symptoms', symptoms);
        const response = await fetch(`${API_BASE_URL}/api/xray-analyze`, { method: 'POST', body: fd });
        return await response.json();
    },

    async clinicalIntelligence(data) {
        const fd = new FormData();
        fd.append('age', data.age);
        fd.append('temp', data.temp);
        fd.append('symptoms', data.symptoms);
        if (data.history) fd.append('history', data.history);
        if (data.heart_rate) fd.append('heart_rate', data.heart_rate);
        if (data.bp) fd.append('bp', data.bp);
        if (data.o2) fd.append('o2', data.o2);
        const response = await fetch(`${API_BASE_URL}/api/clinical-intelligence`, { method: 'POST', body: fd });
        return await response.json();
    },

    async semanticSearch(query, patientId = null) {
        const response = await fetch(`${API_BASE_URL}/api/semantic-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, patient_id: patientId })
        });
        return await response.json();
    },

    async getMedicalHistory(patientId) {
        const response = await fetch(`${API_BASE_URL}/api/medical-history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patient_id: patientId })
        });
        return await response.json();
    },

    async uploadPrescription(formData) {
        const response = await fetch(`${API_BASE_URL}/api/prescription/upload`, {
            method: 'POST',
            body: formData
        });
        return await response.json();
    },

    async getSimilarCases(symptoms) {
        const response = await fetch(`${API_BASE_URL}/api/similar-cases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms })
        });
        return await response.json();
    },

    async riskProjection(imageFile, days = 7) {
        const fd = new FormData();
        fd.append('file', imageFile);
        fd.append('days', days);
        const response = await fetch(`${API_BASE_URL}/api/risk-projection`, { method: 'POST', body: fd });
        return await response.json();
    },

    async learnFromData(data) {
        const response = await fetch(`${API_BASE_URL}/api/learn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async sendSMS(recipient, message, patientId = 'ANON') {
        const response = await fetch(`${API_BASE_URL}/api/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipient, message, patient_id: patientId })
        });
        return await response.json();
    },

    async post(url, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            return { data: result };
        } catch (error) {
            console.error('API POST error:', error);
            throw error;
        }
    },
};
