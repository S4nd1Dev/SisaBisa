import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
from pydantic import BaseModel
import tensorflow as tf
import requests 

app = FastAPI(title="SisaBisa AI Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("⏳ Memuat artefak AI SisaBisa...")

# =====================================================================
# PATCH SAPU JAGAT: AMANKAN SEMUA LAYER DARI QUANTIZATION_CONFIG
# =====================================================================
from keras.src.layers.layer import Layer
original_layer_init = Layer.__init__

def patched_layer_init(self, *args, **kwargs):
    kwargs.pop('quantization_config', None)
    original_layer_init(self, *args, **kwargs)

Layer.__init__ = patched_layer_init
# =====================================================================

# Proses load model Two-Tower
tower_kulkas = tf.keras.models.load_model("tower_kulkas.keras", compile=False)
resep_embeddings = np.load("resep_embeddings.npy")

with open("tokenizer.json", "r", encoding="utf-8") as f:
    tokenizer_data = f.read()
    tokenizer = tf.keras.preprocessing.text.tokenizer_from_json(tokenizer_data)

df_resep = pd.read_excel("dataset_resep_format_final.xlsx") 

# API Key baru yang fresh dari Google AI Studio
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyAaIsGrCVwQ7OICUcGUtIbUnCtmyv4W0sk")

print("✅ Semua komponen AI Berhasil Dimuat!")

class RekomendasiRequest(BaseModel):
    bahan_user: str  
    bahan_mau_basi: str = ""  

@app.post("/api/rekomendasi")
def cari_rekomendasi(request: RekomendasiRequest):
    try:
        input_text = request.bahan_user.lower().strip()
        seq = tokenizer.texts_to_sequences([input_text])
        pad = tf.keras.preprocessing.sequence.pad_sequences(
            seq, maxlen=40, padding="post"
        )

        vektor_kulkas = tower_kulkas.predict(pad, verbose=0)[0]
        raw_scores = np.dot(resep_embeddings, vektor_kulkas)
        scores = (raw_scores + 1.0) / 2.0  

        df_temp = df_resep.copy()
        df_temp["score"] = scores

        if request.bahan_mau_basi.strip():
            bahan_basi = request.bahan_mau_basi.lower().strip()
            df_temp = df_temp[df_temp["bahan"].str.lower().str.contains(bahan_basi)]

        if df_temp.empty:
            return {"status": "success", "message": "Tidak ada resep cocok", "results": []}

        top_resep = df_temp.sort_values(by="score", ascending=False).head(5)
        results = []
        for _, row in top_resep.iterrows():
            results.append({
                "nama_menu": row["nama_menu"],
                "bahan_resep": row["bahan"],
                "persentase_kecocokan": f"{round(row['score'] * 100)}%",
            })

        return {"status": "success", "results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DetailRequest(BaseModel):
    nama_menu: str
    bahan_resep: str

@app.post("/api/detail-resep")
def dapatkan_detail(request: DetailRequest):
    prompt = f"""
    Kamu adalah koki profesional dan ahli gizi dari aplikasi SisaBisa.
    Menu: {request.nama_menu}
    Bahan Dasar: {request.bahan_resep}
    
    Tolong buatkan:
    1. 4 langkah memasak yang ringkas dan jelas.
    2. Estimasi kandungan nutrisi (Kalori, Protein, Karbohidrat, Lemak).
    
    Format output HARUS berupa JSON murni tanpa markdown dengan struktur seperti ini:
    {{
        "langkah_memasak": ["Langkah 1...", "Langkah 2..."],
        "nutrisi": {{"kalori": "350 kkal", "protein": "25g", "karbohidrat": "40g", "lemak": "12g"}}
    }}
    """
    
    def tembak_gemini(nama_model):
        url = f"https://generativelanguage.googleapis.com/v1beta/{nama_model}:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        return requests.post(url, headers=headers, json=payload)
    
    try:
        # Coba akses menggunakan model utama
        target_model = "models/gemini-1.5-flash"
        response = tembak_gemini(target_model)
        response_json = response.json()
        
        # Fitur Auto-Discover jika model flash butuh penyesuaian rute di akun baru
        if "error" in response_json and response_json["error"].get("status") == "NOT_FOUND":
            url_list = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}"
            list_response = requests.get(url_list).json()
            
            if "models" in list_response:
                for model in list_response["models"]:
                    if "generateContent" in model.get("supportedGenerationMethods", []):
                        target_model = model["name"]
                        break
                response = tembak_gemini(target_model)
                response_json = response.json()
        
        if "error" in response_json:
            pesan_asli = response_json["error"].get("message", "Error misterius")
            raise Exception(f"Google API Error: {pesan_asli}")
        
        text_output = response_json['candidates'][0]['content']['parts'][0]['text']
        text_cleaned = text_output.replace("```json", "").replace("```", "").strip()
        
        return {"status": "success", "data": json.loads(text_cleaned)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))