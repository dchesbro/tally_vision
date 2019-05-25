var mongoose = require('mongoose');

// Define vote schema.
var voteSchema = new mongoose.Schema({
	username: {
		type:     String,
		required: [true, 'Whose man is this? (Missing username)'],
	},
	country: {
		type:     String,
		required: [true, 'Where in the world is this? (Missing country)'],
	},
	code: {
		type:     String,
		required: [true, 'Whr n th wrld s ths? (Missing country code)'],
	},
	cat1: {
		type:     Number,
		required: true,
		min:      [0, 'It can`t be that bad! (Can`t be less than zero)'],
		max:      [5, 'Seems too good to be true! (Can`t be greater than five)']
	},
	cat2: {
		type:     Number,
		required: true,
		min:      [0, 'It can`t be that bad! (Can`t be less than zero)'],
		max:      [5, 'Seems too good to be true! (Can`t be greater than five)']
	},
	cat3: {
		type:     Number,
		required: true,
		min:      [0, 'It can`t be that bad! (Can`t be less than zero)'],
		max:      [5, 'Seems too good to be true! (Can`t be greater than five)']
	},
	cat4: {
		type:     Number,
		required: true,
		min:      [0, 'It can`t be that bad! (Can`t be less than zero)'],
		max:      [5, 'Seems too good to be true! (Can`t be greater than five)']
	},
	total: {
		type:     Number
	}
});

// Calculate total score on document save.
voteSchema.pre('save', function(){
	this.total = this.cat1 + this.cat2 + this.cat3 + this.cat4;
});

// Define vote model.
var voteModel = mongoose.model('Vote', voteSchema);

module.exports = voteModel;
