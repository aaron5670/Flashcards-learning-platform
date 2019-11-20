const mongoose = require('mongoose');

//Create schema
const flashcardSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
    type: {
        type: String,
    },
    question: {
        type: String,
    }
});

//Create model
mongoose.model("Flashcard", flashcardSchema);

module.exports = flashcardSchema;