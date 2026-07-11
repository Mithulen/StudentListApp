
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

// Set up view engine and middleware
app.set('view engine', 'ejs');
app.use(express.static('public')); 
app.use(express.urlencoded({ extended: false }));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); 
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); 
    }
});
const upload = multer({ storage: storage });

// Database Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mithulen2008', 
    database: 'c237_studentlistapp'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// --- ROUTES ---

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
app.post('/addStudent', upload.single('image'), (req, res) => {
    const { studentName, dob, contact } = req.body;
    
    // Check if a new image was uploaded
    let image = req.file ? req.file.filename : null;

    const sql = 'INSERT INTO student (studentName, dob, contact, image) VALUES (?, ?, ?, ?)';
    
    connection.query(sql, [studentName, dob, contact, image], (error, results) => {
        if (error) {
            console.error("Error adding student:", error);
            res.send('Error adding student');
        } else {
            res.redirect('/');
        }
    });
});

// 5. Route to retrieve a student - Edit View
app.get('/editStudent/:id', (req, res) => {
    const studentId = req.params.id;
    
    const sql = 'SELECT * FROM student WHERE studentid = ?'; 
    
    connection.query(sql, [studentId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.send('Error retrieving student by ID');
        }
        if (results.length > 0) {
            res.render('updateStudent', { student: results[0] });
        } else {
            res.send('Student not found');
        }
    });
});

// 6. Route to update a student - Update Submission
app.post('/editStudent/:id', upload.single('image'), (req, res) => {
    const studentId = req.params.id;
    const { studentName, dob, contact } = req.body;
    
    let image = req.body.currentImage; // retrieve current image filename
    
    if (req.file) { // if new image is uploaded
        image = req.file.filename; // set image to be new image filename
    }

    const sql = 'UPDATE student SET studentName = ?, dob = ?, contact = ?, image = ? WHERE studentid = ?';
    
    connection.query(sql, [studentName, dob, contact, image, studentId], (error, results) => {
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