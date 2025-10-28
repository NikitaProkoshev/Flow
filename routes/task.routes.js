const {Router} = require('express');
// const config = require('config');
const Task = require('../models/task');
const auth = require('../middleware/auth.middleware');
const router = Router();
const shortId = require('shortid');

function normalizeStartOfDay(date) {
    const d = new Date(date);
    // Устанавливаем время в UTC, чтобы избежать проблем с временными зонами
    d.setUTCHours(0,0,0,0);
    return d;
}

function addDays(date, days) { 
    const d = new Date(date); 
    d.setUTCDate(d.getUTCDate() + days); 
    return d; 
}
function addWeeks(date, weeks) { 
    return addDays(date, weeks * 7); 
}
function addMonths(date, months) { 
    const d = new Date(date); 
    d.setUTCMonth(d.getUTCMonth() + months); 
    return d; 
}
function addYears(date, years) { 
    const d = new Date(date); 
    d.setUTCFullYear(d.getUTCFullYear() + years); 
    return d; 
}

function* iterateOccurrences(recurrence, from, to) {
    if (!recurrence || !recurrence.frequency) return;
    const interval = Math.max(1, recurrence.interval || 1);
    const seriesStart = recurrence.startDate ? new Date(recurrence.startDate) : from;
    const seriesEnd = recurrence.endDate ? new Date(recurrence.endDate) : null;
    const windowStart = new Date(from);
    const windowEnd = new Date(to);

    // Нормализуем все даты к началу дня в UTC
    let cursor = normalizeStartOfDay(seriesStart);
    const normalizedWindowStart = normalizeStartOfDay(windowStart);
    const normalizedWindowEnd = normalizeStartOfDay(windowEnd);
    const normalizedSeriesEnd = seriesEnd ? normalizeStartOfDay(seriesEnd) : null;

    if (recurrence.frequency === 'daily') {
        const diffDays = Math.floor((normalizedWindowStart - cursor) / (24*3600*1000));
        if (diffDays > 0) cursor = addDays(cursor, Math.floor(diffDays / interval) * interval);
    } else if (recurrence.frequency === 'weekly') {
        const diffDays = Math.floor((normalizedWindowStart - cursor) / (24*3600*1000));
        if (diffDays > 0) cursor = addWeeks(cursor, Math.floor(diffDays / (interval*7)) * interval);
    } else if (recurrence.frequency === 'monthly') {
        while (cursor < normalizedWindowStart) cursor = addMonths(cursor, interval);
    } else if (recurrence.frequency === 'yearly') {
        while (cursor < normalizedWindowStart) cursor = addYears(cursor, interval);
    }

    while (cursor <= normalizedWindowEnd && (!normalizedSeriesEnd || cursor <= normalizedSeriesEnd)) {
        if (cursor >= normalizedWindowStart && cursor <= normalizedWindowEnd) yield cursor;
        if (recurrence.frequency === 'daily') cursor = addDays(cursor, interval);
        else if (recurrence.frequency === 'weekly') cursor = addWeeks(cursor, interval);
        else if (recurrence.frequency === 'monthly') cursor = addMonths(cursor, interval);
        else if (recurrence.frequency === 'yearly') cursor = addYears(cursor, interval);
        else break;
    }
}

