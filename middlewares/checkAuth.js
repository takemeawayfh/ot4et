const express = require('express');
const router = express.Router();
const UserDetails = require('../models/UserDetails');
const User = require('../models/user');

function checkAuth(req, res, next) {
    if (!req.session.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'user')) {
        return res.redirect('/login');
    }
    next();
}

module.exports = { checkAuth };