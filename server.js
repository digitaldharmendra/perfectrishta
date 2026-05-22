const express = require('express');
const path = require('path');
const app = express();

// Use Hostinger's dynamic PORT or default to 3000
const PORT = process.env.PORT || 3000;

// Serve all static assets and files from the root directory
app.use(express.static(__dirname));

// Direct all routing to index.html to maintain clean SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`PerfectRishta Premium Server running on port ${PORT}`);
});
