const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const validator = require('validator')
const alert = require('alert')
const path = require('path')
const https = require('https')
const { response } = require('express')
const { request } = require('http')
const bcrypt = require('bcrypt')
const saltRounds = 10;


const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))

//create a Mongo database
mongoose.connect("mongodb://localhost:27017/iCrowdTaskDB", {useNewUrlParser: true})

app.get('/', (req, res)=>{
    res.redirect('/login.html')
    // res.sendFile(path.join(__dirname, "public/login.html"));
})

//get back
app.get('/register', (req, res)=>{
    res.sendFile(path.join(__dirname, "public/registration.html"));
})

const userSchema = new mongoose.Schema({
    country:{
        type:String,
        required:true,
        validator(value){
            if(validator.isEmpty(value)){
                throw new Error('Please choose your country!')
            }
        }
    },
    salt:{
        type:String
    },
    firstName:{
        type: String,
        required: true ,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your first name!')
            }
        }
    },
    lastName:{
        type:String, 
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your last name!')
            }
        }
    },
    email:{
        type:String, 
        required: true,
        trim: true,
        validator(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your email address!')
            }
            if(!validator.isEmail(value)){
                throw new Error("Your email address is not valid!")
            }
        }
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your password!')
            }
            if(!validator.isLength(value,{min:8})){
                throw new Error('Your password must be at least 8 characters!')
                alert(Error)
            }
        }
    },
    confirmPassword:{
        type: String,
        required: true,
        validate(value) {
            if(!validator.equals(value, this.password)){
            throw new Error('Your password should be the same as Confirm password!')
            }
        }
    },
    address1:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input address!')
            }
        }
    },
    address2:{
        type: String,
        required:false
    },
    city:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input city!')
            }
        }
    },
    state:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input state!')
            }
        }
    },
    zip:{
        type:String,
        required:false
    },
    phoneNumber:{
        type:String,
        required:false,
        validate(value){
            if((!validator.isEmpty(value))&&(!validator.isMobilePhone(value, ['am-Am', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-SA', 'ar-SY', 'ar-TN', 'be-BY', 'bg-BG', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'de-AT', 'de-CH', 'el-GR', 'en-AU', 'en-CA', 'en-GB', 'en-GG', 'en-GH', 'en-HK', 'en-MO', 'en-IE', 'en-IN', 'en-KE', 'en-MT', 'en-MU', 'en-NG', 'en-NZ', 'en-PK', 'en-RW', 'en-SG', 'en-SL', 'en-UG', 'en-US', 'en-TZ', 'en-ZA', 'en-ZM', 'en-ZW' , 'es-CL', 'es-CO', 'es-CR', 'es-EC', 'es-ES', 'es-MX', 'es-PA', 'es-PY', 'es-UY', 'et-EE', 'fa-IR', 'fi-FI', 'fj-FJ', 'fo-FO', 'fr-BE', 'fr-FR', 'fr-GF', 'fr-GP', 'fr-MQ', 'fr-RE', 'he-IL', 'hu-HU', 'id-ID', 'it-IT', 'ja-JP', 'kk-KZ', 'kl-GL', 'ko-KR', 'lt-LT', 'ms-MY', 'nb-NO', 'ne-NP', 'nl-BE', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'sl-SI', 'sk-SK', 'sr-RS', 'sv-SE', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-HK', 'zh-MO', 'zh-TW']))){
                throw new Error('Your phone number is not valid!')
            }
        }
    }
})

//login get
app.get("/login", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/login.html"));
})

//login post
app.post('/login', (req, res)=>{
    const email = req.body.email
    const password = req.body.password
    User.findOne({email: email}, function(err, doc){
        if(doc){
            const result = bcrypt.compareSync(password, doc.password)
            if(result){
                res.redirect("/reqtask")
            }
            else{
                alert("Wrong password!")
                // res.send("Wrong password!")
            }
        }
        else{
            alert("Invalid email address!")
            // res.send("Invalid email address!")
        }
    })

})

const User = mongoose.model('User', userSchema)

//Register post
app.post('/register', (req, res)=>{

    const body = req.body;
    const userInfo = {country, firstName, lastName, email, password, confirmPassword, address1, address2, city, state, zip, phoneNumber} = body;
   
    body.salt = bcrypt.genSaltSync(saltRounds)
    body.password = bcrypt.hashSync(body.password, body.salt)
    body.confirmPassword = body.password

    const user = new User(userInfo)

    //Determine whether the mailbox has been registered
    User.findOne({email: email}, function(err, doc){
        if(doc){
            alert("This email address has already been registered! Please change another email address!")
            // res.send("This email address has already been registered! Please change another email address!")
        }
        else{
            user.save(function(error){
                if(error){
                    // res.send("Error!")
                    console.log("Error!")
                }
                else{
                    // res.redirect("/login")
                    res.redirect("/success")
                }
            })
        }
    })
    
    //Stop the email function of 6.1P for this task5.1C

    // console.log(firstName, lastName, email)
    // const data = {
    //     members:[{
    //         email_address: email,
    //         status: "subscribed",
    //         merge_fields:{
    //             // FNAME and LNAME are named on the mailchimp website
    //             FNAME: firstName,
    //             LNAME: lastName
    //         }
    //     }]
    // }

    // // mailchimp only accessible json
    // // define json
    // // convert "data" to json
    // // create the json "data"
    // jsonData = JSON.stringify(data)

    // const apiKey = "4d7a3d383e5ffbe14117bc15d102d690-us17"
    // // const list_id = "60fe224c14"

    // // define url and options
    // const url = "https://us17.api.mailchimp.com/3.0/lists/60fe224c14"
    // const options={
    //     method:"POST",
    //     auth:"azi:4d7a3d383e5ffbe14117bc15d102d690-us17"
    // }

    // const request = https.request(url, options, (response)=>{
    //     response.on("data", (data)=>{
    //         console.log(JSON.parse(data))
    //     })
    // })
    
    // request.write(jsonData)
    // request.end()

    // console.log(firstName, lastName, email)

    // user.save(function(error){
    //     if(error){
    //         // res.send("Error!")
    //         console.log("Error!")
    //     }
    //     else{
    //         res.redirect("/success")
    //     }
    // })
    
})

app.get("/success", (req, res) => {
    res.sendFile(path.join(__dirname, "public/success.html"));
  });

app.get("/reqtask", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/reqtask.html"));
})

app.listen(5000, function(request, response){
    console.log('Server is running on port 5000')
})