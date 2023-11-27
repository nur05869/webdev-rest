import * as path from 'node:path';
import * as url from 'node:url';

import { default as express } from 'express';
import { default as sqlite3 } from 'sqlite3';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

const port = 8000;

let app = express();
app.use(express.json());

/********************************************************************
 ***   DATABASE FUNCTIONS                                         *** 
 ********************************************************************/
// Open SQLite3 database (in read-write mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});

// Create Promise for SQLite3 database SELECT query 
function dbSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}

// Create Promise for SQLite3 database INSERT or DELETE query
function dbRun(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

/********************************************************************
 ***   REST REQUEST HANDLERS                                      *** 
 ********************************************************************/
// GET request handler for crime codes
app.get('/codes', async (req, res) => {
    console.log(req.query);
    try {
        let query = 'SELECT * FROM Codes';
        const params = [];

        // Check if 'code' query parameter is present
        if (req.query.code) {
            const codeList = req.query.code.split(',').map(Number);
            if (codeList.length > 0) {
                query += ' WHERE code IN (' + codeList.map(() => '?').join(',') + ')';
                params.push(...codeList);
            }
        }

        const codes = await dbSelect(query, params);
        res.status(200).type('json').send(codes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




// GET request handler for neighborhoods
app.get('/neighborhoods', async (req, res) => {
    try {
        const neighborhoods = await dbSelect('SELECT * FROM Neighborhoods ORDER BY neighborhood_number', []);
        const formattedNeighborhoods = neighborhoods.map(({ neighborhood_number, neighborhood_name }) => ({
            id: neighborhood_number,
            name: neighborhood_name,
        }));
        res.status(200).type('json').send(formattedNeighborhoods);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// GET request handler for crime incidents
app.get('/incidents', async (req, res) => {
    try {
        const incidents = await dbSelect(`
            SELECT 
                case_number, 
                strftime('%Y-%m-%d', date_time) as date, 
                strftime('%H:%M:%S', date_time) as time,
                code, 
                incident, 
                police_grid, 
                neighborhood_number, 
                block
            FROM Incidents 
            ORDER BY date_time`, []);

        res.status(200).type('json').send(incidents);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// PUT request handler for new crime incident
app.put('/new-incident', async (req, res) => {
    const { case_number, date, time, code, incident, police_grid, neighborhood_number, block } = req.body;

    try {
        // Check if the case_number already exists in the database
        const existingIncident = await dbSelect('SELECT * FROM Incidents WHERE case_number = ?', [case_number]);

        if (existingIncident.length > 0) {
            // Case number already exists, reject the request
            res.status(500).send('Case number already exists in the database');
        } else {
            // Case number does not exist, proceed with the insertion
            await dbRun('INSERT INTO Incidents VALUES (?, ?, ?, ?, ?, ?, ?)', [
                case_number,
                `${date} ${time}`, // Combine date and time into a single DATETIME string
                code,
                incident,
                police_grid,
                neighborhood_number,
                block,
            ]);

            res.status(200).type('txt').send('OK');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// DELETE request handler for new crime incident
app.delete('/remove-incident', async (req, res) => {
    const { case_number } = req.body;

    try {
        // Check if the case_number exists in the database
        const existingIncident = await dbSelect('SELECT * FROM Incidents WHERE case_number = ?', [case_number]);

        if (existingIncident.length === 0) {
            // Case number does not exist, reject the request
            res.status(500).send('Case number does not exist in the database');
        } else {
            // Case number exists, proceed with the deletion
            await dbRun('DELETE FROM Incidents WHERE case_number = ?', [case_number]);
            res.status(200).type('txt').send('OK');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

/********************************************************************
 ***   START SERVER                                               *** 
 ********************************************************************/
// Start server - listen for client connections
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
