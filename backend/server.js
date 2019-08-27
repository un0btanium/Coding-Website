require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const os = require('os');
const path = require('path');
const lzstring = require('lz-string');
const update = require('immutability-helper');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const checkAuth = require('./middleware/check-auth');
const array_move = require('./middleware/move_array');

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

let Course = require('./models/course.model');
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
							name: user[0].name,
                            role: user[0].role
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "20h"
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
								name: req.body.name,
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

				/* USERS */

app.get('/api/users/:page', (req, res, next) => checkAuth(req, res, next, ["admin"]), function (req, res) {
    const page = req.params.page || 0;
    // const options = { limit: 10, skip: page*10 };
    const options = {};
    User.find({}, "email role", options, function (err, users) {
        if (err) {
            console.log(err);
            res.status(404).send("something went wrong");
        } else {
            res.status(200).json({ 'users': users, 'page': page });
        }
    })
});


app.put('/api/user/role', (req, res, next) => checkAuth(req, res, next, ["admin"]), function (req, res) {
    User.findById(req.body.id, function (err, user) {
        if (err) {
            console.log(err);
            res.status(404).send("something went wrong");
        } else {
			user.role = req.body.role;
			console.log("Changed user role ")
			user.save()
				.then(user => {
					console.log("Changed user role of " + user.email + " to " + user.role)
					res.status(200).json({ 'role': user.role });
				})
				.catch(err => {
					res.status(400, 'Adding new course failed');
				});
        }
    })
});

				/* PROCESSES */

app.get('/api/processes', (req, res, next) => checkAuth(req, res, next, ["admin"]), function (req, res) {
	let processes = [];
	for (let name in javaProcesses) {
		let process = javaProcesses[name];
		if (process !== undefined) {
			processes.push({
				exerciseData: process.exerciseData,
				userData: process.userData,
				started: process.started
			});
		}
	}
	res.status(200).json({ 'processes': processes, currentDate: new Date() });
});	

app.put('/api/process/terminate', (req, res, next) => checkAuth(req, res, next, ["admin"]), function (req, res) {
	
	if (javaProcesses[req.body.userID] !== undefined && javaProcesses[req.body.userID].process !== undefined) {
		javaProcesses[req.body.userID].process.kill('SIGINT');
		javaProcesses[req.body.userID] = undefined;
		res.status(200).send();
	} else {
		res.status(404).send("Process is not running!");
	}
});	


				/* COURSES */

app.get('/api/courses/:page', function (req, res) {
    const page = req.params.page || 0;
    // const options = { limit: 10, skip: page*10 };
    const options = {};
    Course.find({}, options, function (err, courses) {
        if (err) {
            console.log(err);
            res.status(404).send("something went wrong");
        } else {
			let simplifiedCourses = courses.map((course) => {
				return {
					_id: course._id,
					name: course.name,
					isVisibleToStudents: course.isVisibleToStudents,
					exercisesAmount: course.exercises.length,
					subExercisesAmount: course.exercises.reduce(function(prev, cur) {
						return prev + cur.subExercises.length;
					}, 0)
				}
			});
            res.json({ 'courses': simplifiedCourses, 'page': page });
        }
    })
});


app.route('/api/course')

	.post((req, res, next) => checkAuth(req, res, next, ["admin", "maintainer"]), function (req, res) {
		let document = {
			name: req.body.name,
			isVisibleToStudents: req.body.isVisibleToStudents,
			exercises: req.body.exercises
		};
		let course = new Course(document);
		course.save()
			.then(newCourse => {
				res.status(200).json({ id: newCourse._id });
			})
			.catch(err => {
				res.status(400, 'Adding new course failed');
			});
	})

	.put((req, res, next) => checkAuth(req, res, next, ["admin", "maintainer"]), function (req, res) {
		Course.findById(req.body.id, function (err, course) {
			if (!course) {
				res.status(404).send('course was not found');
			} else {
				course.name = req.body.name || course.name;
				course.isVisibleToStudents = req.body.isVisibleToStudents || course.isVisibleToStudents;
				course.exercises = req.body.exercises || course.exercises;

				course
					.save()
					.then(course => {
						res.status(200).json('Course updated');
					})
					.catch(err => {
						res.status(400).send("Updating course failed");
					});
			}
		});
	});

