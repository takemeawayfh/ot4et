const express = require('express');
const router = express.Router();
const News = require('../models/newsModel')

router.get('/', async (req, res) => {
    try {
        const news = await News.find();
        res.render('index', { session: req.session, news });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.get('/news/:postId', async (req, res) => {
    const { postId } = req.params;
    try {
        const item = await News.findOne({ postId });
        res.render('news', { item, session: req.session });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
})

module.exports = router;