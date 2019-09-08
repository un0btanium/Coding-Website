import Axios from 'axios';
Axios.defaults.adapter = require('axios/lib/adapters/http');



/* COURSE */

export const getCoursesOverview = (page) => {
	return new Promise((resolve, reject) => {
		Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/courses/' + page)
			.then(response => {return resolve(response);})
			.catch(function (error) {return reject(error);});
	})
}

export const createCourse = (data) => {
	return new Promise((resolve, reject) => {
		Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/course', data)
        	.then(response => {return resolve(response);})
			.catch(function (error) {return reject(error);});
	})
}

export const importCourse = (data) => {
	return new Promise((resolve, reject) => {
		reject({ response: { data: { errMsg: "Importing Course and User Code is not supported yet!" } } });
	})
}

export const getCourse = (courseID) => {
	return new Promise((resolve, reject) => {
		Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/course/' + courseID)
			.then(response => {return resolve(response);})
			.catch(function (error) {return reject(error);});
	})
}

export const getCourseFull = (courseID) => {
	return new Promise((resolve, reject) => {
		Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/course/full/' + courseID)
			.then(response => {return resolve(response);})
			.catch(function (error) {return reject(error);});
	})
}

export const getCourseAndUserCode = (courseID) => {
	return new Promise((resolve, reject) => {
		Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/course/full2/' + courseID)
			.then(response => {return resolve(response);})
			.catch(function (error) {return reject(error);});
	})
}

export const switchCourseVisibility = (courseID, isVisibleToStudents) => {
	return new Promise((resolve, reject) => {
		Axios.put(process.env.REACT_APP_BACKEND_SERVER + '/course/visibility', { id: courseID, isVisibleToStudents: !isVisibleToStudents})
            .then(response => {return resolve(response);})
            .catch(function (error) {return reject(error);});
	})
}

export const moveExercise = (data) => {
	return new Promise((resolve, reject) => {
		Axios.put(process.env.REACT_APP_BACKEND_SERVER + '/course/moveexercise', data)
			.then(response => {return resolve(response);})
			.catch(function (error) {return reject(error);});
	})
}

export const deleteCourse = (courseID) => {
	return new Promise((resolve, reject) => {
        Axios.delete(process.env.REACT_APP_BACKEND_SERVER + '/course/' + courseID)
            .then(response => {return resolve(response);})
            .catch(function (error) {return reject(error);});
	})
}



/* EXERCISE */

export const createExercise = (data) => {
	return new Promise((resolve, reject) => {
		Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/course/exercise', data)
        	.then(response => {return resolve(response);})
			.catch(function (error) {return reject(error);});
	})
}

export const getExercise = (courseID, exerciseID) => {
	return new Promise((resolve, reject) => {
		Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/course/' + courseID + '/exercise/' + exerciseID)
        	.then(response => {return resolve(response);})
			.catch(function (error) {return reject(error);});
	})
}

export const saveExercise = (data) => {
	return new Promise((resolve, reject) => {
		Axios.put(process.env.REACT_APP_BACKEND_SERVER + '/course/exercise', data)
			.then(response => {return resolve(response);})
			.catch(function (error) {return reject(error);});
	})
}

export const switchExerciseVisibility = (courseID, exerciseID, isVisibleToStudents) => {
	return new Promise((resolve, reject) => {
		Axios.put(process.env.REACT_APP_BACKEND_SERVER + '/exercise/visibility', { courseID: courseID, exerciseID: exerciseID, isVisibleToStudents: !isVisibleToStudents})
            .then(response => {return resolve(response);})
            .catch(function (error) {return reject(error);});
	})
}

export const deleteExercise = (courseID, exerciseID) => {
	return new Promise((resolve, reject) => {
		Axios.delete(process.env.REACT_APP_BACKEND_SERVER + '/course/' + courseID + '/exercise/' + exerciseID)
            .then(response => {return resolve(response);})
            .catch(function (error) {return reject(error);});
	})
}



/* CODE EXECUTION */

export const sendInputToProcess = (data) => {
	return new Promise((resolve, reject) => {
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
		let options = {
            timeout: 120*1000, // TODO adjust?
            // responseType: 'stream',
            maxContentLength: 1000000000,
            headers: {
                "Content-Type": "application/json"
            }
        };
		Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/exercise/run', data, options)
            .then(response => {return resolve(response);})
            .catch(function (error) {return reject(error);});
	})
}


        