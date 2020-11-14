const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    userType: {
        type: String, enum: ['student', 'teacher'],
        required: true
    },
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        zipcode: String
    },
    studentReviews: [{
        userId: {type: mongoose.ObjectId},
        createdAt: {type: Date, default: Date.now},
        comments: String,
        courseId: {type: mongoose.ObjectId}
    }]
})

UserSchema.methods.joiValidate = function(obj) {
    var Joi = require('joi');
    Joi.objectId = require('joi-objectid')(Joi)
	const schema = {
        name: Joi.string().min(3).required(),
        age: Joi.number(),
        email: Joi.string().required(),
        userType: Joi.string().required(),
        address: Joi.object({
            line1: Joi.string(),
            line2: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            zipcode: Joi.string()
        })
        // studentReviews: Joi.array().items({
        //     userID: Joi.objectId(),
        //     createdAt: Joi.date(),
        //     comments: Joi.string(),
        //     courseId: Joi.objectId()
        // })
    };
    
	return Joi.validate(obj, schema);
}

module.exports = mongoose.model('User', UserSchema)