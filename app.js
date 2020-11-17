// console.log('hello world')

const express = require('express')
const mongoose = require('mongoose');
const Joi = require('joi');
const dotenv = require('dotenv');
const connectDB = require('./config/db')
const User = require('./Models/User');
const Assignment = require('./Models/assignments');
const Course = require('./Models/courses')
Joi.objectId = require('joi-objectid')(Joi)



const app = express()

app.use(express.json());
dotenv.config({path: './config/config.env'})
connectDB();

function grade(marks){
    if(marks < 40) return 'F';
        else if(marks < 50) return 'E';
        else if(marks < 60) return 'D';
        else if(marks < 70) return 'C';
        else if(marks < 80) return 'B';
        else if(marks < 90) return 'A';
        else return 'S';
    
}

app.post('/users', async(req, res) => {
    try{
        const body = req.body
    //todo joi validation
    const _user = await User.findOne({email: body.email})
    if(_user) return;
    const user = await User.findOneAndUpdate({
        email: body.email
    },
        req.body,
        {
        upsert: true,
        new: true
    })
    return res.send(user);
    }
    catch(err){
        console.error(err)
        return res.status(400).send('Bad request');
    }
})

app.post('/users/studentReviews/:teacheremail/:studentemail/:course', async(req, res) => {
    try {

        const body = req.body

        // const teacher = find teacher
        const teacher = await User.find({email: body.email, userType:"teacher"})
        if(!teacher) return res.status(404).send('User not found')
        // const student = find student
        const student = await User.find({email: body.email, userType:"student"})
        if(!student) return res.status(404).send('User not found');
        // const course = find course
        const course = await Course.find({name: body.name})
        if(!course) return res.status(400).send('Bad Request')
        // ensure userType for student and teacher
        const review = {
            comments: req.body.comments,
            userId: student._id,
            courseId: course._id,
        }

        const user = await User.findOneAndUpdate({
            email: body.email, userType: "teacher"
        },
            {$push: {studentReviews: review}},
            {
            // upsert: true,
            new: true
        })
        return res.send(user);
    } catch (error) {
        console.error(err);
        return res.status(400).send('Bad Request')
    }
})

//post to create a course like we did for the user, only name and description
app.post('/courses', async(req, res) => {
    try{
        const body = req.body
    //todo joi validation(already done in the model)
    const _course = await Course.findOne({name: body.name})
    if(_course) return res.status(404).send('Given course does not exist');
    const course = await Course.findOneAndUpdate({
        name: body.name
    },
        req.body,
        {
        upsert: true,
        new: true
    })
    return res.send(course);
    }
    catch(err){
        console.error(err)
        return res.status(400).send('Bad request');
    }
})
//create a default course 
app.post('/courses', async (req, res) => {
    try{
        const course1 = new Course({
            name: req.body.name,
            description: req.body.description
        })
        const result = await course1.save()
        res.send(result)
    }
    catch(err){
        console.error(err);
        return res.status(400).send('Bad request');
    }
})

app.post('/assignments', async(req, res) => {
    try{
       const assignment1 = new Assignment({
           marks: req.body.marks,
           grade: grade(req.body.marks),
          courseID: req.body.courseID,
          studentID: req.body.studentID,
          assignmentType: req.body.assignmentType,
          
          proctoredBy: req.body.proctoredBy
       })
       const result = await assignment1.save();
       console.log(result);
       return res.send(result);
    }
    catch(err){
        console.error(err);
        return res.status(400).send('Bad request')
    }
})

app.put('/users/:email', async(req, res) => {
   const user = await User.find(u => u.email === req.params.email)

   if(!user) return res.status(404).send('User not found');

   user.name = req.body.name;
   user.age = req.body.age;
   user.address = req.body.address;

   return res.send(user);
})

app.put('/courses/:id', async(req, res) => {
    const course = await Course.find(c => c.id === parseInt(req.params.id))
    if(!course) return res.status(404).send('User not found');

    course.name = req.body.name;
    course.description = req.body.description;
    course._id = req.body._id;

    const result = await course.save();

    return res.send(result);
})




app.get('/user/:studentemail', async (req, res) => {
    const studentemail = req.params.studentemail;
    let obj = new Object();
    console.log(studentemail);

    const userProfile = await User
    .find({email: studentemail, userType:'student'})
    .select({name: 1, age: 1, address: 1})
    if(!userProfile) return res.status(404).send('user not found');
    // res.send(userProfile);
    obj.userProfile = userProfile;
    console.log(userProfile)
    
    const studentId = await User
    .find({email: studentemail, userType: 'student'})
    .select({_id: 1});

    console.log(studentId);

    const enrolledCourses = await Course.find({enrolledStudents: studentId});
    // res.send(enrolledCourses);
    obj.enrolledCourses = enrolledCourses;

    const assignments = await Assignment.find({studentID: studentId});
    // res.send(assignments);
    obj.assignements = assignments

    const reviewsOnStudent = await User
    .find({userId: studentId})
    .select({studentReviews: 1})
    obj.reviewsOnStudent = reviewsOnStudent
    res.send(obj)
    
});

app.get('/user/:teacheremail', async (req, res) => {
    const teacheremail = req.params.teacheremail;
    let obj = new Object();
    const userProfile = await User
    .find({email: teacheremail, userType:'teacher'})
    .select({name: 1, age: 1, address: 1})
    if(!userProfile) return res.status(404).send('user not found');
    // res.send(userProfile);
    obj.userProfile = userProfile
    // console.log(userProfile)
    
    const teacherId = await User
    .find({email: teacheremail, userType: 'teacher'})
    .select({_id: 1});
    console.log(teacherId)

    const enrolledCourses = await Course.find({enrolledStudents: teacherId});
    obj.enrolledCourses = enrolledCourses
    // res.send(enrolledCourses);

    const assignments = await Assignment.find({proctoredBy: teacherId});
    obj.assignements = assignments
    // res.send(assignments);

    const reviewsByStudents = await User
    .find({userId: teacherId})
    .select({studentReviews: 1})
    obj.reviewsByStudents = reviewsByStudents
    // res.send(reviewsByStudents)
    res.send(obj);

    
});

app.get('/courses/:id', async (req, res) => {
    let obj = new Object();
    const id = req.params.id;
   const course = await Course.find({_id: id})
   if(!course) return res.status(404).send('Course not found');
//    res.send(course);
   obj.course = course;
   
   const teacherId = await Course
   .find({_id: id})
   .select({teacher: 1})
   const teacher = await User.find({_id: teacherId})
//    res.send(teacher);
    obj.teacherId = teacherId

   const studentId = await Course
   .find({_id: id})
   .select({enrolledStudents: 1})

   const student = await User.find({_id: studentId})
   obj.studentId = studentId;
//    res.send(student);

   const assignements = await Assignment.find({courseID: id})
   obj.assignments = assignments
   res.send(obj);
    
});

app.get('/reviews', async(req, res) => {
    const reviews = await User.find().select({studentReviews: 1});
    if(!reviews) return res.status(400).send('Bad request');
    res.send(reviews);
})


const port = process.env.PORT || 2020;

app.listen(port, () => console.log(`Listening on port ${port}..`));