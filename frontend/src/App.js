import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [movieName, setMovieName] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRecommendations = async () => {
    if (!movieName) return alert("Please enter a movie title!");
    setLoading(true);
    try {
      // Calls your Node.js Backend on Port 5000
      const response = await axios.get(`http://127.0.0.1:5000/api/recommend?movie=${movieName}`);
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error("Error:", error);
      alert("Movie not found! Try something like: Toy Story (1995)");
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px', 
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ fontSize: '3rem', color: '#e50914' }}>🎬 Movie Recommender</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>Powered by AI & MERN Stack</p>

      <div style={{ marginBottom: '40px' }}>
        <input 
          type="text" 
          placeholder="Enter a movie (e.g., Toy Story (1995))" 
          value={movieName}
          onChange={(e) => setMovieName(e.target.value)}
          style={{ 
            padding: '15px', 
            width: '400px', 
            borderRadius: '30px', 
            border: 'none', 
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button 
          onClick={getRecommendations}
          style={{ 
            padding: '15px 30px', 
            marginLeft: '10px', 
            borderRadius: '30px', 
            backgroundColor: '#e50914', 
            color: 'white', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            border: 'none'
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {recommendations.length > 0 && (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <h2 style={{ borderBottom: '2px solid #e50914', paddingBottom: '10px' }}>Top Recommendations:</h2>
            {recommendations.map((movie, index) => (
              <div key={index} style={{ 
                backgroundColor: '#333', 
                margin: '10px 0', 
                padding: '15px', 
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '1.1rem',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}>
                ⭐ {movie}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;