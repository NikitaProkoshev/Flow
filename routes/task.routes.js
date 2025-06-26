const {Router} = require('express');
const config = require('config');
const Task = require('../models/task');
const auth = require('../middleware/auth.middleware');
const router = Router();
const shortid = require('shortid');

router.post('/create', auth, async (req, res) => {
    try {
        console.log("AAAAAA");
        const baseUrl = config.get("baseUrl");
        const {title, description, dateStart, dateEnd, eisenhower} = req.body;
        console.log({title});

        const code = shortid.generate();

        console.log("ТУТ?")

        const existing = await Task.findOne({ title })

        console.log("ИЛИ ТУТ?")

        if (existing) {
            return res.json({ task: existing })
        }

        console.log("А МОЖЕТ ТУТ?")

        const task = new Task({
            code, title, description, dateStart, dateEnd, eisenhower,  owner: req.user.userId
        });

        await task.save()
        res.status(201).json({ task })


    } catch(e) {
        console.log("BBBBBBB");
        res.status(500).json({message: 'Что-то пошло не так! Попробуйте сноваюddd'})
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user.userId });
        res.json(tasks);
    } catch(e) {
        res.status(500).json({message: 'Что-то пошло не так! Попробуйте сноваюsss'})
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id) // ???
        res.json(task);
    } catch(e) {
        res.status(500).json({message: 'Что-то пошло не так! Попробуйте сноваюfff'})
    }
});

module.exports = router;
