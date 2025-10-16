const {Router} = require('express');
// const config = require('config');
const Task = require('../models/task');
const auth = require('../middleware/auth.middleware');
const router = Router();
const shortId = require('shortid');

function normalizeStartOfDay(date) {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d;
}

function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function addWeeks(date, weeks) { return addDays(date, weeks * 7); }
function addMonths(date, months) { const d = new Date(date); d.setMonth(d.getMonth() + months); return d; }
function addYears(date, years) { const d = new Date(date); d.setFullYear(d.getFullYear() + years); return d; }

function* iterateOccurrences(recurrence, from, to) {
    if (!recurrence || !recurrence.frequency) return;
    const interval = Math.max(1, recurrence.interval || 1);
    const seriesStart = recurrence.startDate ? new Date(recurrence.startDate) : from;
    const seriesEnd = recurrence.endDate ? new Date(recurrence.endDate) : null;
    const windowStart = new Date(from);
    const windowEnd = new Date(to);

    let cursor = new Date(seriesStart);
    if (recurrence.frequency === 'daily') {
        const diffDays = Math.floor((windowStart - cursor) / (24*3600*1000));
        if (diffDays > 0) cursor = addDays(cursor, Math.floor(diffDays / interval) * interval);
    } else if (recurrence.frequency === 'weekly') {
        const diffDays = Math.floor((windowStart - cursor) / (24*3600*1000));
        if (diffDays > 0) cursor = addWeeks(cursor, Math.floor(diffDays / (interval*7)) * interval);
    } else if (recurrence.frequency === 'monthly') {
        while (cursor < windowStart) cursor = addMonths(cursor, interval);
    } else if (recurrence.frequency === 'yearly') {
        while (cursor < windowStart) cursor = addYears(cursor, interval);
    }

    while (cursor <= windowEnd && (!seriesEnd || cursor <= seriesEnd)) {
        if (cursor >= windowStart && cursor <= windowEnd) yield normalizeStartOfDay(cursor);
        if (recurrence.frequency === 'daily') cursor = addDays(cursor, interval);
        else if (recurrence.frequency === 'weekly') cursor = addWeeks(cursor, interval);
        else if (recurrence.frequency === 'monthly') cursor = addMonths(cursor, interval);
        else if (recurrence.frequency === 'yearly') cursor = addYears(cursor, interval);
        else break;
    }
}

router.post('/create', auth, async (req, res) => {
    try {
        const {epic, status, parentsTitles, title, description, isEvent, dateStart, dateEnd, eisenhower} = req.body;
        const subTasks = Array.isArray(req.body.subTasks) ? req.body.subTasks : [];
        const recurrence = req.body.recurrence || undefined;
        const isTemplate = !!req.body.isTemplate;
        const parentId = req.body.parentId?.[0];
        const code = shortId.generate();

        const cleanSubTasks = subTasks.filter(st => st && typeof st.name === 'string' && st.name.trim().length > 0).map(subtask => {return { name: subtask.name, status: !!subtask.status }})
        const rec = recurrence?.frequency ? (() => {
            const freq = String(recurrence.frequency || '').toLowerCase();
            const allowed = ['daily','weekly','monthly','yearly','custom'];
            if (!allowed.includes(freq)) return undefined;
            const out = {
                frequency: freq,
                interval: Number.isFinite(+recurrence.interval) && +recurrence.interval > 0 ? +recurrence.interval : 1,
                startDate: recurrence.startDate || (dateStart || dateEnd),
            };
            if (recurrence.endDate) out.endDate = recurrence.endDate;
            return out;
        })() : undefined;
        const task = new Task({ code, epic, parentId, parentsTitles, status, title, description, isEvent,
            dateStart: dateStart ? new Date(dateStart) : undefined,
            dateEnd: dateEnd ? new Date(dateEnd) : undefined,
            eisenhower,
            subTasks: cleanSubTasks, owner: req.user.userId, isTemplate: !!rec || !!isTemplate, recurrence: rec });
        await task.save()
        res.status(201).json({ task, error: undefined })
    } catch(e) {
        console.error('Create task error:', e?.message, e);
        res.status(400).json({message: e?.message || 'Ошибка при создании задачи'})
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        const {_id, epic, status, parentsTitles, title, description, isEvent, isTemplate, dateStart, dateEnd, eisenhower, subTasks, recurrence} = req.body;
        const parentId = req.body.parentId?.[0];
        const existing = await Task.findById(_id);
        if (!existing) return res.status(404).json({ error: 'Задача не найдена' });

        // // Определяем цель обновления: экземпляр или серия
        // if (editScope === 'series' && existing.templateId) {
        //     // редактируем шаблон серии
        //     const task = await Task.findByIdAndUpdate(existing.templateId, { $set: {
        //         epic, parentId, status, parentsTitles, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks, recurrence
        //     } }, { new: true });
        //     return res.status(201).json({ task, error: undefined })
        // }

        // По умолчанию: обновляем сам документ (экземпляр или шаблон)
        const task = await Task.findByIdAndUpdate( _id, { epic, parentId, status, parentsTitles, title, description, isEvent, isTemplate, dateStart, dateEnd, eisenhower, subTasks, recurrence }, { new: true } );

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
        const today = new Date(), tomorrow = new Date(), month = new Date();
        today.setUTCHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);
        month.setMonth(month.getMonth() + 1);
        month.setUTCHours(23, 59, 59, 999);
        const periodEnd = month;
        const periodStart = today;

        var habits = await Task.find({ owner: req.user.userId, epic: 'Привычки' });
        for (const hab of habits) {
            if (hab.title.startsWith('Привычки_')) {
                console.log(hab.title, hab._id);
                await Task.findByIdAndDelete(hab._id);
            }
        }

        var tasks = await Task.find({ owner: req.user.userId });

        // 1) Сгенерировать недостающие экземпляры для шаблонов в окне периода
        const templates = await Task.find({ owner: req.user.userId, isTemplate: true });
        for (const tpl of templates) {
            const tplStart = tpl.recurrence?.startDate || tpl.dateStart || tpl.dateEnd || today;
            const baseStart = tpl.dateStart || tplStart;
            const baseEnd = tpl.dateEnd || tplStart;
            for (const occ of iterateOccurrences(tpl.recurrence, (tpl.epic === 'Привычки' ? today : periodStart), (tpl.epic === 'Привычки' ? tomorrow : periodEnd))) {
                const deltaMs = (new Date(baseEnd).getTime()) - (new Date(baseStart).getTime());
                const instStart = tpl.dateStart ? new Date(occ.getFullYear(), occ.getMonth(), occ.getDate(), new Date(baseStart).getHours(), new Date(baseStart).getMinutes(), 0, 0) : occ;
                const instEnd = tpl.dateStart ? new Date(instStart.getTime() + deltaMs) : occ;
                tasks.push({
                    owner: req.user.userId,
                    epic: tpl.epic,
                    parentId: tpl.parentId,
                    parentsTitles: tpl.parentsTitles,
                    status: false,
                    title: tpl.title,
                    description: tpl.description,
                    isEvent: tpl.isEvent,
                    dateStart: instStart,
                    dateEnd: instEnd,
                    eisenhower: tpl.eisenhower,
                    subTasks: tpl.subTasks,
                    templateId: tpl._id,
                    instanceDate: occ,
                });
            }
        }

        // 2) Вернуть задачи и экземпляры
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
        const task = await Task.findById(req.params.id);
        await Task.findByIdAndDelete(req.params.id);
        res.json({ task, message: 'Задача удалена' });
    } catch (e) { res.status(500).json({ message: 'Ошибка при удалении задачи' }) }
});

module.exports = router;