app.route('/api/course/moveexercise')

	.put((req, res, next) => checkAuth(req, res, next, ["admin", "maintainer"]), function (req, res) {
		Course.findById(req.body.id, function (err, course) {
			if (!course) {
				res.status(404).send('course was not found');
			} else {
				
				let index = -1;
				let i = 0;
				for (let exercise of course.exercises) {
					if (exercise._id.toString() === req.body.exerciseID) {
						index = i;
						break;
					}
					i++;
				}

				if (index === -1) {
					res.status(404).send("Exercise not found");
				} else {
					let exercises = [...course.exercises];
					if (req.body.moveUp) {
						exercises = array_move(exercises, index, index-1);
					} else {
						exercises = array_move(exercises, index, index+1);
					}
	
					course.exercises = exercises;
	
					course
						.save()
						.then(course => {
							res.status(200).json({exercises: getSimplifiedExercises(course.exercises)});
						})
						.catch(err => {
							res.status(400).send("Moving exercise failed");
						});
				}
			}
		});
	});


app.route('/api/course/visibility')

	.put((req, res, next) => checkAuth(req, res, next, ["admin", "maintainer"]), function (req, res) {
		Course.findById(req.body.id, function (err, course) {
			if (!course) {
				res.status(404).send('Course was not found');
			} else {

				course.isVisibleToStudents = req.body.isVisibleToStudents;

				course
					.save()
					.then(course => {
						res.status(200).json({ isVisibleToStudents: course.isVisibleToStudents});
					})
					.catch(err => {
						res.status(400).send("Updating course failed");
					});
			}
		});
	});

app.route('/api/course/:id')

    .get((req, res, next) => checkAuth(req, res, next), function (req, res) {
        let id = req.params.id;
        Course.findById(id, function (err, course) {
            if (err) {
                console.log("Course " + id + " not found!");
                res.status(404).send('Course not found!');
            } else {
				
				let simplifiedCourse = {
					_id: course._id,
					name: course.name,
					isVisibleToStudents: course.isVisibleToStudents
				};
				
				simplifiedCourse.exercises = getSimplifiedExercises(course.exercises);

				User.findById(req.tokenData.userId, function (err, user) {
					if (err) {
						res.json({ course: simplifiedCourse, userExercisesData: {} });
					} else {

						if (user.code && user.code[id]) {
							res.json({ course: simplifiedCourse, userExercisesData: user.code[id]});
						} else {
							res.json({ course: simplifiedCourse, userExercisesData: {} });
						}
					}
				});
            }
        })
	})
	
    .delete((req, res, next) => checkAuth(req, res, next, ["admin"]), function (req, res) {
        let id = req.params.id;
        Course.findByIdAndDelete(id, function (err) {
            if (!err) {

				// TODO remove Code Snippet Saves from Users to avoid data remnants

                res.sendStatus(200);
            } else {
                res.status(500).json({
                    error: err
                })
            }
        })
    });

app.route('/api/course/full/:id')

    .get((req, res, next) => checkAuth(req, res, next), function (req, res) {
        Course.findById(req.params.id, function (err, course) {
            if (err) {
                console.log("Course " + id + " not found!");
                res.status(404).send('Course not found!');
            } else {
				res.status(200).json({ course: course });
            }
        })
	});


				/* EXERCISES */


