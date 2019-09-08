import Datastore from 'nedb';
import { array_move } from './ArrayShifter';
const { ipcRenderer } = window.require('electron')
const update = require('immutability-helper');


let Course = new Datastore({ filename: "courses", autoload: true });
let User = new Datastore({ filename: "user", autoload: true });

Course.findById = (_id, callback) => {
	Course.findOne({_id: _id}, callback);
}
Course.findByIdAndDelete = (_id, callback) => {
	Course.remove({_id: _id}, {}, callback);
}


const USER_NAME = "UserCodeCollection";

let promise = undefined;

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

					User.findOne({ name: USER_NAME }, (err, user) => {
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

		if (promise !== undefined) {
			// promise.reject({ response: { data: { errMsg: "Process promise overlapping! Might cause issues!" } } });
		}

		promise = {
			resolve: resolve,
			reject: reject
		}

		ipcRenderer.send('write-to-process', data);
	});
}

export const startProcess = (data) => {
	return new Promise((resolve, reject) => {
		
		let courseID = data.courseID;
		let exerciseID = data.exerciseID;
		let subExerciseID = data.subExerciseID;
		let persistCode = data.persistCode;
		let code_snippets = data.code_snippets;

		let arg = {
			highlightingDetailLevelIndex: data.highlightingDetailLevelIndex || 0,
			code_snippets: data.code_snippets,
			source_files: data.sourceFiles
		}

		// PERSIST USER CODE (only in solve mode)
		if (persistCode) {
			User.findOne({ name: USER_NAME }, (err, user) => {
				if (err) {
					// error
				} else {

					if (!user) {
						let code = {
							[courseID]: {
								[exerciseID]: {
									[subExerciseID]: {
										codeSnippets: code_snippets,
										solved: true
									}
								}
							}
						};
						User.insert({ name: USER_NAME, code: code }, (err, newUser) => {

						});
					} else {
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
								codeSnippets: code_snippets,
								solved: true
							};
						} else {
							// This might not be ideal since it is not very memory friendly
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
						}
	
	
						User.update({ name: USER_NAME }, { $set: { code: user.code } },  {}, (err) => {
							if (err) {
								console.log("Saving user code failed")
							} else {
								
							}
						});
					}
				}
			});
		}

		if (promise !== undefined) {
			promise.reject({ response: { data: { errMsg: "Canceled previous code execution! Restarting!" } } });
			promise = undefined;
			return;
		}

		promise = {
			resolve: resolve,
			reject: reject
		}

		ipcRenderer.send('start-process', arg);
	})
}


ipcRenderer.on('process-response', (event, arg) => {

	if (promise === undefined) {
		return;
	}

	if (arg.successful) {
		promise.resolve(arg.res);
	} else {
		promise.reject({ response: { data: { errMsg: arg.errMsg } } });
	}
	promise = undefined;

});



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