const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/login', (req, res) => {
    if (req.session.email)
        res.redirect('/welcome');
    else
        res.render('login', { title: 'login', header: 'Please login to continue' });
});
router.get('/register', (req, res) => {
    if (req.session.email)
        res.redirect('/welcome');
    else
        res.render('login', { title: 'register', header: 'Please register to continue' });
});
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.post('/register', async (req, res) => {
    const postedUser = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password
    };
    // check ifemail already taken
    const emailExists = await User.emailExists(postedUser.email);
    if (emailExists) {
        // if email taken throw error
        req.flash('email_err', 'Email already used');
        res.redirect('/auth/register');
    } else {
        // else create new user and session
        await User.addUser(postedUser);
        req.session.email = postedUser.email;
        res.redirect('/welcome');
    }
});
router.post('/login', async (req, res) => {
    const postedUser = {
        email: req.body.email,
        password: req.body.password
    };
    // check if email exists
    const emailExists = await User.emailExists(postedUser.email);
    if (emailExists) {
        // if email exists then validate password
        const currentUser = new User(postedUser.email);
        await currentUser.getDetails();
        // if valid password create session else throw error
        if (currentUser.password == postedUser.password) {
            req.session.email = postedUser.email;
            res.redirect('/welcome');
        } else {
            req.flash('pwd_err', 'Invalid password');
            res.redirect('/auth/login');
        }
    } else {
        // if email doesnt exists throw error
        req.flash('email_err', "Email doesn't exists; please register");
        res.redirect('/auth/login');
    }
});

module.exports = router;