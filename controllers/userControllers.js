const UserDetails = require('../models/UserDetails');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/avatars');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + Date.now() + ext;
        cb(null, filename);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: Images only!'));
        }
    },
}).single('avatar');

const getUserData = async (req, res) => {
    let userDetails = await UserDetails.findOne({ user: req.session.user._id });

    if (!userDetails) {
        userDetails = new UserDetails({
            user: req.session.user._id,
            nickname: '',
            about: '',
            avatarUrl: '',
        });
        await userDetails.save();
    }
    res.render('userDataForm', { session: req.session, userDetails: userDetails });
};

const getUserProfile = async (req, res) => {
    const userDetails = await UserDetails.findOne({ user: req.params.id }).populate('user');
    if (!userDetails) {
        return res.redirect('/dashboard');
    }

    res.render('userProfile', { session: req.session, userDetails });
};

const deleteAvatar = async (req, res) => {
    const userDetails = await UserDetails.findOne({ user: req.params.id });

    if (!userDetails) {
        return res.redirect('/dashboard');
    }

    if (userDetails.avatarUrl) {
        const filePath = path.join(__dirname, '..', 'public', userDetails.avatarUrl);
        fs.unlinkSync(filePath);
    }

    userDetails.avatarUrl = null;
    await userDetails.save();

    res.redirect(`/dashboard/profile/${req.params.id}`);
};

const updateUserData = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.render('userDataForm', { session: req.session, userDetails: req.body });
        }

        try {
            let userDetails = await UserDetails.findOne({ user: req.session.user._id });

            if (userDetails) {
                // Проверяем, если никнейм изменился
                if (userDetails.nickname !== req.body.nickname) {
                    const existingUserDetails = await UserDetails.findOne({ nickname: req.body.nickname });

                    if (existingUserDetails) {
                        // Никнейм уже существует, возвращаем ошибку
                        return res.render('userDataForm', { session: req.session, error: 'Nickname already exists', userDetails: userDetails });
                    }
                }

                userDetails.nickname = req.body.nickname;
                userDetails.about = req.body.about;
                if (req.file) {
                    const oldAvatarPath = userDetails.avatarUrl ? path.join(__dirname, '..', 'public', userDetails.avatarUrl) : null;
                    userDetails.avatarUrl = '/img/avatars/' + req.file.filename;

                    if (oldAvatarPath && fs.existsSync(oldAvatarPath)) {
                        fs.unlinkSync(oldAvatarPath);
                    }
                }

                await userDetails.save();
            } else {
                userDetails = new UserDetails({
                    user: req.session.user._id,
                    nickname: req.body.nickname,
                    about: req.body.about,
                    avatarUrl: req.file ? '/img/avatars/' + req.file.filename : null,
                });
                await userDetails.save();
            }

            res.redirect('/dashboard');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });
};

module.exports = {
    getUserData,
    getUserProfile,
    deleteAvatar,
    updateUserData,
};