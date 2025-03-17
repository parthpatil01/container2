const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
app.use(express.json());

const PV_DIR = '/parth_PV_dir';

// Endpoint to calculate product total
app.post('/calculate', (req, res) => {
    console.log("inside container 2")
   
    const { file, product } = req.body;

    if (!file || !product) {
        return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
    }

    const filePath = path.join(PV_DIR, file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ file, error: 'File not found.' });
    }

    // Check if the file has a .csv extension
    if (path.extname(filePath).toLowerCase() !== '.csv') {
        return res.status(400).json({ file, error: 'Input file not in CSV format.' });
    }

    const results = [];
    fs.createReadStream(filePath)
        .pipe(csv({ headers: ['product', 'amount'], skipLines: 0 }))
        .on('data', (data) => results.push(data))
        .on('end', () => {
            try {
                const total = results
                    .filter((row) => row.product === product)
                    .reduce((sum, row) => sum + parseInt(row.amount), 0);

                res.json({ file, sum: total });
            } catch (error) {
                res.status(400).json({ file, error: 'Input file not in CSV format.' });
            }
        });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Container 2 running on port ${PORT}`);
});