import Axios from 'axios'; // TODO delete
import Datastore from 'nedb';
import { array_move } from './ArrayShifter';
import lzstring from 'lz-string';
import { spawn } from 'child_process';
import path from 'path';

Axios.defaults.adapter = require('axios/lib/adapters/http'); // TODO delete

let Course = new Datastore({ filename: "courses", autoload: true });
let User = new Datastore({ filename: "user", autoload: true });

Course.findById = (_id, callback) => {
	Course.findOne({_id: _id}, callback);
}
Course.findByIdAndDelete = (_id, callback) => {
	Course.remove({_id: _id}, {}, callback);
}
User.findById = (_id, callback) => {
	User.findOne({_id: _id}, callback);
}
User.findByIdAndDelete = (_id, callback) => {
	User.remove({_id: _id}, {}, callback);
}


const USER_NAME = "UserCodeCollection";

let javaProcess;

/* COURSE */

export const getCoursesOverview = (page) => {
	return new Promise((resolve, reject) => {

		Course.find({}, function (err, courses) {
			if (err) {
				reject({ response: { data: { errMsg: "Unable to find courses" } } });
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
				resolve({ data: {
					courses: simplifiedCourses,
					page: page
				} });
			}
		})
	})
}

export const createCourse = (data) => {
	return new Promise((resolve, reject) => {
		let document = {
			name: data.name,
			isVisibleToStudents: data.isVisibleToStudents,
			exercises: data.exercises
		};

		Course.insert(document, (err, newCourse) => {
			if (err) {
				reject({ response: { data: { errMsg: "Adding new course failed" } } });
			} else {
				console.log(newCourse)
				resolve({ data: {
					id: newCourse._id
				} });
			}
		});
	})
}

export const getCourse = (courseID) => {
	return new Promise((resolve, reject) => {
        Course.findById(courseID, (err, course) => {
            if (err) {
				console.log(err)
				reject({ response: { data: { errMsg: "Course not found!" } } });
            } else {
				
				let simplifiedCourse = {
					_id: course._id,
					name: course.name,
					isVisibleToStudents: course.isVisibleToStudents
				};
				
				simplifiedCourse.exercises = getSimplifiedExercises(course.exercises);

				User.findOne({ name: USER_NAME }, (err, user) => {
					if (err) {
						resolve({ data: {
							course: simplifiedCourse,
							userExercisesData: {}
						} });
					} else {
						if (user && user.code && user.code[courseID]) {
							resolve({ data: {
								course: simplifiedCourse,
								userExercisesData: user.code[courseID]
							} });
						} else {
							resolve({ data: {
								course: simplifiedCourse,
								userExercisesData: {}
							} });
						}
					}
				});
            }
		})
		
	})
}

export const getCourseFull = (courseID) => {
	return new Promise((resolve, reject) => {
        Course.findById(courseID, function (err, course) {
            if (err) {
				reject({ response: { data: { errMsg: "Course not found!" } } });
            } else {
				resolve({ data: {
					course: course
				} });
            }
        })
	})
}

export const switchCourseVisibility = (courseID, isVisibleToStudents) => {
	return new Promise((resolve, reject) => {
		Course.update({ _id: courseID }, { $set: { isVisibleToStudents: !isVisibleToStudents} }, { returnUpdatedDocs: true }, (err, numAffected, updatedCourse) => {
			if (err) {
				reject({ response: { data: { errMsg: "Updating Course visibility failed!" } } });
			} else {
				resolve({ data: {
					isVisibleToStudents: updatedCourse.isVisibleToStudents
				} });
			}
		});
	})
}

export const moveExercise = (data) => {
	return new Promise((resolve, reject) => {
		Course.findById(data.id, function (err, course) {
			if (err) {
				reject({ response: { data: { errMsg: "Course was not found!" } } });
			} else {
				
				let index = -1;
				let i = 0;
				for (let exercise of course.exercises) {
					if (exercise._id.toString() === data.exerciseID) {
						index = i;
						break;
					}
					i++;
				}

				if (index === -1) {
					reject({ response: { data: { errMsg: "Exercise not found!" } } });
				} else {
					let exercises = [...course.exercises];
					if (data.moveUp) {
						exercises = array_move(exercises, index, index-1);
					} else {
						exercises = array_move(exercises, index, index+1);
					}
					
					Course.update({ _id: course._id }, { $set: { exercises: exercises } }, { returnUpdatedDocs: true }, (err, numAffected, updatedCourse) => {
						if (err) {
							reject({ response: { data: { errMsg: "Moving exercise failed" } } });
						} else {
							resolve({ data: {
								exercises: getSimplifiedExercises(updatedCourse.exercises)
							} });
						}
					});
				}
			}
		});
	})
}

