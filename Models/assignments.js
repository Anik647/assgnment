const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    marks: {type: Number, min: 0, max: 100},
    grade: {type: String},
    courseID: {type: mongoose.ObjectId},
    studentID: {type: mongoose.ObjectId},
    conductedOn: {type: Date, default: Date.now},
    assignmentType: String, enum:['internal', 'external'],
    attemptNo: {type: Number},
    proctoredBy: mongoose.ObjectId
})

AssignmentSchema.methods.joiValidate = function(obj) {
    var Joi = require('joi');
    Joi.objectId = require('joi-objectid')(Joi)
	const schema = {
        marks: Joi.number(),
        //grade: Joi.string(),
        courseID: Joi.objectId(),
        studentID: Joi.objectId(),
        conductedOn: Joi.date(),
        assignmentType: Joi.string(),
        attemptNo: Joi.number(),
        proctoredBy: Joi.objectId()
    }
    
    return Joi.validate(obj, schema);
}


module.exports = mongoose.model('Assignment', AssignmentSchema)