const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Exercise = new Schema({
    name: String,
    source_files: [
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

module.exports = mongoose.model('Exercise', Exercise);