const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.ObjectId,
        unique: true
    },
    enrolledStudents: {
        type: [ mongoose.ObjectId ]
    }
})


CourseSchema.methods.joiValidate = function(obj) {
    var Joi = require('joi');
    Joi.objectId = require('joi-objectid')(Joi)
	const schema = {
        name: Joi.string(3).required(),
        description: Joi.string(),
        teacher: Joi.objectId(),
        enrolledStudents: Joi.array().items( Joi.objectId() )
    
    }
    
    return Joi.validate(obj, schema);
}

module.exports = mongoose.model('Course', CourseSchema)