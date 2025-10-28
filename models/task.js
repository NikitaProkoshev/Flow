const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
    owner: {type: Types.ObjectId, ref: 'user'},
    epic: {type: String}, // EPIC задачи
    parentId: {type: Types.ObjectId, ref: "task"}, // ID родительской задачи
    status: {type: Boolean}, // Статус задачи (True=Выполнено, False=НЕ Выполнено)
    title: {type: String, required: true}, // Название задачи
    shortTitle: {type: String}, // Короткое название задачи
    description: {type: String}, // Описание задачи
    isEvent: {type: Boolean}, // Тип задачи (True=Мероприятие, False=Задача)
    isProject: {type: Boolean}, // Тип задачи (True=Проект, False=Задача)
    dateStart: {type: Date}, // Время начала задачи/мероприятия
    dateEnd: {type: Date}, // Дедлайн выполнения задачи/время конца мероприятия
    createDate: {type: Date, default: Date.now}, // Время и дата, когда создана задача
    eisenhower: {type: String}, // Разделение задач по важности (A/B/C/D)
    subTasks: [new Schema({
        name: { type: String, required: true },
        status: { type: Boolean }
    }, { _id: true })],
    checkDate: { type: Date }, // дата последнего выполнения задачи

    // Поля для повторяющихся задач
    isTemplate: { type: Boolean, default: false }, // true для шаблонной задачи (серии)
    templateId: { type: Types.ObjectId, ref: 'task' }, // ссылка на шаблон (для экземпляров)
    instanceDate: { type: Date }, // дата экземпляра (нормализованная на начало дня)
    recurrence: { // расписание повторения (только для шаблонов)
        frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
        interval: { type: Number, default: 1 }, // каждые N единиц
        startDate: { type: Date }, // старт повторения (обычно = dateEnd или dateStart)
        endDate: { type: Date }, // дата окончания серии (опционально)
    },
    doneInstances: [{ type: String }], // даты выполненных экземпляров
    changedInstances: { 
        type: Map, 
        of: new Schema({
            subTasks: [{
                name: { type: String },
                status: { type: Boolean },
                _id: { type: Types.ObjectId },
            }],
            title: { type: String },
            description: { type: String },
            eisenhower: { type: String },
            dateStart: { type: Date },
            dateEnd: { type: Date },
            isEvent: { type: Boolean }
        }, { _id: false }),
        default: new Map()
    },
    deletedInstances: [{ type: String }],
})

module.exports = model('task', schema)