app.route('/api/course/:courseID/exercise/:exerciseID')

    .get((req, res, next) => checkAuth(req, res, next), function (req, res) {
		Course.findById(req.params.courseID, function (err, course) {
			if (err) {
				console.log("Course " + req.params.courseID + " not found!");
                res.status(404).send('Course not found!');
			} else {
				
				let exercise = course.exercises.id(req.params.exerciseID);

				if (exercise) {

					User.findById(req.tokenData.userId, function (err, user) {
						if (err) {
							res.json({ exercise: exercise, courseName: course.name, userSubExercisesData: {} });
						} else {
							if (user.code && user.code[req.params.courseID] && user.code[req.params.courseID][req.params.exerciseID]) {
								res.json({ exercise: exercise, courseName: course.name, userSubExercisesData: user.code[req.params.courseID][req.params.exerciseID] });
							} else {
								res.json({ exercise: exercise, courseName: course.name, userSubExercisesData: {} });
							}
						}
					});

				} else {
					console.log("Exercise " + req.params.exerciseID + " not found!");
					res.status(404).send('Exercise not found!');
				}
			}
		});
    })

    .delete((req, res, next) => checkAuth(req, res, next, ["admin"]), function (req, res) {
		Course.findById(req.params.courseID, function (err, course) {
			if (err) {
				console.log("Course " + req.params.courseID + " not found!");
				res.status(404).send('Course not found!');
			} else {
				
				course.exercises.pull(req.params.exerciseID)

				course.save(function(err) {
					if (err) {
						console.log("Unable to delete Excercise " + req.params.exerciseID + "!");
						res.status(500).send('Unable to delete Excercise!');
					} else {
						res.status(200).send();
					}
				})

			}
		});
	})


app.route('/api/course/exercise')

    .post((req, res, next) => checkAuth(req, res, next, ["admin", "maintainer"]), function (req, res) {
		Course.findById(req.body.courseID, function (err, course) {
			if (err) {
				console.log(err);
				res.status(404, 'Course not found!');
			} else {
				
				let exercise = {
					name: req.body.name,
					isVisibleToStudents: req.body.isVisibleToStudents || true,
					iFrameUrl: req.body.iFrameUrl || "",
					highlightingDetailLevelIndex: req.body.highlightingDetailLevelIndex || 5,
					subExercises: req.body.subExercises || [
						{
							highlightingDetailLevelIndex: req.body.highlightingDetailLevelIndex || 5,
							content: [
								{
									type: "title",
									text: ""
								},
								{
									type: "text",
									text: ""
								},
								{
									type: "editor",
									identifier: "main_method_body",
									code: "",
									solution: "",
									settings: {
										minLines: 5
									}
								}
							],
							sourceFiles: [{
								package: "main",
								name: "Main",
								code: "package main;\n" + 
								"\n" + 
								"import java.util.*;\n" + 
								"import java.io.*;\n" + 
								"import java.math.*;\n" + 
								"\n" + 
								"import java.io.Console;\n" + 
								"\n" + 
								"public class Main {\n" + 
								"    \n" + 
								"    public static void main(String[] args) {\n" + 
								"// main_method_body\n" + 
								"    }\n" + 
								"    \n" + 
								"}"
							}]
						}
					]
				};

				course.exercises.push(exercise);

				var newExercise = course.exercises[course.exercises.length-1];

				course.save()
					.then(course => {
						res.status(200).json({ id: newExercise._id });
					})
					.catch(err => {
						res.status(400, 'Adding new exercise failed');
					});
			}
		});
    })

    .put((req, res, next) => checkAuth(req, res, next, ["admin", "maintainer"]), function (req, res) {
		Course.findById(req.body.courseID, function (err, course) {
			if (err) {
				console.log(err);
				res.status(404, 'Course not found!');
			} else {
				
				let exercise = course.exercises.id(req.body.exerciseID);

				if (exercise === undefined || exercise === null) {
					console.log("Exercise " + req.body.exerciseID + " not found!");
					res.status(404).send("Exercise not found!");
					return;
				}

				exercise.name = req.body.name;
				exercise.isVisibleToStudents = req.body.isVisibleToStudents;
				exercise.iFrameUrl = req.body.iFrameUrl;
				exercise.highlightingDetailLevelIndex = req.body.highlightingDetailLevelIndex;
				exercise.subExercises = req.body.subExercises;
				
                course
					.save()
					.then(course => {
						res.status(200).json('Exercise updated');
					})
					.catch(err => {
						console.log(err)
						res.status(400).send("Update not possible");
					});
			}
		});
    });



