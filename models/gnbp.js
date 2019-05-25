var mongoose = require('mongoose');

// Define GNBP schema.
var gnbpSchema = new mongoose.Schema({
	username: {
		type:     String,
		required: [true, 'Whose man is this? (Missing username)'],
	},
	code: {
		type:     String,
		required: [true, 'Where in the world is this? (Missing country code)'],
	}
});

// Define vote model.
var gnbpModel = mongoose.model('GNBP', gnbpSchema);

module.exports = gnbpModel;
