const express = require('express');
const router = express.Router();
const News = require('../models/newsModel');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); // Импорт функции uuidv4 из модуля uuid

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


router.get('/edit-news', async (req, res) => {
    try {
        const news = await News.find();
        res.render('edit-news', { news, session: req.session });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
});

router.post('/delete-news/:id', async (req, res) => {
    const newsId = req.params.id;
    try {
        const news = await News.findById(newsId);
        const posterPath = `public/uploads/${news.poster}`;
        fs.unlinkSync(posterPath);
        await News.findByIdAndDelete(newsId);
        res.redirect('/dashboard/edit-news');
    } catch (err) {
        console.error(err);
        res.render('error');
    }
});

router.get('/edit-news/:id', async (req, res) => {
    const newsId = req.params.id;
    try {
        const news = await News.findById(newsId);
        res.render('edit-news-form', { news, session: req.session });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard/edit-news');
    }
});


router.post('/edit-news/:id', upload.single('poster'), async (req, res) => {
    const newsId = req.params.id;
    try {
        const news = await News.findById(newsId);
        if (!news) {
            return res.render('error');
        }

        // Проверяем наличие обязательных полей
        if (!req.body.title || !req.body.category || !req.body.description) {
            throw new Error('Заполните все обязательные поля');
        }

        news.title = req.body.title;
        news.category = req.body.category;
        news.description = req.body.description;

        if (req.file) {
            // Удаляем старый файл
            const posterPath = `public/uploads/${news.poster}`;
            fs.unlinkSync(posterPath);
            // Заменяем на новый файл
            news.poster = req.file.filename;
        }

        await news.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('error');
    }
});

module.exports = router;