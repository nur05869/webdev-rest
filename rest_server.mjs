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
app.get('/codes', (req, res) => {
    try {
        let query = 'SELECT * FROM Codes';
        let params = [];

        // Check if the 'code' query parameter is provided
        if (req.query.code) {
            const codeList = req.query.code.split(',').map(Number);
            query += ' WHERE code IN (' + codeList.map(() => '?').join(',') + ')';
            params = codeList;
        }

        query += ' ORDER BY code';

        // Execute the query synchronously
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.status(200).type('json').send(rows);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});





// GET request handler for neighborhoods
app.get('/neighborhoods', (req, res) => {
    const neighborhoodIds = req.query.id; // Assuming it's a comma-separated list

    let query = 'SELECT * FROM Neighborhoods';

    if (neighborhoodIds) {
        const idsArray = neighborhoodIds.split(',').map(Number);
        query += ` WHERE neighborhood_number IN (${idsArray.join(',')})`;
    }

    db.all(query, [], (err, neighborhoods) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            // Sort neighborhoods by id
            neighborhoods.sort((a, b) => a.neighborhood_number - b.neighborhood_number);

            const result = neighborhoods.map(({ neighborhood_number, neighborhood_name }) => ({
                id: neighborhood_number,
                name: neighborhood_name,
            }));

            res.status(200).type('json').send(result);
        }
    });
});


// GET request handler for crime incidents
// Endpoint to retrieve incidents with optional filters
app.get('/incidents', (req, res) => {
    // Base query with no filters
    let query = 'SELECT * FROM incidents';

    let params = [];

    let count = 0;


    if (req.query.hasOwnProperty('code')) {
        if (count > 0) {
            query += " AND ";
        } else {
            query += " WHERE ";
        }
        query += "code = " + req.query.code;
        count++;
    }

    if (req.query.hasOwnProperty('grid')) {
        if (count > 0) {
            query += " AND ";
        } else {
            query += " WHERE ";
        }
        query += "police_grid = " + req.query.grid;
        count++;
    }

    if (req.query.hasOwnProperty('id')) {
        if (count > 0) {
            query += " AND ";
        } else {
            query += " WHERE ";
        }
        query += "neighborhood_number = " + req.query.id;
        count++;
    }

    if (req.query.hasOwnProperty('limit')) {
        limit = req.query.limit;
    }
    query += " LIMIT " + 1000;

    console.log('Final Query:', query);

    dbSelect(query, params)
        .then((rows) => {
            res.status(200).type('json').send(rows);
        })
        .catch((error) => {
            res.status(500).type('txt').send(error);
        });
});




// PUT request handler for new crime incident
app.put('/new-incident/:case_number', (req, res) => {
    const case_number = req.params.case_number;

    const { date_time, code, police_grid, neighborhood_number, block } = req.body;

    if (!date_time || !code || !police_grid || !neighborhood_number || !block) {
        res.status(400).json({ error: 'Missing required fields in the request body' });
        return;
    }

    const query = 'INSERT INTO incidents (case_number, date_time, code, police_grid, neighborhood_number, block) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [case_number, date_time, code, police_grid, neighborhood_number, block];

    dbRun(query, params)
        .then(() => {
            res.status(200).json({ message: 'Incident added successfully' });
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});


// DELETE request handler for new crime incident
app.delete('/remove-incident', (req, res) => {
    const caseNumber = req.query.case_number;

    const query = 'DELETE FROM Incidents WHERE case_number = ?';
    const params = [caseNumber];

    console.log('Delete Query:', query);

    dbRun(query, params)
        .then(() => {
            console.log('Incident Removed');
            res.status(200).json({ message: 'Incident removed successfully' });
        })
        .catch((error) => {
            console.error('Error removing incident:', error.message);
            res.status(500).json({ error: error.message });
        });

    console.log('Query Parameters:', params);
});

/********************************************************************
 ***   START SERVER                                               *** 
 ********************************************************************/
// Start server - listen for client connections
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