app.route('/api/exercise/visibility')

	.put((req, res, next) => checkAuth(req, res, next, ["admin", "maintainer"]), function (req, res) {
		Course.findById(req.body.courseID, function (err, course) {
			if (!course) {
				console.log("Course " + req.body.courseID + " not found!");
				res.status(404).send('course was not found');
			} else {

				let exercise = course.exercises.id(req.body.exerciseID);

				if (exercise === undefined || exercise === null) {
					console.log("Exercise " + req.body.exerciseID + " not found!");
					res.status(404).send("Exercise not found!");
					return;
				}

				exercise.isVisibleToStudents = req.body.isVisibleToStudents;

				course
					.save()
					.then(course => {
						res.status(200).json({ isVisibleToStudents: exercise.isVisibleToStudents});
					})
					.catch(err => {
						console.log("Exercise " + req.body.exerciseID + " not found!");
						res.status(400).send("Updating course failed");
					});
			}
		});
	});



app.route("/api/exercise/input")

    .post((req, res, next) => checkAuth(req, res, next), function (req, res) {
        let input = req.body.input;
        let userData = req.tokenData;

        if (input !== null && javaProcesses[userData.userId] !== undefined && javaProcesses[userData.userId] !== null && !javaProcesses[userData.userId].process.killed) {
            console.log("Writing input '" + input + "' to java process!");
            let javaChild = javaProcesses[userData.userId].process

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
                                    let compressedJson = lzstring.compressToBase64(jsonString);
                                    let jsonMessage = {
                                        compressedJson: compressedJson
                                    };
                                    
									res.dataArray = [];
                                    res.isDataSend = true;
                                    res.status(200).json(jsonMessage);
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

                javaProcesses[userData.userId] = undefined;

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
                        JSON.parse(jsonString); // checks if this is valid json

                        let compressedJson = lzstring.compressToBase64(jsonString);
                        let jsonMessage = {
                            compressedJson: compressedJson
                        };
                        
						res.dataArray = [];
                        res.isDataSend = true;
                        res.status(200).json(jsonMessage);
                    }
                } catch (e) {
                    console.error(e);
					res.dataArray = [];
                    res.isDataSend = true;
                    res.status(400).json({});
                }

            });
            try {
                javaChild.stdin.write(input + '\n');
            } catch (e) {
                console.log(e);
				res.status(400).json({});
            }
        } else {
			console.warn("No java process available anymore to write to!");
			res.status(400).json({});
			// TODO send response to cancel code execution clientside
        }
    });

