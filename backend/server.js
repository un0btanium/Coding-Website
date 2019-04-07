require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const os = require('os');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const checkAuth = require('./middleware/check-auth');

// const passport = require('passport');
// const passportJWT = require('passport-jwt');
// const JWTStrategy = passportJWT.Strategy;
// const ExtractJWT = passportJWT.ExtractJwt;

// const JTWOptions = {
//     jtwFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//     secret: process.env.SECRET
// };

// const strategy = new JWTStrategy(JTWOptions, (payload, callback) => {
//     // TODO get user from db
//     const user = null;
//     next(null, user);
// });
// passport.use(strategy);
// app.use(passport.initialize());

const PORT = 4000;
const MONGODB_PORT = 27017;

const { spawn } = require('child_process');

let Exercise = require('./models/exercise.model');
let User = require('./models/user.model');


app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:' + MONGODB_PORT + '/exercises', { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', function () {
    console.log("MongoDB database connection established successfully!");
})



app.post("/login", (req, res, next) => {
    console.log(req.body);
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                console.log(result);
                if (err) {
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }

                if (result) {
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id,
                            role: user[0].role
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "7h"
                        }
                    );
                    
                    return res
                        .status(200)
                        .send({ auth: true, token: token});
                }

                res.status(401).json({
                    message: "Auth failed"
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

app.post('/signup', (req, res, next) => {
    if (!req.body) {
        return;
    }

    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "User already exists"
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            email: req.body.email,
                            password: hash,
                            role: 'student'
                        });
                        user
                            .save()
                            .then(result => {
                                res.status(201).json({
                                    message: "User created!"
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });
            }
        })
        .catch();

});

app.get('/exercises/:page', function (req, res) {
    const page = parseInt(req.params.page) || 0;
    // const options = { limit: 10, skip: page*10 };
    const options = {};
    Exercise.find({}, 'name', options, function (err, exercises) {
        if (err) {
            console.log(err);
            res.status(404).send("something went wrong");
        } else {
            res.json({ 'exercises': exercises, 'page': page });
        }
    })
});



app.route('/exercise/:id')

    .get(function (req, res) {
        let id = req.params.id;
        Exercise.findById(id, function (err, exercise) {
            if (err) {
                console.log(err);
                res.status(404, 'Exercise not found!');
            } else {
                res.json(exercise);
            }
        })
    })

    .delete((req, res, next) => checkAuth(req, res, next, ["admin", "maintainer"]), function (req, res) {
        let id = req.params.id;
        Exercise.findByIdAndDelete(id, function (err) {
            if (!err) {
                res.sendStatus(200);
            } else {
                res.status(500).json({
                    error: err
                })
            }
        })
    });



app.route('/exercise')

    .post((req, res, next) => checkAuth(req, res, next, ["admin", "maintainer"]), function (req, res) {
        let document = {
            name: req.body.name,
            content: req.body.content || [],
            source_files: req.body.source_files || []
        };
        let exercise = new Exercise(document);
        exercise.save()
            .then(newExercise => {
                res.status(200).json({ id: newExercise._id });
            })
            .catch(err => {
                res.status(400, 'Adding new exercise failed');
            });
    })

    .put((req, res, next) => checkAuth(req, res, next, ["admin", "maintainer"]), function (req, res) {
        Exercise.findById(req.body.id, function (err, exercise) {
            if (!exercise) {
                res.status(404).send('exercise was not found');
                // TODO create new one so changes wont be lost?
            } else {
                exercise.name = req.body.name;
                exercise.content = req.body.content;

                exercise
                .save()
                .then(exercise => {
                    res.status(200).json('Exercise updated');
                })
                .catch(err => {
                    res.status(400).send("Update not possible");
                });
            }
        });
    });



app.route("/exercise/run")

    .post((req, res, next) => checkAuth(req, res, next),function (req, res) {
        let code_snippets = req.body.code_snippets;
        let id = req.body.id;

        Exercise.findById(id, function (err, exercise) {
            if (!exercise) {
                res.status(404).send('exercise was not found');
            } else {
                // console.log(id);
                // console.log(code_snippets);

                let source_files = [];
                for (let sourceFile of exercise.source_files) {
                    source_files.push(sourceFile);
                }

                let arg = {
                    code_snippets: code_snippets,
                    source_files: source_files
                }

                let javaExe = "java";
                if (os.platform() === 'win32') {
                    javaExe = "C:\\Program Files\\Java\\jdk-10\\bin\\" + "java.exe"
                }
                let javaOptions = { maxBuffer: 1024*1024*1024 /*,timeout: 5, windowsHide: false */ };

                res.dataArray = [];

                let javaChild = spawn(javaExe, ["-jar", __dirname + "\\java\\executer.jar", JSON.stringify(arg)], javaOptions);

                javaChild.stdout.on('data', function (data) {
                    console.log("stdout");
                    if (data) {
                        res.dataArray.push(data);
                    }
                });
                javaChild.stderr.on('data', function (err) {
                    console.log("stderr");
                    if (err && !res.isDataSend) {
                        console.log(err.toString()); // TODO send to client and print on screen
                    }
                });
                javaChild.on('close', function (exitCode) {
                    console.log("close");
                    console.log(exitCode);
                    
                    let buffers = [];
                    for (let buffer of res.dataArray) {
                        buffers.push(Buffer.from(buffer));
                    }

                    let finalBuffer = Buffer.concat(buffers);

                    let json = JSON.parse(finalBuffer.toString());
                    res.status(200).json(json);
                });

            }
        });

    });


app.listen(PORT, function () {
    console.log("Server running on Port: " + PORT);
});