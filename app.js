if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const mongoose = require('mongoose');
const ejsMate=require('ejs-mate');
const methodOverride = require('method-override');
const path = require('path');
const app = express();
const session=require('express-session');
const flash=require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


const mongoSanitize = require('express-mongo-sanitize');

const MongoDBStore = require("connect-mongo")(session);

//const dbUrl = process.env.DB_URL 
//mongoose.connect(dbUrl)
// const dbUrl='mongodb://127.0.0.1:27017/yelp-camp';
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('ejs',ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
//mongo injection
app.use(mongoSanitize({
    replaceWith: '_'
}))


const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



 
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)



    

app.get('/',(req,res)=>{
    res.render('home');
})

app.get('/fakeUser',async(req,res)=>{
    const user=new User({email:'aishnee9@gmail.com',username:'tisha' });
    const newUser=await User.register(user,'password');
    res.send(newUser);
})






app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
    })

// app.use((err,req,res,next)=>{
//     res.send('Oh Girl,Something went wrong');
// })