app.route("/api/exercise/run")

    .post((req, res, next) => checkAuth(req, res, next), function (req, res) {
		let isElectronApp = req.body.isElectronApp;
		let code_snippets = req.body.code_snippets;
		let sourceFilesUser = req.body.sourceFiles;
		let courseID = req.body.courseID;
		let exerciseID = req.body.exerciseID;
		let subExerciseIndex = req.body.subExerciseIndex;
		let subExerciseID = req.body.subExerciseID;
		let highlightingDetailLevelIndex = req.body.highlightingDetailLevelIndex;
		let userData = req.tokenData;
		let persistCode = req.body.persistCode;

        Course.findById(courseID, function (err, course) {
            if (!course) {
                res.status(404).send('Course not found');
            } else {

				let exercise = course.exercises.id(exerciseID);

				if (exercise === undefined || exercise === null) {
					res.status(404).send('Exercise not found');
					return;
				}

				// PERSIST USER CODE (only in solve mode)
				if (persistCode) {
					User.findById(userData.userId, function (err, user) {
						if (!err) {

							if (!user.code) {
								user.code = {};
							}

							if (!user.code[courseID]) {
								user.code[courseID] = {};
							}

							if (!user.code[courseID][exerciseID]) {
								user.code[courseID][exerciseID] = {};
							}

							if (!user.code[courseID][exerciseID][subExerciseID]) {
								user.code[courseID][exerciseID][subExerciseID] = {
									codeSnippets: {},
									solved: false
								};
							}

							user.code = update(user.code, {
								[courseID]: {
									[exerciseID]: {
										[subExerciseID]: {
											codeSnippets: {
												$set: code_snippets
											},
											solved: {
												$set: true
											}
										}
									}
								}
							})

							user
							.save()
							.then(user => {
								
							})
							.catch(err => {
								console.log("Saving user code failed")
							});
						}
					});
				}

                if (javaProcesses[userData.userId] !== undefined && javaProcesses[userData.userId] !== null) {
                    console.log("Killing java process!");
                    javaProcesses[userData.userId].process.kill('SIGINT');
                    console.log(javaProcesses[userData.userId].process.killed ? "Killed java process!" : "Didnt kill java process!");
                    javaProcesses[userData.userId] = undefined;
				}
				

				let sourceFiles = [];
				if (sourceFilesUser !== undefined && sourceFilesUser !== null) { // user ran in Edit mode
					sourceFiles = sourceFilesUser;
				} else {
					sourceFiles = exercise.subExercises[subExerciseIndex].sourceFiles;
				}

				if (isElectronApp) {
					console.log("isElectronApp")
					res.status(200).json({sourceFiles: sourceFiles});
					return;
				}

                let arg = {
					highlightingDetailLevelIndex: highlightingDetailLevelIndex || 0,
                    code_snippets: code_snippets,
                    source_files: sourceFiles
                }

                res.dataArray = [];
                let javaExe = "java";
                if (os.platform() === 'win32') {
					// javaExe = "C:" + path.sep + "Program Files" + path.sep + "Java" + path.sep + "jdk-11" + path.sep + "bin" + path.sep0 + "java.exe";
					javaExe = "java";
                }
                let processOptions = { maxBuffer: 1024*1024*1024 ,timeout: 30*1000, /* windowsHide: false */ };
				let filePath = __dirname + path.sep + "java" + path.sep + "executer.jar";

                let javaChild = spawn(javaExe, ["-jar", "-Xms64m", "-Xmx64m", filePath, JSON.stringify(arg)], processOptions);

                javaProcesses[userData.userId] = {
					exerciseData: {
						courseName: course.name,
						courseID: courseID,
						exerciseName: exercise.name,
						exerciseID: exerciseID,
						subExerciseIndex: subExerciseIndex,
						code_snippets: code_snippets,
						highlightingDetailLevelIndex: arg.highlightingDetailLevelIndex
					},
					userData: {
						userId: userData.userId,
						email: userData.email
					},
					started: new Date(),
					process: javaChild
				};

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
                                        let compressedJson = lzstring.compressToBase64(jsonString);
                                        let jsonMessage = {
                                            compressedJson: compressedJson
										};
										
                                        res.dataArray = [];
                                        res.isDataSend = true;
                                        res.status(200).json(jsonMessage);
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

                    javaProcesses[userData.userId] = undefined;

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
                        let jsonString = finalBuffer.toString();
                        if (jsonString.includes("}",jsonString.length-4)) {
                            JSON.parse(jsonString); // checks if this is valid json

                            let compressedJson = lzstring.compressToBase64(jsonString);
                            let jsonMessage = {
                                compressedJson: compressedJson
                            };

							res.dataArray = [];
                            res.isDataSend = true;
                            res.status(200).json(jsonMessage);
                        }
                    } catch (e) {
                        console.error(e);
						res.dataArray = [];
                        res.isDataSend = true;
                        res.status(400).json({});
                    }
    
                });

            }
        });

	});
	


// app.route("/api/ElectronApp.zip")

// 	.get(function (req, res) {
// 		const file = `${__dirname}/electron-app/CodingBuddy.zip`;
// 		res.download(file);
// 	});



app.listen(PORT, function () {
    console.log("Server running on Port: " + PORT);
});


function findEntryInArrayByKey(array, key, compareValue) {
	let element = undefined;
	for (let entry of array) {
		if (entry[key] === compareValue) {
			element = entry;
			break;
		}
	}
	return element;
}

function getSimplifiedExercises(exercises) {
	return exercises.map((exercise) => {
		let simplifiedExercise = {
			_id: exercise._id,
			name: exercise.name,
			isVisibleToStudents: exercise.isVisibleToStudents
		};
		simplifiedExercise.subExercises = exercise.subExercises.map((subExercise) => {
			return {_id: subExercise._id};
		});
		return simplifiedExercise;
	});
}
