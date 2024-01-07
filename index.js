const express = require('express');
const path = require('path');
const app = express();
const db = require('./config/mongodb');

const cookie = require('cookie-parser');
var stripe = require('stripe')('sk_test_51NSCzhSD9ziaLFcdt3BSz9g2yMG2jhKvtEu4q7Co6i5HVWf4WIaTqmdHLTIPlhTEaHMQFGecT1vFwaHJLfs9OmUQ00wWh6mYsY');

app.use(cookie());

app.use(express.static('assets'));
app.use(express.static('user_assets'));

app.use(express.urlencoded());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

//flash
const flash = require('express-flash')
const flash_mid = require('./config/flash_message');
//session
const session = require('express-session');
const passport = require('passport');
const pass_mid = require('./config/passport');

app.use(session({
    name: 'admin',
    secret: 'e_com',
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 60 * 100 * 690
    }
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(flash_mid.setFlash);

app.use('/', require('./router/index'));
app.listen(8009,async (err) => {
    if (!err) {
    }
    console.log('server is running: 8009');
})

