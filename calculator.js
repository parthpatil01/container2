const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
app.use(express.json());

const PV_DIR = '/parth_PV_dir';

// Endpoint to calculate product total
app.post('/calculate', (req, res) => {
    console.log("inside container 2");
   
    const { file, product } = req.body;
    console.log(file)
    console.log(product)

    if (!file || !product) {
        return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
    }

    const filePath = path.join(PV_DIR, file);
    console.log(filePath)

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ file, error: 'File not found.' });
    }

    // Read file content to check if it looks like CSV
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    // Basic check if content has comma-separated values
    if (lines.length === 0 || !lines[0].includes(',')) {
        return res.status(400).json({ file, sum: 0, error: 'Input file not in CSV format.' });
    }

    const results = [];
    fs.createReadStream(filePath)
        .pipe(csv({ headers: ['product', 'amount'], skipLines: 0 }))
        .on('data', (data) => results.push(data))
        .on('error', () => {
            res.status(400).json({ file, sum: 0, error: 'Input file not in CSV format.' });
        })
        .on('end', () => {
            try {
                // Make sure we have valid data
                if (results.length === 0) {
                    return res.status(400).json({ file, sum: 0, error: 'Input file not in CSV format.' });
                }
                
                const total = results
                    .filter((row) => row.product === product)
                    .reduce((sum, row) => sum + parseInt(row.amount), 0);

                res.json({ file, sum: total });
            } catch (error) {
                res.status(400).json({ file, sum: 0, error: 'Input file not in CSV format.' });
            }
        });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Container 2 running on port ${PORT}`);
});