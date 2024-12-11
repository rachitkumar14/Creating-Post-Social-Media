
const express= require('express')
const app = express();
const cookieParser = require('cookie-parser')
// import isLogged from './Middleware.js/isLogged.js';
const isLogged = require('./Middleware.js/isLogged.js')
const path=require('path');
 const bcrypt = require('bcrypt')
 const jwt= require('jsonwebtoken');
const userModel  = require('./Models/userSchema.js');
const postModel = require('./Models/postSchema.js')
const PORT=8000;


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'Public')));


// SignUp Page

app.get('/',(req,res)=>{
    res.render('signup');
    console.log("home-cookies",req.cookies.token);
})

// Profile Page

app.get('/profile',isLogged,async(req,res)=>{
 try{
  //  console.log(req.user);
   const user = await userModel.findOne({email:req.user.email}).populate('posts')
   res.render('profile',{user});
 }
 catch(err)
 {
    console.log("error",err)
 }
})

// Creating posts

app.post('/createdPost',isLogged,async(req,res)=>{
     try{
        const {content} = req.body;
        const user = await userModel.findOne({email:req.user.email})
        const post = await postModel.create({
            content,
            user:user._id
        })
       

        user.posts.push(post._id);
        console.log(post._id);
        user.save();

        res.redirect('/profile')
     }
     catch(err)
     {
        console.log("error in created post",err)
     }
})

// Like the post 

app.get('/like/:id',isLogged,async(req,res)=>{
    
    const post = await postModel.findOne({_id:req.params.id}).populate('user')
    const user = await userModel.findOne({email:req.user.email})

     if(post.likes.indexOf(user._id)===-1)
     {
        post.likes.push(user._id);
     }
     else{
        post.likes.splice(post.likes.indexOf((user._id),1));
     }
      
       // console.log('data',user._id)
     await  post.save();
       res.redirect('/profile');

})

// all Posts

app.get('/posts',isLogged,async(req,res)=>{

    try{

     const posts = await postModel.find({}).populate('user')
     const user = await userModel.findOne({email:req.user.email});
     
    res.render('posts',{posts,user});

    }
    catch(err)
    {
        console.log('Something went wrong in posts');
    }

})
 
  // Login Page
 
app.get('/login',(req,res)=>{
    res.render('login')


    
})

// Create user

app.post('/create',async(req,res)=>{

    try{
        const {name,username,email,age,password}=req.body
      //  console.log(name,username,email,age,password);

        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(password,salt,async(err,hash)=>{
                if(err)
                {
                    console.log('error occur in hashing password')
                }
                else{
                       await userModel.create({
                        name,
                        username,
                        email,
                        age,
                        password:hash
                     })
                    //  res.send('hi');
                    const token = jwt.sign({email,username},"rachitishere")
                    res.cookie("token",token)
                    console.log(req.cookies.token)
                  
                    
                     res.redirect('/profile')

                }
            })
        })     

      
    }

    

   catch(err){
    res.status(500).json({
        message:err
    })
   }



})

// Delete Post

app.get('/delete/:id',async(req,res)=>{
    try{
          await postModel.findOneAndDelete({_id:req.params.id});
        res.redirect('/profile')
    }
    catch(err)
    {
        console.log('Error in deleting post ',err)
    }
})

// Select edit post 

app.get('/edit/:id',isLogged,async(req,res)=>{
    try{
      //  const user = await userModel.findOne({email:req.user.email});
        const post = await postModel.findOne({_id:req.params.id}).populate('user')
        res.render('edit',{post})
    }
    catch(err)
    {
        console.log('Error in Select edit post ',err)
    }
   
})

// Update the post

app.post('/update/:id',isLogged,async(req,res)=>{
    try{
        const {content} = req.body;
        // console.log("content",contents);
        // console.log(req.params.id);
         await postModel.findOneAndUpdate({_id:req.params.id},{content},{new:true})
        res.redirect('/profile')
    }
    catch(err)
    {
        console.log('Error in Edit the post ',err)
    }
})



// Login user

app.post('/login',async(req,res)=>{

    try{
        const {email,password}=req.body;

        const user = await userModel.findOne({email})
        if(!user)
        {
            res.redirect('/')
        }
        else{
            bcrypt.compare(password,user.password,(err,result)=>{
             if(err)
             {
                console.log('something went wrong')
             }
             else{
                if(result==false)
                    {
                        res.send('Something went wrong')
                    }
                    else{
                        const token = jwt.sign({email,username:user.username},"rachitishere")
                        res.cookie("token",token)
                        res.redirect('/profile')
                    }
             }
            })
        }

    }
    catch(err)
    {
        res.status(500).json({
            message:'error in login page',err
        })
    }


})

// logout

app.get('/logout',(req,res)=>{

    if(req.cookies.token)
    {
        res.cookie("token","")
    }
    res.redirect('/');

     
 })
  



app.listen(PORT,()=>{
    console.log(`Server Connected Successfully at ${PORT} `)
})