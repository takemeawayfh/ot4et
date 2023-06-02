const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/checkAuth');
const {
    getUserData,
    getUserProfile,
    deleteAvatar,
    updateUserData,
} = require('../controllers/userControllers');

router.get('/', checkAuth, (req, res) => {
    res.render('dashboard', { session: req.session });
});

router.get('/user-data', checkAuth, getUserData);

router.get('/profile/:id', checkAuth, getUserProfile);

router.post('/profile/:id/delete-avatar', deleteAvatar);

router.post('/user-data', checkAuth, updateUserData);

module.exports = router;