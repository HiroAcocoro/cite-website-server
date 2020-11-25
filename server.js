const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql');
const e = require('express');

const port = 3005;


// hide pool later lol
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cite-website-db',
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.post("/api/admin/insert/project", (req, res) => {
    const projectTitle = req.body.projectTitle;
    const projectDetails = req.body.projectDetails;
    const projectCategory = req.body.projectCategory;
    let time = Date.now();
    // change later lol
    let id = 1;
    let mediaId = (`${time}` + `${id}`);

    const sqlnsert =
        "INSERT INTO projects (projectTitle,projectDetail,projectCategory,mediaID) VALUES (?,?,?,?)";
    db.query(sqlnsert, [projectTitle, projectDetails, projectCategory, mediaId], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            console.log(result);
            res.send(result);
            const sqlInsertMedia = "INSERT INTO media (mediaID) VALUES (?)";
            db.query(sqlInsertMedia, mediaId, (err, result) => {
                if (err) {
                    console.log(err)
                }
            })
        }
    });
});

app.get("/api/admin/get/home-section-featured", (req, res) => {
    const sqlSelect = "SELECT * FROM projects WHERE state = 'home-section-featured' ";
    db.query(sqlSelect, (err, result) => {
        res.send(result);
    });
});

//home-section-latest2
app.get("/api/admin/get/home-section-latestList", (req, res) => {
    const sqlSelect = "SELECT * FROM projects WHERE state LIKE '%home-section-latest%' ORDER BY state";
    db.query(sqlSelect, (err, result) => {
        res.send(result);
    });
});

app.get('/api/admin/get/selected/update/project/:id', (req, res) => {
    const projectId = req.params.id;
    const sqlSelect = "SELECT * FROM projects WHERE projectID = ?";
    db.query(sqlSelect, [projectId], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})


app.listen(port, () => {
    console.log("running on port 3005")
});