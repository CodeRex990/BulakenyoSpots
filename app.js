if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const spotgroundRoutes = require('./routes/spotgrounds');
const reviewRoutes = require('./routes/reviews.js');

// ✅ DATABASE
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/bulakan-spot';

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("✅ Database Connected");
});

const app = express();

// ✅ VIEW ENGINE
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

// ✅ SESSION STORE
const secret = process.env.SESSION_SECRET || 'fallbacksecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

app.use(session({
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(flash());

// ✅ HELMET (FIXED CSP)
app.use(helmet());

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],

            connectSrc: [
                "'self'",
                "https://api.maptiler.com"
            ],

            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net",
                "https://cdn.maptiler.com"
            ],

            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net",
                "https://cdn.maptiler.com"
            ],

            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://res.cloudinary.com",
                "https://images.unsplash.com",
                "https://api.maptiler.com"
            ],

            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com"
            ],

            objectSrc: [],
            workerSrc: ["'self'", "blob:"]
        }
    })
);

// ✅ PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ GLOBAL LOCALS
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentPath = req.path;
    next();
});

// ✅ ROUTES
app.use('/', userRoutes);
app.use('/spotgrounds', spotgroundRoutes);
app.use('/spotgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

// ✅ 404
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

// ✅ SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Serving on port ${port}`);
});