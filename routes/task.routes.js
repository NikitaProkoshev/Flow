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

        const cleanSubTasks = subTasks.map(subtask => {return { name: subtask.name, status: subtask.status }})

        const existing = await Task.findOne({ title })
        console.log(existing);
        if (existing) { return res.json({ task: existing, error: 'Задача с таким названием уже существует!' }) }
        const task = new Task({ code, epic, parentId, parentsTitles, status, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks: cleanSubTasks,  owner: req.user.userId });
        await task.save()
        res.status(201).json({ task, error: undefined })
    } catch(e) { res.status(500).json({message: 'Что-то пошло не так! Попробуйте сноваюddd'}) }
});

router.put('/update/:id', async (req, res) => {
    try {
        console.log(req);
        const {_id, epic, status, parentsTitles, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks} = req.body;
        const parentId = req.body.parentId?.[0];
        console.log(parentId);
        const existing = await Task.findOne({ _id })
        if (existing !== null) { if (existing.length > 1 || existing._id.toString() !== _id) { return res.json({ task: existing, error: 'Задача с таким названием уже существует!' }) } }

        const updatedTask = new Task({ _id, epic, parentId, status, parentsTitles, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks });
        const task = await Task.findByIdAndUpdate( _id, { $set: updatedTask }, { new: true } );

        res.status(201).json({ task, error: undefined })
    } catch (err) { res.status(500).json({ error: err.message }) }
});

router.put('/check/:id', async (req, res) => {
    try {
        const {_id, status, subTasks} = req.body;
        const checkingTask = await Task.findOne({ _id });
        const  { epic, parentsTitles, title, description, isEvent, dateStart, dateEnd, eisenhower } = checkingTask;
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
        const { period } = req.headers;
        console.log(period);
        const today = new Date(), tomorrow = new Date(), week = new Date(), month = new Date();
        today.setUTCHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setUTCHours(23, 59, 59, 999);
        console.log(tomorrow);
        week.setDate(week.getDate() + 8);
        week.setUTCHours(23, 59, 59, 999);
        console.log(week);
        month.setDate(month.getDate() + 1);
        month.setMonth(month.getMonth() + 1);
        month.setUTCHours(23, 59, 59, 999);
        console.log(month);
        const periods = { today: tomorrow, week: week, month: month };
        periodFilter = period ? { $or: [{dateEnd: { $lt: periods[period] }}, {dateStart: { $lt: periods[period] }}] } : {};
        const todayStr = today.toLocaleDateString('ru-RU');
        const yesterday = today;
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('ru-RU');


        const todayHabits = await Task.find({ owner: req.user.userId, epic: 'Привычки', title: "Привычки_"+todayStr });
        if (todayHabits.length === 0) {
            const habits_temp = await Task.find({ owner: req.user.userId, epic: 'Привычки', title: "Привычки_шаблон" });
            const [day, month, year] = todayStr.split('.');
            const date = new Date(`${year}-${month}-${day}`);
            const task = new Task({ code: shortid.generate(), epic: 'Привычки', status: false, title: 'Привычки_'+todayStr, description: 'Привычки', isEvent: false,
                dateStart: date, dateEnd: date, eisenhower: 'A', subTasks: habits_temp[0].subTasks, owner: req.user.userId });
            await task.save()
        }

        const yesterdayHabits = await Task.find({ owner: req.user.userId, epic: 'Привычки', title: "Привычки_"+yesterdayStr });
        if (yesterdayHabits.length === 0) {
            const habits_temp = await Task.find({ owner: req.user.userId, epic: 'Привычки', title: "Привычки_шаблон" });
            const [day, month, year] = yesterdayStr.split('.');
            const date = new Date(`${year}-${month}-${day}`);
            const task = new Task({ code: shortid.generate(), epic: 'Привычки', status: false, title: 'Привычки_'+yesterdayStr, description: 'Привычки', isEvent: false,
                dateStart: date, dateEnd: date, eisenhower: 'A', subTasks: habits_temp[0].subTasks, owner: req.user.userId });
            await task.save()
        }
        const tasks = await Task.find({ owner: req.user.userId, ...periodFilter });
        res.json(tasks);
    } catch(e) { res.status(500).json({message: 'При загрузке задач на сервере возникла ошибка (Error: Разраб еблан...)'}) }
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
