const {Router} = require('express');
// const config = require('config');
const Task = require('../models/task');
const auth = require('../middleware/auth.middleware');
const router = Router();
const shortId = require('shortid');
const shortid = require("shortid");

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
    // Fast-forward cursor to not iterate from far past
    if (recurrence.frequency === 'daily' || recurrence.frequency === 'custom') {
        const diffDays = Math.floor((windowStart - cursor) / (24*3600*1000));
        if (diffDays > 0) cursor = addDays(cursor, Math.floor(diffDays / interval) * interval);
    } else if (recurrence.frequency === 'weekly') {
        const diffDays = Math.floor((windowStart - cursor) / (24*3600*1000));
        if (diffDays > 0) cursor = addWeeks(cursor, Math.floor(diffDays / (interval*7)) * interval);
    } else if (recurrence.frequency === 'monthly') {
        // naive fast-forward by months
        while (cursor < windowStart) cursor = addMonths(cursor, interval);
    } else if (recurrence.frequency === 'yearly') {
        while (cursor < windowStart) cursor = addYears(cursor, interval);
    }

    while (cursor <= windowEnd && (!seriesEnd || cursor <= seriesEnd)) {
        if (recurrence.frequency === 'weekly' && Array.isArray(recurrence.byWeekDays) && recurrence.byWeekDays.length > 0) {
            // For weekly, emit all specified weekdays within each week bucket
            const weekStart = new Date(cursor);
            weekStart.setHours(0,0,0,0);
            for (const wd of recurrence.byWeekDays) {
                const occ = new Date(weekStart);
                const currentWd = occ.getDay();
                const delta = ((wd - currentWd) + 7) % 7;
                occ.setDate(occ.getDate() + delta);
                if (occ >= windowStart && occ <= windowEnd && (!seriesEnd || occ <= seriesEnd)) yield normalizeStartOfDay(occ);
            }
            cursor = addWeeks(weekStart, interval);
            continue;
        }

        if (recurrence.frequency === 'monthly' && Array.isArray(recurrence.byMonthDays) && recurrence.byMonthDays.length > 0) {
            const baseMonth = new Date(cursor);
            for (const md of recurrence.byMonthDays) {
                const occ = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), md, 0,0,0,0);
                if (occ >= windowStart && occ <= windowEnd && (!seriesEnd || occ <= seriesEnd)) yield normalizeStartOfDay(occ);
            }
            cursor = addMonths(baseMonth, interval);
            continue;
        }

        // Default: simple step
        if (cursor >= windowStart && cursor <= windowEnd) yield normalizeStartOfDay(cursor);
        if (recurrence.frequency === 'daily' || recurrence.frequency === 'custom') cursor = addDays(cursor, interval);
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

        const cleanSubTasks = subTasks
            .filter(st => st && typeof st.name === 'string' && st.name.trim().length > 0)
            .map(subtask => {return { name: subtask.name, status: !!subtask.status }})
        console.log(eisenhower);
        const existing = await Task.findOne({ title })
        console.log(existing);
        if (existing) { return res.json({ task: existing, error: 'Задача с таким названием уже существует!' }) }
        console.log("NEN?")
        const rec = recurrence?.frequency ? (() => {
            const freq = String(recurrence.frequency || '').toLowerCase();
            const allowed = ['daily','weekly','monthly','yearly','custom'];
            if (!allowed.includes(freq)) return undefined;
            const out = {
                frequency: freq,
                interval: Number.isFinite(+recurrence.interval) && +recurrence.interval > 0 ? +recurrence.interval : 1,
                startDate: recurrence.startDate || (dateStart || dateEnd),
            };
            if (Array.isArray(recurrence.byWeekDays)) out.byWeekDays = recurrence.byWeekDays.map(n=> +n).filter(n=> Number.isInteger(n) && n>=0 && n<=6);
            if (Array.isArray(recurrence.byMonthDays)) out.byMonthDays = recurrence.byMonthDays.map(n=> +n).filter(n=> Number.isInteger(n) && n>=1 && n<=31);
            if (recurrence.endDate) out.endDate = recurrence.endDate;
            return out;
        })() : undefined;
        console.log("BKB NEN?")
        const task = new Task({ code, epic, parentId, parentsTitles, status, title, description, isEvent,
            dateStart: dateStart ? new Date(dateStart) : undefined,
            dateEnd: dateEnd ? new Date(dateEnd) : undefined,
            eisenhower,
            subTasks: cleanSubTasks, owner: req.user.userId, isTemplate: !!rec || !!isTemplate, recurrence: rec });
        console.log(task)
        await task.save()
        res.status(201).json({ task, error: undefined })
    } catch(e) {
        console.error('Create task error:', e?.message, e);
        res.status(400).json({message: e?.message || 'Ошибка при создании задачи'})
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        console.log(req.params.id);
        const {_id, epic, status, parentsTitles, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks, recurrence, editScope} = req.body;
        const parentId = req.body.parentId?.[0];
        const existing = await Task.findById(_id);
        if (!existing) return res.status(404).json({ error: 'Задача не найдена' });

        // Определяем цель обновления: экземпляр или серия
        if (editScope === 'series' && existing.templateId) {
            // редактируем шаблон серии
            const task = await Task.findByIdAndUpdate(existing.templateId, { $set: {
                epic, parentId, status, parentsTitles, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks, recurrence
            } }, { new: true });
            return res.status(201).json({ task, error: undefined })
        }

        // По умолчанию: обновляем сам документ (экземпляр или шаблон)
        const task = await Task.findByIdAndUpdate( _id, { $set: {
            epic, parentId, status, parentsTitles, title, description, isEvent, dateStart, dateEnd, eisenhower, subTasks, recurrence
        } }, { new: true } );

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
        const periodEnd = periods[period] || month;
        const periodStart = today;
        const periodFilter = period ? { $or: [{dateEnd: { $lt: periodEnd }}, {dateStart: { $lt: periodEnd }}] } : {};
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
        // 1) Сгенерировать недостающие экземпляры для шаблонов в окне периода
        const templates = await Task.find({ owner: req.user.userId, isTemplate: true });
        for (const tpl of templates) {
            const tplStart = tpl.recurrence?.startDate || tpl.dateStart || tpl.dateEnd || today;
            const baseStart = tpl.dateStart || tplStart;
            const baseEnd = tpl.dateEnd || tplStart;
            for (const occ of iterateOccurrences(tpl.recurrence, periodStart, periodEnd)) {
                const existingInstance = await Task.findOne({ owner: req.user.userId, templateId: tpl._id, instanceDate: occ });
                if (!existingInstance) {
                    const deltaMs = (new Date(baseEnd).getTime()) - (new Date(baseStart).getTime());
                    const instStart = tpl.dateStart ? new Date(occ.getFullYear(), occ.getMonth(), occ.getDate(), new Date(baseStart).getHours(), new Date(baseStart).getMinutes(), 0, 0) : occ;
                    const instEnd = tpl.dateStart ? new Date(instStart.getTime() + deltaMs) : occ;
                    await Task.create({
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
        }

        // 2) Вернуть задачи и экземпляры
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