export const deleteCourse = (courseID) => {
	return new Promise((resolve, reject) => {
        Course.findByIdAndDelete(courseID, function (err) {
            if (err) {
				reject({ response: { data: { errMsg: "Unable to delete Course!" } } });
            } else {
				// TODO remove Code Snippet Saves from Users to avoid data remnants
                resolve();
            }
        })
	})
}



/* EXERCISE */

export const createExercise = (data) => {
	return new Promise((resolve, reject) => {
		Course.findById(data.courseID, function (err, course) {
			if (err) {
				reject({ response: { data: { errMsg: "Course not found!" } } });
			} else {
				
				let exercise = {
					_id: getMongoDBDocumentID(16),
					name: data.name,
					isVisibleToStudents: data.isVisibleToStudents || true,
					iFrameUrl: data.iFrameUrl || "",
					highlightingDetailLevelIndex: data.highlightingDetailLevelIndex || 4,
					subExercises: data.subExercises || [
						{
							_id: getMongoDBDocumentID(16),
							highlightingDetailLevelIndex: data.highlightingDetailLevelIndex || 4,
							content: [
								{
									_id: getMongoDBDocumentID(16),
									type: "title",
									text: ""
								},
								{
									_id: getMongoDBDocumentID(16),
									type: "text",
									text: ""
								},
								{
									_id: getMongoDBDocumentID(16),
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
								_id: getMongoDBDocumentID(16),
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
									"	public Main() {}\n" +
									"	\n" +
									"    public static void main(String[] args) {\n" + 
									"		Main mainInstance = new Main();\n" +
									"		mainInstance.main();\n" +
									"    }\n" + 
									"	\n" +
									"	public void main() {\n" +
									"// main_method_body\n" + 
									"	}\n" +
									"	\n" +
									"// main_instance_methods\n" +
									"    \n" + 
									"}"
							}]
						}
					]
				};


				Course.update({ _id: data.courseID }, { $push: { exercises: exercise } }, { returnUpdatedDocs: true }, (err, numAffected, updatedCourse) => {
					if (err) {
						reject({ response: { data: { errMsg: "Adding new exercise failed!" } } });
					} else {
						
						var newExercise = updatedCourse.exercises[updatedCourse.exercises.length-1];
						resolve({ data: {
							id: newExercise._id
						} });
					}
				});
			}
		});
	})
}

export const getExercise = (courseID, exerciseID) => {
	return new Promise((resolve, reject) => {
		Course.findById(courseID, (err, course) => {
			if (err) {
				reject({ response: { data: { errMsg: "Course not found!" } } });
			} else {
				
				let exercise = undefined;
				for (let e of course.exercises) {
					if (e._id === exerciseID) {
						exercise = e;
						break;
					}
				}

				if (exercise) {

					User.findById(USER_NAME, (err, user) => {
						if (err) {
							resolve({ data: {
								exercise: exercise,
								courseName: course.name,
								userSubExercisesData: {}
							} });
						} else {
							if (user && user.code && user.code[courseID] && user.code[courseID][exerciseID]) {
								resolve({ data: {
									exercise: exercise,
									courseName: course.name,
									userSubExercisesData: user.code[courseID][exerciseID]
								} });
							} else {
								resolve({ data: {
									exercise: exercise,
									courseName: course.name,
									userSubExercisesData: {}
								} });
							}
						}
					});

				} else {
					reject({ response: { data: { errMsg: "Exercise not found!" } } });
				}
			}
		});
	})
}

