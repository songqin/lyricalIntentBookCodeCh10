// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// Define a new 'PhotoSchema'
var UploadSchema = new Schema({
	public_id: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	creator: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	created: {
		type: Date,
		default: Date.now
	}
});

// Create the 'Upload' model out of the 'UploadSchema'
mongoose.model('Upload', UploadSchema);