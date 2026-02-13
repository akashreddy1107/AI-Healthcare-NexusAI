"""
Medical Database Service — SQLite-based patient records, prescriptions, and learning data.
Ported from NEXUS_2 backend.
"""
import os
import sqlite3
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

VAULT_BASE = os.getenv("VAULT_BASE", "./nexus_vault")
os.makedirs(f"{VAULT_BASE}/prescriptions", exist_ok=True)
os.makedirs(f"{VAULT_BASE}/records", exist_ok=True)

DB_PATH = f"{VAULT_BASE}/medical_history.db"


def get_connection():
    return sqlite3.connect(DB_PATH)


def init_database():
    """Initialize SQLite database for medical history"""
    conn = get_connection()
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS patients
                (patient_id TEXT PRIMARY KEY,
                 name TEXT,
                 age INTEGER,
                 gender TEXT,
                 location TEXT,
                 created_date TEXT,
                 last_visit TEXT)''')

    c.execute('''CREATE TABLE IF NOT EXISTS prescriptions
                (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 patient_id TEXT,
                 doctor_name TEXT,
                 hospital_name TEXT,
                 date TEXT,
                 diagnosis TEXT,
                 symptoms TEXT,
                 duration_days INTEGER,
                 follow_up_date TEXT,
                 image_path TEXT,
                 embedding_id TEXT,
                 FOREIGN KEY(patient_id) REFERENCES patients(patient_id))''')

    c.execute('''CREATE TABLE IF NOT EXISTS medicines
                (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 prescription_id INTEGER,
                 name TEXT,
                 dosage TEXT,
                 frequency TEXT,
                 duration TEXT,
                 instructions TEXT,
                 FOREIGN KEY(prescription_id) REFERENCES prescriptions(id))''')

    c.execute('''CREATE TABLE IF NOT EXISTS allergies
                (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 patient_id TEXT,
                 allergen TEXT,
                 reaction TEXT,
                 severity TEXT,
                 date_diagnosed TEXT,
                 FOREIGN KEY(patient_id) REFERENCES patients(patient_id))''')

    c.execute('''CREATE TABLE IF NOT EXISTS chronic_conditions
                (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 patient_id TEXT,
                 condition_name TEXT,
                 diagnosed_date TEXT,
                 status TEXT,
                 notes TEXT,
                 FOREIGN KEY(patient_id) REFERENCES patients(patient_id))''')

    c.execute('''CREATE TABLE IF NOT EXISTS learning_data
                (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 patient_id TEXT,
                 input_text TEXT,
                 diagnosis TEXT,
                 confidence REAL,
                 verified BOOLEAN,
                 usage_count INTEGER DEFAULT 0,
                 timestamp TEXT,
                 embedding_id TEXT UNIQUE,
                 FOREIGN KEY(patient_id) REFERENCES patients(patient_id))''')

    conn.commit()
    conn.close()
    logger.info("Medical database initialized successfully")


def ensure_patient(patient_id: str, name: str = None, age: int = None, gender: str = None):
    """Create or update patient record"""
    conn = get_connection()
    c = conn.cursor()
    now = datetime.now().isoformat()
    c.execute('''INSERT OR REPLACE INTO patients
                (patient_id, name, age, gender, created_date, last_visit)
                VALUES (?, ?, ?, ?, ?, ?)''',
              (patient_id, name or "Unknown", age, gender, now, now))
    conn.commit()
    conn.close()


def add_prescription(patient_id: str, doctor_name: str, hospital_name: str,
                     diagnosis: str, symptoms: str, medicines_list: List[Dict],
                     duration_days: int = 7, image_path: str = None, embedding_id: str = None):
    """Store a prescription with medicines"""
    conn = get_connection()
    c = conn.cursor()
    now = datetime.now().isoformat()

    c.execute('''INSERT INTO prescriptions
                (patient_id, doctor_name, hospital_name, date,
                 diagnosis, symptoms, duration_days, image_path, embedding_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (patient_id, doctor_name, hospital_name, now,
               diagnosis, symptoms, duration_days, image_path, embedding_id))
    prescription_id = c.lastrowid

    for med in medicines_list:
        c.execute('''INSERT INTO medicines
                    (prescription_id, name, dosage, frequency, duration, instructions)
                    VALUES (?, ?, ?, ?, ?, ?)''',
                  (prescription_id, med.get("name", ""), med.get("dosage", ""),
                   med.get("frequency", ""), med.get("duration", ""), med.get("instructions", "")))

    conn.commit()
    conn.close()
    return prescription_id


def add_learning_data(patient_id: str, input_text: str, diagnosis: str,
                      confidence: float, verified: bool, embedding_id: str):
    """Store learning data entry"""
    conn = get_connection()
    c = conn.cursor()
    now = datetime.now().isoformat()
    c.execute('''INSERT INTO learning_data
                (patient_id, input_text, diagnosis, confidence, verified, usage_count, timestamp, embedding_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
              (patient_id, input_text, diagnosis, confidence, verified, 0, now, embedding_id))
    conn.commit()
    conn.close()


def get_medical_history(patient_id: str) -> Dict[str, Any]:
    """Retrieve complete medical history for a patient"""
    conn = get_connection()
    c = conn.cursor()

    c.execute('SELECT * FROM patients WHERE patient_id = ?', (patient_id,))
    patient = c.fetchone()

    c.execute('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY date DESC', (patient_id,))
    prescriptions_data = c.fetchall()

    history = []
    for pres in prescriptions_data:
        c.execute('SELECT * FROM medicines WHERE prescription_id = ?', (pres[0],))
        medicines = c.fetchall()

        med_list = [{"name": m[2], "dosage": m[3], "frequency": m[4],
                     "duration": m[5], "instructions": m[6]} for m in medicines]

        history.append({
            "prescription_id": pres[0],
            "date": pres[4],
            "doctor_name": pres[2],
            "hospital_name": pres[3],
            "diagnosis": pres[5],
            "symptoms": pres[6],
            "duration_days": pres[7],
            "medicines": med_list
        })

    # Get allergies
    c.execute('SELECT * FROM allergies WHERE patient_id = ?', (patient_id,))
    allergies = [{"allergen": a[2], "reaction": a[3], "severity": a[4]} for a in c.fetchall()]

    # Get chronic conditions
    c.execute('SELECT * FROM chronic_conditions WHERE patient_id = ?', (patient_id,))
    conditions = [{"condition": cc[2], "diagnosed_date": cc[3], "status": cc[4]} for cc in c.fetchall()]

    conn.close()

    return {
        "patient_id": patient_id,
        "patient_info": {
            "name": patient[1] if patient else "Unknown",
            "age": patient[2] if patient else None,
            "gender": patient[3] if patient else None,
        } if patient else None,
        "prescriptions": history,
        "allergies": allergies,
        "chronic_conditions": conditions,
        "total_prescriptions": len(history)
    }


# Initialize on import
init_database()
