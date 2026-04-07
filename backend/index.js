const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000; // Node.js runs on 5000, Python runs on 8000

app.use(cors());
app.use(express.json());

// This is the route your React app will call later
app.get('/api/recommend', async (req, res) => {
    try {
        const { movie } = req.query;
        
        // This line calls your Python FastAPI service
        const response = await axios.get(`http://127.0.0.1:8000/recommend?movie_title=${movie}`);
        
        res.json(response.data);
    } catch (error) {
        console.error("Error calling AI service:", error.message);
        res.status(500).json({ error: "Could not fetch recommendations from AI service" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://127.0.0.1:${PORT}`);
});