export const saveExercise = (data) => {
	return new Promise((resolve, reject) => {
		Course.findById(data.courseID, function (err, course) {
			if (err) {
				reject({ response: { data: { errMsg: "Course not found!" } } });
			} else {
				
				let exercises = [...course.exercises];
				let exercise = undefined;
				for (let e of exercises) {
					if (e._id === data.exerciseID) {
						exercise = e;
						break;
					}
				}

				if (exercise) {
					exercise.name = data.name;
					exercise.isVisibleToStudents = data.isVisibleToStudents;
					exercise.iFrameUrl = data.iFrameUrl;
					exercise.highlightingDetailLevelIndex = data.highlightingDetailLevelIndex;

					// set all unset _id keys manually
					for (let i = 0; i < data.subExercises.length; i++) {
						if (!data.subExercises[i]._id) {
							data.subExercises[i]._id = getMongoDBDocumentID();
						}
						for (let j = 0; j < data.subExercises[i].content.length; j++) {
							if (!data.subExercises[i].content[j]._id) {
								data.subExercises[i].content[j]._id = getMongoDBDocumentID();
							}
						}
						for (let j = 0; j < data.subExercises[i].sourceFiles.length; j++) {
							if (!data.subExercises[i].sourceFiles[j]._id) {
								data.subExercises[i].sourceFiles[j]._id = getMongoDBDocumentID();
							}
						}
					}
					exercise.subExercises = data.subExercises;
					
					Course.update({ _id: data.courseID }, { $set: { exercises: exercises } }, { returnUpdatedDocs: true }, (err, numAffected, updatedCourse) => {
						if (err) {
							reject({ response: { data: { errMsg: "Updating Exercise failed!" } } });
						} else {
							resolve({ data: {
								exercise: exercise
							} });
						}
					});
				} else {
					reject({ response: { data: { errMsg: "Exercise not found!" } } });
				}
			}
		});
	})
}

export const switchExerciseVisibility = (courseID, exerciseID, isVisibleToStudents) => {
	return new Promise((resolve, reject) => {
		Course.findById(courseID, (err, course) => {
			if (err) {
				reject({ response: { data: { errMsg: "Course not found!" } } });
			} else {

				let exercises = [...course.exercises];
				let exerciseIndex = -1;
				let i = 0;
				for (let e of exercises) {
					if (e._id === exerciseID) {
						exerciseIndex = i;
						break;
					}
					i++;
				}

				if (exerciseIndex === -1) {
					reject({ response: { data: { errMsg: "Exercise not found!" } } });
				} else {
					exercises[exerciseIndex].isVisibleToStudents = !isVisibleToStudents;

					Course.update({ _id: courseID }, { $set: { exercises: exercises } }, { returnUpdatedDocs: true }, (err, numAffected, updatedCourse) => {
						if (err) {
							reject({ response: { data: { errMsg: "Updating exercise visibility failed!" } } });
						} else {
							resolve({ data: {
								isVisibleToStudents: updatedCourse.exercises[exerciseIndex].isVisibleToStudents
							} });
						}
					});
				}
			}
		});
	})
}

export const deleteExercise = (courseID, exerciseID) => {
	return new Promise((resolve, reject) => {
		Course.update({ _id: courseID }, { $pull: { exercises: {_id: exerciseID } } }, { returnUpdatedDocs: true }, (err, numAffected, updatedCourse) => {
			if (err) {
				reject({ response: { data: { errMsg: "Unable to delete Excercise!" } } });
			} else {
				resolve({ data: {} });
			}
		});
	})
}



/* CODE EXECUTION */

export const sendInputToProcess = (data) => {
	return new Promise((resolve, reject) => {

		// TODO

		let options = {
			timeout: 30*1000, // TODO adjust?
			// responseType: 'stream',
			maxContentLength: 1000000000,
			headers: {
				"Content-Type": "application/json"
			}
		};
		Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/exercise/input', data, options)
            .then(response => {return resolve(response);})
            .catch(function (error) {return reject(error);});
	})
}

