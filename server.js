const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const CSV_PATH = path.join(__dirname, 'data', 'restaurants.csv');

const HEADERS = 'name,cuisineTypes,priceRange,location,timeToServe,minPeople,maxPeople,openHours,dineOptions,rating,notes,linkGoogleMaps,websiteLink';

// Parse raw text body for CSV
app.use('/api/restaurants', express.text({ type: '*/*', limit: '5mb' }));

// GET /api/restaurants — return CSV file contents
app.get('/api/restaurants', (req, res) => {
    try {
        if (!fs.existsSync(CSV_PATH)) {
            // Return just headers if file doesn't exist
            return res.type('text/csv').send(HEADERS + '\n');
        }
        const csv = fs.readFileSync(CSV_PATH, 'utf-8');
        res.type('text/csv').send(csv);
    } catch (err) {
        console.error('Error reading CSV:', err);
        res.status(500).json({ error: 'Failed to read restaurant data' });
    }
});

// POST /api/restaurants — save CSV text to file
app.post('/api/restaurants', (req, res) => {
    try {
        const csvText = req.body;
        if (!csvText || typeof csvText !== 'string') {
            return res.status(400).json({ error: 'CSV text is required' });
        }
        // Ensure data directory exists
        const dir = path.dirname(CSV_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(CSV_PATH, csvText, 'utf-8');
        console.log(`Saved ${csvText.split('\n').length - 1} rows to ${CSV_PATH}`);
        res.json({ success: true });
    } catch (err) {
        console.error('Error writing CSV:', err);
        res.status(500).json({ error: 'Failed to save restaurant data' });
    }
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`API server running on http://127.0.0.1:${PORT}`);
});
