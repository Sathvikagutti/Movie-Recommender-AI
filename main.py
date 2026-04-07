from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
from pathlib import Path
from rapidfuzz import process, utils

app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "ai_service" / "movie_recommender.pkl"
CSV_PATH = BASE_DIR / "ai_service" / "movies.csv"

# 1. Enable CORS (Crucial for React to talk to Python)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. GLOBAL VARIABLES (Defining them at the top prevents NameErrors)
df = None
similarity = None

# 3. LOAD DATA (Updated to handle different pickle formats)
try:
    with MODEL_PATH.open('rb') as f:
        data = pickle.load(f)
        
        # Scenario A: Data is a dictionary with specific keys
        if isinstance(data, dict):
            # Try common keys: 'dataframe', 'movie_list', or 'df'
            df = data.get('dataframe') or data.get('df')
            similarity = data.get('similarity_matrix') or data.get('similarity') or data.get('sig') or data.get('correlation_matrix')

            if df is None and 'movie_list' in data:
                df = pd.DataFrame({'title': data['movie_list']})
                print("✅ DataFrame built from movie_list in pickle.")

        # Scenario B: The pickle is just the similarity matrix itself
        else:
            similarity =  data
            print("Pickle contains matrix only. Loading titles from CSV...")

        # If df is still empty, load it from the CSV file
        if df is None:
            if CSV_PATH.exists():
                df = pd.read_csv(CSV_PATH)
                print("✅ DataFrame loaded from CSV.")
            else:
                raise FileNotFoundError(f"Missing movies.csv at {CSV_PATH}")

    if similarity is not None and df is not None:
        print("✅ SUCCESS: Movie data and Similarity Matrix loaded!")
    else:
        print("⚠️ WARNING: Data loaded but variables are empty.")

except Exception as e:
    print(f"❌ ERROR LOADING DATA: {e}")

# 4. THE FUZZY SEARCH FUNCTION
def find_closest_title(user_input):
    if df is None:
        return None
    all_titles = df['title'].tolist()
    # Find the best match
    result = process.extractOne(user_input, all_titles, processor=utils.default_process)
    if result and result[1] > 60: 
        return result[0]
    return None

# 5. THE API ENDPOINTS
@app.get("/")
def home():
    return {"message": "AI Server is running"}

@app.get("/list-movies")
def list_movies():
    if df is not None:
        return {"titles": df['title'].tolist()}
    return {"titles": []}

@app.get("/recommend")
def get_recommendations(movie_title: str):
    if df is None or similarity is None:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")

    # Step A: Fix the movie title (Fuzzy Match)
    matched_title = find_closest_title(movie_title)
    
    if not matched_title:
        raise HTTPException(status_code=404, detail="Movie not found.")

    # Step B: Standard Recommendation Logic
    try:
        idx = df[df['title'] == matched_title].index[0]
        distances = similarity[idx]
        movie_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:11]
        
        recs = [df.iloc[i[0]].title for i in movie_list]
        return {"recommendations": recs, "matched_title": matched_title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)