const {Router} = require('express');
// const config = require('config');
const Task = require('../models/task');
const auth = require('../middleware/auth.middleware');
const router = Router();
const shortId = require('shortid');
const shortid = require("shortid");

router.post('/create', auth, async (req, res) => {
    try {
        const {epic, status, parentsTitles, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks} = req.body;
        const parentId = req.body.parentId?.[0];
        const code = shortId.generate();

        console.log(parentId);

        const cleanSubTasks = subTasks.map(subtask => {return { name: subtask.name, status: subtask.status }})

        const existing = await Task.findOne({ title })
        console.log(existing);
        if (existing) { return res.json({ task: existing }) }
        console.log("AAAAAAAA");
        const task = new Task({ code, epic, parentId, parentsTitles, status, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks: cleanSubTasks,  owner: req.user.userId });
        await task.save()
        console.log("AAAAAAAAA");
        res.status(201).json({ task })
    } catch(e) { console.log(e); res.status(500).json({message: 'Что-то пошло не так! Попробуйте сноваюddd'}) }
});

router.put('/update/:id', async (req, res) => {
    try {
        const {_id, epic, status, parentsTitles, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks} = req.body;
        const parentId = req.body.parentId?.[0];
        console.log(parentId);
        const existing = await Task.findOne({ _id })
        if (existing !== null) { if (existing.length > 1 || existing._id.toString() !== _id) { return res.json({ task: existing }) } }

        const updatedTask = new Task({ _id, epic, parentId, status, parentsTitles, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks });
        const task = await Task.findByIdAndUpdate( _id, { $set: updatedTask }, { new: true } );

        res.status(201).json({ task })
    } catch (err) { res.status(500).json({ error: err.message }) }
});

router.put('/check/:id', async (req, res) => {
    try {
        const {_id, status, subTasks} = req.body;
        const checkingTask = await Task.findOne({ _id });
        const  { epic, title, description, isEvent, dateStart, dateEnd, eisenhower } = checkingTask;
        const parentId = checkingTask.parentId?.[0];

        const checkedTask = new Task({ _id, epic, parentId, parentsTitles, status, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks });
        await Task.findByIdAndUpdate( _id, { $set: checkedTask }, { new: true } );
        res.status(201).json({ checkedTask })
    } catch (err) { res.status(500).json({ error: err.message }) }
});

router.put('/habits/:id', async (req, res) => {
    try {
        const {_id, epic, status, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks} = req.body;
        const updatedTask = new Task({ _id, epic, status, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks });
        const task = await Task.findByIdAndUpdate( _id, { $set: updatedTask }, { new: true } );
        res.status(201).json({ task })
    } catch (err) { res.status(500).json({ error: err.message }) }
});

router.get('/', auth, async (req, res) => {
    try {
        const todayDate = new Date();
        const today = todayDate.toLocaleDateString('ru-RU');
        const yesterdayDate = todayDate;
        yesterdayDate.setDate(todayDate.getDate() - 1);
        const yesterday = yesterdayDate.toLocaleDateString('ru-RU');


        const todayHabits = await Task.find({ owner: req.user.userId, epic: 'Привычки', title: "Привычки_"+today });
        if (todayHabits.length === 0) {
            const habits_temp = await Task.find({ owner: req.user.userId, epic: 'Привычки', title: "Привычки_шаблон" });
            const [day, month, year] = today.split('.');
            const date = new Date(`${year}-${month}-${day}`);
            const task = new Task({ code: shortid.generate(), epic: 'Привычки', status: false, title: 'Привычки_'+today, description: 'Привычки', isEvent: false,
                dateStart: date, dateEnd: date, eisenhower: 'A', subTasks: habits_temp[0].subTasks, owner: req.user.userId });
            await task.save()
        }

        const yesterdayHabits = await Task.find({ owner: req.user.userId, epic: 'Привычки', title: "Привычки_"+yesterday });
        if (yesterdayHabits.length === 0) {
            const habits_temp = await Task.find({ owner: req.user.userId, epic: 'Привычки', title: "Привычки_шаблон" });
            const [day, month, year] = today.split('.');
            const date = new Date(`${year}-${month}-${day}`);
            const task = new Task({ code: shortid.generate(), epic: 'Привычки', status: false, title: 'Привычки_'+yesterday, description: 'Привычки', isEvent: false,
                dateStart: date, dateEnd: date, eisenhower: 'A', subTasks: habits_temp[0].subTasks, owner: req.user.userId });
            await task.save()
        }

        const tasks = await Task.find({ owner: req.user.userId });
        res.json(tasks);
    } catch(e) { res.status(500).json({message: 'Что-то пошло не так! Попробуйте сноваюsss'}) }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id) // ???
        res.json(task);
    } catch(e) { res.status(500).json({message: 'Что-то пошло не так! Попробуйте сноваюfff'}) }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Задача удалена' });
    } catch (e) {
        res.status(500).json({ message: 'Ошибка при удалении задачи' });
    }
});

module.exports = router;
