const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SubExercise = new Schema({
	sourceFiles: [
		{
			package: String,
			name: String,
			code: String
		}
	],
	content: [
		{
			type: { type: String, required: true },
			text: String,
			identifier: String,
			code: String,
			solution: String,
			settings: {
				minLines: Number
			}
		}
	]
});

let Exercise = new Schema({
	name: String,
	isVisibleToStudents: Boolean,
	subExercises: [
		SubExercise
	]
});

let Course = new Schema({
	name: String,
	isVisibleToStudents: Boolean,
	exercises: [
		Exercise
	]
});

module.exports = mongoose.model('Course', Course);