require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const os = require('os');
const path = require('path');

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

mongoose.connect('mongodb://127.0.0.1:' + MONGODB_PORT + '/codingbuddy', { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', function () {
    console.log("MongoDB database connection established successfully!");
})


let javaProcesses = new Object();

app.post("/api/login", (req, res, next) => {
    // console.log(req.body);
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                // console.log(result);
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

app.post('/api/signup', (req, res, next) => {
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
                        let role = 'student';
                        User.findOne().then(document => {
                            if (document === null) {
                                role = 'admin';
                            }
                            const user = new User({
                                email: req.body.email,
                                password: hash,
                                role: role
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
                        });
                    }
                });
            }
        })
        .catch();

});

app.get('/api/exercises/:page', function (req, res) {
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



app.route('/api/exercise/:id')

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



app.route('/api/exercise')

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
            } else {
                exercise.name = req.body.name;
                exercise.content = req.body.content;
                exercise.source_files = req.body.source_files;

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


app.route("/api/exercise/input")

    .post((req, res, next) => checkAuth(req, res, next), function (req, res) {
        let input = req.body.input;
        let userData = req.tokenData;

        if (input !== null && javaProcesses[userData.userId] !== undefined && javaProcesses[userData.userId] !== null && !javaProcesses[userData.userId].killed) {
            console.log("Writing input '" + input + "' to java process!");
            let javaChild = javaProcesses[userData.userId]

            res.dataArray = [];

            javaChild.stdout.on('data', function (data) {
                console.log("stdout input");
                if (data && !res.isDataSend) {
                    res.dataArray.push(data);
                    // Check if it is is a read in command
                    try {
                        let buffers = [];
                        for (let buffer of res.dataArray) {
                            buffers.push(Buffer.from(buffer));
                        }

                        let finalBuffer = Buffer.concat(buffers);

                        try {
                            let jsonString = finalBuffer.toString()
                            if (jsonString.includes("}",jsonString.length-4)) {
                                let json = JSON.parse(jsonString); // checks if it is the end of the json string, throws error if it isnt
                                
                                if (json !== null && (json.isReadIn || json.isGuiReadIn)) {
                                    res.isDataSend = true;
                                    res.status(200).json(json);
                                }
                            }
                        } catch (e) {
                            console.error("Not the end of json string!");
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
            javaChild.stderr.on('data', function (err) {
                console.log("stderr input");
                if (err && !res.isDataSend) {
                    console.log(err.toString()); // TODO send to client and print on screen (warp in json error step)
                }
            });
            javaChild.on('close', function (exitCode) {
                console.log("close input");
                console.log(exitCode);
                
                if (res.isDataSend) {
                    console.log("canceled response (data was already send)");
                    return;
                }

                javaProcesses[userData.userId] = null;

                if (exitCode === null) {
                    console.log("canceled response (exitCode ist null)");
                    return;
                }

                
                let buffers = [];
                for (let buffer of res.dataArray) {
                    buffers.push(Buffer.from(buffer));
                }

                let finalBuffer = Buffer.concat(buffers);

                // console.log(finalBuffer.toString());
                try {
                    let jsonString = finalBuffer.toString()
                    if (jsonString.includes("}",jsonString.length-4)) {
                        let json = JSON.parse(jsonString);
                        res.isDataSend = true;
                        res.status(200).json(json);
                    }
                } catch (e) {
                    console.error(e);
                    res.isDataSend = true;
                    res.status(400).json({});
                }

            });
            try {
                javaChild.stdin.write(input);
                javaChild.stdin.end();
            } catch (e) {
                console.log(e);
            }
        } else {
            console.warn("No java process available anymore to write to!");
        }
    });

app.route("/api/exercise/run")

    .post((req, res, next) => checkAuth(req, res, next), function (req, res) {
        let code_snippets = req.body.code_snippets;
        let id = req.body.id;
        let userData = req.tokenData;

        // TODO save code for user
        // TODO save child process in table by user id. cancel running process before new one is started. set process timeout to 30 min or something. also use this for input commands from user.

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
                    javaExe = "C:" + path.sep + "Program Files" + path.sep + "Java" + path.sep + "jdk-10" + path.sep + "bin" + path.sep + "java.exe";
                }
                let javaOptions = { maxBuffer: 1024*1024*1024 ,timeout: 10*1000, /* windowsHide: false */ };


                if (javaProcesses[userData.userId] !== undefined && javaProcesses[userData.userId] !== null) {
                    console.log("Killing java process!");
                    javaProcesses[userData.userId].kill('SIGINT');
                    console.log(javaProcesses[userData.userId].killed ? "Killed java process!" : "Didnt kill java process!");
                    javaProcesses[userData.userId] = null;
                }

                res.dataArray = [];


                let javaChild = spawn(javaExe, ["-jar", __dirname + path.sep + "java" + path.sep + "executer.jar", JSON.stringify(arg)], javaOptions);

                javaProcesses[userData.userId] = javaChild;

                javaChild.stdout.on('data', function (data) {
                    console.log("stdout run");
                    if (data && !res.isDataSend) {
                        res.dataArray.push(data);
                        // Check if it is is a read in command
                        try {
                            let buffers = [];
                            for (let buffer of res.dataArray) {
                                buffers.push(Buffer.from(buffer));
                            }
    
                            let finalBuffer = Buffer.concat(buffers);
                            
                            try {
                                let jsonString = finalBuffer.toString()
                                if (jsonString.includes("}",jsonString.length-4)) {
                                    let json = JSON.parse(jsonString); // checks if it is the end of the json string, throws error if it
    
                                    if (json !== null && (json.isReadIn || json.isGuiReadIn)) {
                                        res.isDataSend = true;
                                        res.status(200).json(json);
                                    }
                                }
                            } catch (e) {
                                console.error("Not the end of json string!");
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                });
                javaChild.stderr.on('data', function (err) {
                    console.log("stderr run");
                    if (err && !res.isDataSend) {
                        console.log(err.toString()); // TODO send to client and print on screen (warp in json error step)
                    }
                });
                javaChild.on('close', function (exitCode) {
                    console.log("close run");
                    console.log(exitCode);
                    
                    if (res.isDataSend) {
                        console.log("canceled response (data was already send)");
                        return;
                    }

                    javaProcesses[userData.userId] = null;

                    if (exitCode === null) {
                        console.log("canceled response (exitCode ist null)");
                        return;
                    }

                    let buffers = [];
                    for (let buffer of res.dataArray) {
                        buffers.push(Buffer.from(buffer));
                    }
    
                    let finalBuffer = Buffer.concat(buffers);
    
                    // console.log(finalBuffer.toString());
                    try {
                        let jsonString = finalBuffer.toString()
                        if (jsonString.includes("}",jsonString.length-4)) {
                            let json = JSON.parse(jsonString);
                            res.isDataSend = true;
                            res.status(200).json(json);
                        }
                    } catch (e) {
                        console.error(e);
                        res.isDataSend = true;
                        res.status(400).json({});
                    }
    
                });

            }
        });

    });


app.listen(PORT, function () {
    console.log("Server running on Port: " + PORT);
});