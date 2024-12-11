
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/socialmedia').then(()=>{
    console.log('Database Connected successfully')
}).catch((err)=>{
    console.log('Error in connected database',err);
})

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true

    },
    username:{
        type:String,
        unique:true,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"post"
        }
    ]

})

module.exports = mongoose.model('user',userSchema)