const {Router} = require('express');
const Task = require('../models/task');
const router = Router()

router.get('/:code', async (req, res) => {
    try {
        const task = await Task.findOne({ code: req.params.code});

        if (task) {
            await task.save()
            return res.redirect(task.title);
        }

        res.status(404).json("Ссылка не найдена")
    } catch (e) {
        res.status(500).json({message: "Что-то пошло не так("})
    }
})

module.exports = router