export const startProcess = (data) => {
	return new Promise((resolve, reject) => {
		
		let arg = {
			highlightingDetailLevelIndex: data.highlightingDetailLevelIndex || 0,
			code_snippets: data.code_snippets,
			source_files: data.sourceFiles
		}

		if (javaProcess !== undefined) {
			console.log("Killing java process!");
			javaProcess.kill('SIGINT');
			console.log(javaProcess.killed ? "Killed java process!" : "Didnt kill java process!");
			javaProcess = undefined;
		}

		let javaExe = "java";
		// let javaExe = "C:" + path.sep + "Program Files" + path.sep + "Java" + path.sep + "jdk-11" + path.sep + "bin" + path.sep + "java.exe";
		
		let processOptions = { };
		let filePath =  "S:/coding/coder-suite/offline-electron-app/src" + path.sep + "java" + path.sep + "executer.jar"; // TODO does this work?

		console.log(filePath);
		let javaChild = undefined;

		try {
			// TODO This probably doesnt work here because we are in the React app not Electron (use IPC? how much yikes or no yikes at all?! dont want to use http requests because of admin rights and performance)
			javaChild = spawn(javaExe, ["-jar", "-Dfile.encoding=UTF-8", filePath, JSON.stringify(arg)], processOptions);
		} catch (e) {
			reject({ response: { data: { errMsg: "No java installed or missing JAVA_HOME and/or PATH entry!" } } });
			console.log(e);
			return;
		}

		javaProcess = {
			res: { resolve, reject },
			dataArray: [],
			process: javaChild
		};

		javaChild.stdin.setDefaultEncoding("UTF-8");
		
		javaChild.stdout.on('data', function (data) {
			console.log("out")

			if (!javaProcess) {
				console.log("process closed");
				return;
			}
			
			if (data && javaProcess.res) {
				javaProcess.dataArray.push(data);
				
				try {
					let buffers = [];
					for (let buffer of javaProcess.dataArray) {
						buffers.push(Buffer.from(buffer, "utf-8"));
					}

					let finalBuffer = Buffer.concat(buffers);
					
					try {
						let jsonString = finalBuffer.toString("utf-8")
						if (jsonString.includes("}",jsonString.length-4)) {
							let json = JSON.parse(jsonString); // checks if it is the end of the json string, throws error if it

							if (json !== null && (json.isReadIn || json.isGuiReadIn)) {
								let compressedJson = lzstring.compressToBase64(jsonString);
								
								javaProcess.dataArray = [];
								javaProcess.res = undefined;
								resolve({ data: {
									compressedJson: compressedJson
								} });
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
			console.log("error")

			if (!javaProcess) {
				console.log("process closed");
				return;
			}

			if (err && javaProcess.res) {
				javaProcess.res = undefined;
				reject({ response: { data: { errMsg: err.toString() } } }); // TODO send to client and print on screen (warp in json error step)
			}
		});
		javaChild.on('close', function (exitCode) {
			console.log("close")

			if (!javaProcess) {
				console.log("process closed");
				return;
			}

			if (!javaProcess.res) {
				console.log("canceled response (data was already send)");
				return;
			}

			if (exitCode === null) {
				return;
			}

			let buffers = [];
			for (let buffer of javaProcess.dataArray) {
				buffers.push(Buffer.from(buffer, "utf-8"));
			}

			let finalBuffer = Buffer.concat(buffers);
			
			try {
				let jsonString = finalBuffer.toString("utf-8");
				if (jsonString.includes("}",jsonString.length-4)) {
					JSON.parse(jsonString); // checks if this is valid json

					let compressedJson = lzstring.compressToBase64(jsonString);
					
					javaProcess = undefined;
					resolve({ data: {
						compressedJson: compressedJson
					} });
				} else {
					console.error("Not a valid json string on program close!");
					javaProcess = undefined;
					reject({ response: { data: { errMsg: "Server error on code execution (no json)" } } });
				}
			} catch (e) {
				console.error(e);
				javaProcess = undefined;
				reject({ response: { data: { errMsg: "" } } });
			}

		});
	})
}



/* Helper Functions */

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

function getRandomString(length) {
	var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	var randS = "";

	while(length > 0) {
		randS += chars.charAt(Math.floor(Math.random() * chars.length));
		length--;
	}
	return randS;
}

function getMongoDBDocumentID() {
	var timestamp = (new Date().getTime() / 1000 | 0).toString(16).toLowerCase();
	return timestamp + getRandomString(16);
};