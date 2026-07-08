const express = require('express');
const mysql = require('mysql2');
const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mithulen2008', // Make sure this matches your MySQL password
    database: 'c237_studentlistapp'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// 1. Home Route - Fetch all students
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM student';

    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving students');
        }
        res.render('index', { students: results });
    });
});

// 2. Individual Student Route
app.get('/student/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentid = ?';

    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving student by ID');
        }

        if (results.length > 0) {
            res.render('student', { student: results[0] });
        } else {
            res.status(404).send('Student not found');
        }
    });
});

// 3. Add Student Form View
app.get('/addStudent', (req, res) => {
    res.render('addStudent');
});

// 4. Add Student Form Submission
app.post('/addStudent', (req, res) => {
    const { name, dob, contact, image } = req.body;
    const sql = 'INSERT INTO student (name, dob, contact, image) VALUES (?, ?, ?, ?)';

    connection.query(sql, [name, dob, contact, image], (error, results) => {
        if (error) {
            console.error("Error adding student:", error);
            res.status(500).send('Error adding student');
        } else {
            res.redirect('/');
        }
    });
});

// 5. Edit Student Form View
app.get('/editStudent/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'SELECT * FROM student WHERE studentid = ?';
    
    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error retrieving student by ID');
        }
        if (results.length > 0) {
            res.render('editStudent', { student: results[0] });
        } else {
            res.send('Student not found');
        }
    });
});

// 6. Edit Student Form Submission
app.post('/editStudent/:id', (req, res) => {
    const studentId = req.params.id;
    const { name, dob, contact } = req.body;
    const sql = 'UPDATE student SET name = ?, dob = ?, contact = ? WHERE studentid = ?';
    
    connection.query(sql, [name, dob, contact, studentId], (error, results) => {
        if (error) {
            console.error("Error updating student:", error);
            res.send('Error updating student');
        } else {
            res.redirect('/');
        }
    });
});

// 7. Delete Student Route
app.get('/deleteStudent/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'DELETE FROM student WHERE studentid = ?';
    
    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error("Error deleting student:", error);
            res.send('Error deleting student');
        } else {
            res.redirect('/');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));