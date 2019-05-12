var mongoose = require('mongoose');

// Define vote schema.
var voteSchema = new mongoose.Schema({
    user: {
        type:     String,
        required: [true, 'How am I supposed to know who`s vote this is?'],
    },
    contestant: {
        type:     String,
        required: [true, 'How am I supposed to know which contestant this is for?'],
    },
    cat1: {
        type:     Number,
        required: true,
        min:      [0, 'Category scores can`t be less than zero!'],
        max:      [5, 'Category scores can`t be greater than five!']
    },
    cat2: {
        type:     Number,
        required: true,
        min:      [0, 'Category scores can`t be less than zero!'],
        max:      [5, 'Category scores can`t be greater than five!']
    },
    cat3: {
        type:     Number,
        required: true,
        min:      [0, 'Category scores can`t be less than zero!'],
        max:      [5, 'Category scores can`t be greater than five!']
    },
    cat4: {
        type:     Number,
        required: true,
        min:      [0, 'Category scores can`t be less than zero!'],
        max:      [5, 'Category scores can`t be greater than five!']
    },
    cat5: {
        type:     Number,
        required: true,
        min:      [0, 'Category scores can`t be less than zero!'],
        max:      [5, 'Category scores can`t be greater than five!']
    }
});

// Define vote model.
var voteModel = mongoose.model('Vote', voteSchema);

module.exports = voteModel;
