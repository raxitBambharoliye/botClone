const passport = require('passport');
const admin = require('../model/admin_model');
const passport_local = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

passport.use(new passport_local({
    usernameField: "email"
}, async (email, password, done) => {
    let data = await admin.findOne({ email: email });
    if (data) {
        if (await bcrypt.compare(password, data.password)) {
            done(null, data);
        } else {
            done(null, false);
        }
    } else {
        done(null, false);
    }
}));



passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    let data = await admin.findById(id);
    if (data) {
        done(null, data);
    }
})

passport.AuthenticateUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.role == 'admin') {
            next();
        } else {
            res.redirect("/admin");
        }
    } else {
        res.redirect("/admin");
    }
}

passport.setAuthenticatedUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        if(req.user.role=='admin'){
            res.locals.admin = req.user;
        }else{
            res.locals.user=req.user;
        }
    }
    next();
}

module.exports = passport;