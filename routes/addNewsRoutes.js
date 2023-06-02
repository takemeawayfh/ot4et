const express = require('express');
const router = express.Router();
const News = require('../models/newsModel');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        cb(null, uniqueSuffix + '.' + fileExtension);
    },
});

const upload = multer({ storage: storage });

router.get('/add-news', (req, res) => {
    res.render('add-news', { session: req.session });
});

router.post('/add-news', upload.single('poster'), async (req, res) => {
    const { title, category, description } = req.body;
    const poster = req.file.filename;

    try {
        const count = await News.countDocuments();
        const postId = `post${count + 1}`;

        const news = new News({ title, category, description, poster, postId });
        await news.save();

       res.redirect(`/`);
    } catch (err) {
        console.error(err);
        res.redirect('/add-news');
    }
});

module.exports = router;