router.post('/create', auth, async (req, res) => {
    try {
        const {epic, status, parentsTitles, title, shortTitle, description, isEvent, dateStart, dateEnd, eisenhower, isProject, parentId} = req.body;
        const subTasks = Array.isArray(req.body.subTasks) ? req.body.subTasks : [];
        const recurrence = req.body.recurrence || undefined;
        const isTemplate = !!req.body.isTemplate;
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
        const task = new Task({ code, epic, parentId, parentsTitles, status, title, shortTitle, description, isEvent, isProject,
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
        const {_id, epic, status, parentsTitles, title, shortTitle, description, isEvent, isTemplate, dateStart, dateEnd, eisenhower, subTasks, recurrence, isProject, parentId} = req.body;
        const existing = await Task.findById(_id);
        if (!existing) return res.status(404).json({ error: 'Задача не найдена' });

        subTasks?.forEach(obj => delete obj._id);
        const task = await Task.findByIdAndUpdate( _id, { epic, parentId, status, parentsTitles, title, shortTitle, description, isEvent, isTemplate, dateStart, dateEnd, eisenhower, subTasks, recurrence, isProject }, { new: true } );

        res.status(201).json({ task, error: undefined })
    } catch (err) { res.status(500).json({ error: err.message }) }
});

router.put('/updateInstance/:id', async (req, res) => {
    try {
        const instance = req.body;
        const instanceId = instance._id.slice(instance._id.length - 10);
        const _id = instance._id.slice(0, instance._id.length - 11);
        delete instance._id;
        
        const template = await Task.findById(_id);
        if (!template) return res.status(404).json({ error: 'Шаблон повторяющейся задачи не найден' });

        var changedInstances = {};
        changedInstances[instanceId] = {};
        
        for (const key of Object.keys(instance)) {
            if (['isTemplate', 'shortTitle', 'recurrence', 'epic', 'parentId'].includes(key)) continue;
            if (key === 'subTasks') {
                const instanceSubTasks = instance[key]?.map(st => ({ name: st.name, status: st.status })) || [];
                const templateSubTasks = template[key]?.map(st => ({ name: st.name, status: st.status })) || [];

                if (JSON.stringify(instanceSubTasks) !== JSON.stringify(templateSubTasks)) {
                    changedInstances[instanceId][key] = instanceSubTasks;
                }
            } else if (key === 'dateStart' || key === 'dateEnd') {
                // Специальная обработка для дат - сравниваем как строки ISO
                const instanceDate = instance[key] ? new Date(instance[key]).toISOString() : null;
                const templateDate = template[key] ? new Date(template[key]).toISOString() : null;
                
                if (instanceDate !== templateDate) {
                    changedInstances[instanceId][key] = instance[key];
                }
            } else if (JSON.stringify(instance[key]) !== JSON.stringify(template[key])) {
                changedInstances[instanceId][key] = instance[key];
            }
        }
        
        if (Object.keys(changedInstances[instanceId]).length > 0) await Task.findByIdAndUpdate(_id, { $set: { [`changedInstances.${instanceId}`]: changedInstances[instanceId] } });
        res.status(201).json({})
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/check/:id', async (req, res) => {
    try {
        const {_id, status, subTasks} = req.body;
        if (typeof status === 'boolean') {await Task.findByIdAndUpdate( _id, { status: status, checkDate: new Date() })}
        else if (subTasks) {await Task.findByIdAndUpdate( _id, {subTasks: subTasks })}
        else {
            const checkingTask = await Task.findOne({ _id: _id.slice(0, _id.length - 11) })
            const { doneInstances: dones } = checkingTask;
            const newDoneInstances = (dones.filter(inst => inst === _id.slice(_id.length - 10))?.[0] ? dones.filter(inst => inst !== _id.slice(_id.length - 10)) : [...dones, _id.slice(_id.length - 10)]);
            await Task.findByIdAndUpdate( _id.slice(0, _id.length - 11), { doneInstances: newDoneInstances });
        }
        res.status(201).json({})
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/', auth, async (req, res) => {
    try {
        const yesterday = new Date(), today = new Date(), month = new Date(), minusMonth = new Date();
        today.setUTCHours(0, 0, 0, 0);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setUTCHours(0, 0, 0, 0);
        month.setMonth(month.getMonth() + 1);
        month.setUTCHours(23, 59, 59, 999);
        minusMonth.setMonth(minusMonth.getMonth() - 1);
        minusMonth.setUTCHours(0, 0, 0, 0);
        const periodEnd = month;
        const periodStart = minusMonth;

        var tasks = await Task.find({ owner: req.user.userId });

        // 1) Сгенерировать недостающие экземпляры для шаблонов в окне периода
        const templates = await Task.find({ owner: req.user.userId, isTemplate: true });
        for (const tpl of templates) {
            const tplStart = tpl.recurrence?.startDate || tpl.dateStart || tpl.dateEnd || today;
            const baseStart = tpl.dateStart || tplStart;
            const baseEnd = tpl.dateEnd || tplStart;
            for (const occ of iterateOccurrences(tpl.recurrence, (tpl.epic === 'Привычки' ? yesterday : periodStart), (tpl.epic === 'Привычки' ? today : periodEnd))) {
                const instDate = `${occ.getFullYear()}-${occ.getMonth()+1}-${occ.getDate()}`;

                if (tpl.deletedInstances?.includes(instDate)) continue;

                const instChanged = tpl.changedInstances.get(instDate);
                
                let instStart, instEnd;
                // Проверяем, есть ли изменения дат в changedInstances
                if (instChanged?.dateStart && instChanged?.dateEnd) {
                    // Если изменены и дата начала, и дата окончания
                    instStart = new Date(instChanged.dateStart);
                    instEnd = new Date(instChanged.dateEnd);
                } else if (instChanged?.dateStart) {
                    // Если изменена только дата начала - сохраняем время окончания из шаблона
                    instStart = new Date(instChanged.dateStart);
                    if (tpl.dateEnd) {
                        // Сохраняем время окончания из шаблона, но на дату экземпляра
                        const baseEndDate = new Date(baseEnd);
                        instEnd = new Date(occ.getFullYear(), occ.getMonth(), occ.getDate(), baseEndDate.getHours(), baseEndDate.getMinutes(), 0, 0);
                    } else {
                        instEnd = new Date(occ);
                    }
                } else if (instChanged?.dateEnd) {
                    // Если изменена только дата окончания - сохраняем время начала из шаблона
                    instEnd = new Date(instChanged.dateEnd);
                    if (tpl.dateStart) {
                        // Сохраняем время начала из шаблона, но на дату экземпляра
                        const baseStartDate = new Date(baseStart);
                        instStart = new Date(occ.getFullYear(), occ.getMonth(), occ.getDate(), baseStartDate.getHours(), baseStartDate.getMinutes(), 0, 0);
                    } else {
                        instStart = new Date(occ);
                    }
                } else if (tpl.dateStart) {
                    // Стандартная логика для шаблона с датой начала
                    const deltaMs = (new Date(baseEnd).getTime()) - (new Date(baseStart).getTime());
                    const baseStartDate = new Date(baseStart);
                    instStart = new Date(occ.getFullYear(), occ.getMonth(), occ.getDate(), baseStartDate.getHours(), baseStartDate.getMinutes(), 0, 0);
                    instEnd = new Date(instStart.getTime() + deltaMs);
                } else {
                    // Стандартная логика для шаблона без даты начала
                    instStart = new Date(occ);
                    instEnd = new Date(occ);
                }

                tasks.push({
                    _id: `${tpl._id}_${instDate}`,
                    owner: req.user.userId,
                    epic: instChanged?.epic || tpl.epic,
                    parentId: tpl.parentId,
                    parentsTitles: tpl.parentsTitles,
                    status: !!tpl.doneInstances.filter(instance => instance === instDate)?.[0],
                    title: instChanged?.title || tpl.title,
                    description: instChanged?.description || tpl.description,
                    isEvent: instChanged?.isEvent || tpl.isEvent,
                    dateStart: instStart,
                    dateEnd: instEnd,
                    eisenhower: instChanged?.eisenhower || tpl.eisenhower,
                    subTasks: instChanged?.subTasks || tpl.subTasks,
                    templateId: tpl._id,
                    instanceDate: occ,
                });
            }
        }

        // 2) Вернуть задачи и экземпляры
        res.json(tasks);
    } catch(e) { res.status(500).json({message: 'При загрузке задач на сервере возникла ошибка (Error: Разраб еблан...)'}) }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        var task;
        if (req.params.id.includes('_')) {
            task = await Task.findById(req.params.id.slice(0, req.params.id.length - 11));
            const { deletedInstances: deletes } = task;
            const newDeletedInstances = (deletes.filter(inst => inst === req.params.id.slice(req.params.id.length - 10))?.[0] ? deletes.filter(inst => inst !== req.params.id.slice(req.params.id.length - 10)) : [...deletes, req.params.id.slice(req.params.id.length - 10)]);
            await Task.findByIdAndUpdate( task._id, { deletedInstances: newDeletedInstances });
        } else {
            task = await Task.findById(req.params.id);
            await Task.findByIdAndDelete(req.params.id);
        }
        res.json({ task, message: 'Задача удалена' });
    } catch (e) { res.status(500).json({ message: 'Ошибка при удалении задачи' }) }
});

module.exports = router;
