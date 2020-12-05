const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

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

app.post("/api/admin/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const sqlSelect = "SELECT * FROM user WHERE email = ? AND password = ? ";
    db.query(sqlSelect, [email, password], (err, result) => {
        if (err) {
            res.send({ err: err });
        }

        if (result.length > 0) {
            const id = result[0].id
            const token = jwt.sign({ id }, "jwtSecret", {
                expiresIn: 300,
            });
            res.json({ auth: true, token: token, result: result });
        } else {
            res.json({ auth: false, message: "Invalid email or password" });
        }
    })
})

const verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if (!token) {
        res.send("Failed to give token");
    } else {
        jwt.verify(token, "jwtSecret", (err, decoded) => {
            if (err) {
                res.json({ auth: false, message: "Failed to Authenticate" });
            } else {
                res.userid = decoded.id;
                next();
            }
        })
    }
}


app.get("/isUserAuth", verifyJWT, (req, res) => {
    res.send("You are successfully authenticated! ");
});

app.post("/api/admin/insert/project", (req, res) => {
    const projectTitle = req.body.projectTitle;
    const projectDetail = req.body.projectDetail;
    const projectCategory = req.body.projectCategory;
    let time = Date.now();
    // change later lol
    let id = 1;
    let mediaId = (`${time}` + `${id}`);

    const sqlnsert =
        "INSERT INTO projects (projectTitle,projectDetail,projectCategory,mediaID) VALUES (?,?,?,?)";
    db.query(sqlnsert, [projectTitle, projectDetail, projectCategory, mediaId], (err, result) => {
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

app.put('/api/admin/update/featured/:id', (req, res) => {
    const UpdatefeaturedId = req.params.id;
    const projectTitle = req.body.projectTitle;
    const projectDetail = req.body.projectDetail;
    const projectCategory = req.body.projectCategory;

    const sqlUpdate = "UPDATE projects SET projectTitle = ? , projectDetail = ? , projectCategory = ?  WHERE projectID = ? ";
    db.query(sqlUpdate, [projectTitle, projectDetail, projectCategory, UpdatefeaturedId], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/api/admin/get/project-list', (req, res) => {

    const sqlSelect = "SELECT * FROM projects";
    db.query(sqlSelect, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
});

app.put('/api/admin/update/state/', (req, res) => {
    const oldID = req.body.oldID;
    const selectedID = req.body.selectedID;
    const state = req.body.state;

    const sqlUpdate = "UPDATE projects SET state = ? WHERE projectID = ?  ";
    db.query(sqlUpdate, ["", oldID], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            const sqlUpdate = "UPDATE projects SET state = ? WHERE projectID = ? ";
            db.query(sqlUpdate, [state, selectedID], (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.send(result);
                }
            })
        }
    })
})





app.listen(port, () => {
    console.log("running on port 3005")
});