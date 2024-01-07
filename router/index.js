const express = require('express');
const router = express.Router();
const controller = require('../controller/admin/admin_controller');

const passport = require('passport');

//user panel 
router.use('/', require('./user'));

//dashboard

//log in 
router.get('/admin', controller.login_page);
router.post('/login', passport.authenticate('local', ({ failureMessage: '/admin' })), controller.login);


router.post('/ch_otp', controller.ch_otp);
router.post('/change_pass', controller.change_pass);


//slider
router.use('/admin/slider', passport.AuthenticateUser, require('./admin/slider'));

//product
router.use('/admin/product', passport.AuthenticateUser, require('./admin/product'))

//category
router.use('/admin/category', passport.AuthenticateUser, require('./admin/category'));


//admin
router.use('/admin', passport.AuthenticateUser, require('./admin/admin'));

module.exports = router;