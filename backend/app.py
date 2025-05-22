import pandas as pd
import numpy as np
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import time
import uvicorn
from typing import Dict, Any

# --- FastAPI App ---
app = FastAPI(title="Medical Chatbot API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
DATA_PATH = 'paumedquad.csv'  # Keep this CSV in same directory when deploying

# --- Models ---
class Query(BaseModel):
    query: str

class Response(BaseModel):
    answer: str
    confidence: float
    response_time: float

# --- Preprocessing ---
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'\W+', ' ', text)
    return text

# --- Load dataset and model (only once at startup) ---
print("Loading dataset and model...")
start_time = time.time()

# Load dataset
df = pd.read_csv(DATA_PATH)
df['Clean_Question'] = df['question'].apply(clean_text)

# Load model & encode questions (only once)
model = SentenceTransformer('all-MiniLM-L6-v2')
question_embeddings = model.encode(df['Clean_Question'].tolist(), show_progress_bar=True)

print(f"Loaded dataset with {len(df)} QA pairs")
print(f"Model and data loading took {time.time() - start_time:.2f} seconds")

# --- API Routes ---
@app.get("/")
def read_root():
    return {"status": "Medical Chatbot API is running"}

@app.post("/ask", response_model=Response)
def ask_question(query: Query) -> Dict[str, Any]:
    start_time = time.time()
    
    try:
        user_query_clean = clean_text(query.query)
        query_embedding = model.encode([user_query_clean])
        
        # Use numpy for faster similarity calculation
        similarities = np.dot(query_embedding, question_embeddings.T)[0]
        best_match_idx = np.argmax(similarities)
        
        matched_answer = df['answer'].iloc[best_match_idx]
        confidence = float(similarities[best_match_idx])
        
        processing_time = time.time() - start_time
        
        return {
            "answer": matched_answer,
            "confidence": round(confidence, 2),
            "response_time": round(processing_time, 3)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
