const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SubExercise = new Schema({
	highlightingDetailLevelIndex: Number,
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
			title: String,
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
	iFrameUrl: String,
	highlightingDetailLevelIndex: Number,
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