const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema({
    email: {
        type: String,
        required: [true, 'Email adress is required'],
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
	},
	courses: [
		{
			courseID: String,
			exercises: [
				{
					exerciseID: String,
					subExercises: [
						{
							subExerciseID: String,
							solved: Boolean,
							codeSnippets: {}
						}
					]
				}
			]
		}
	],
	code: {

	}
});

module.exports = mongoose.model('User', User);