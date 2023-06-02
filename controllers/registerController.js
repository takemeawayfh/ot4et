const bcrypt = require('bcryptjs');
const User = require('../models/user');


async function rigister(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Введите email и пароль');
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).send('Пользователь таким email уже зарегистрирован');
    }
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = new User({
        email,
        password: hashedPassword,
    });

    try {
        await user.save();
        res.render('login');
    } catch (err) {
        res.status(500).send('Ошибка при сохранении пользователя в базе данных');
    }
}

module.exports = {
    rigister
};