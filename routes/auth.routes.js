const {Router} = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const {check, validationResult } = require("express-validator")
const User = require("../models/user")
const Task = require("../models/task");
const shortid = require("shortid");
const router = Router()

// /api/auth/register
// Логика регистрации пользователя
router.post(
    "/register",
    [
        check('email', 'Некорректный Email!').isEmail(),
        check('password', "Минимальная длина пароля 6 символов").isLength({min: 6})
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    toaster: {description: "Некорректные данные при регистрации", type: 'error'}
                })
            }
            const {email, password} = req.body

            const candidate = await User.findOne({email})
            if (candidate) { return res.status(400).json({message:"Такой пользователь уже существует!"}) }
            const hashedPassword = await bcrypt.hash(password, 12)
            const user = new User({email, password: hashedPassword})

            const task = new Task({ code: shortid.generate(), epic: 'Привычки', status: false, title: 'Привычки_шаблон', description: 'Привычки', isEvent: false,
                dateStart: new Date(), dateEnd: new Date('2099-12-31'), eisenhower: 'A', subTasks: [], owner: user._id });

            await task.save()
            await user.save()
            res.status(201).json({message: "Пользователь создан!"})

        } catch(e) {
            res.status(500).json({message: 'Что-то пошло не так! Попробуйте сноваю'})
        }
    }
)

// /api/auth/login
router.post(
    "/login",
    [
        check('email', "Введите корректный email").normalizeEmail().isEmail(),
        check('password', "Введите пароль").exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Некорректные данные при входе в систему"
                })
            }

            const {email, password} = req.body

            const user = await User.findOne({ email })

            if (!user) {
                return res.status(400).json({ message: "Пользователь не найден!" })
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                return res.status(400).json({ message: "Неверный пароль! Попробуйте снова." })
            }

            const token = jwt.sign(
                { userId: user.id},
                config.get('jwtSecret'),
                {expiresIn: '1y'}
            )

            res.json({token, userId: user.id})

        } catch(e) {
            res.status(500).json({message: 'Что-то пошло не так! Попробуйте сноваю'})
        }
    }
)


module.exports = router