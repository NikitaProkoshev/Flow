const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
    owner: {type: Types.ObjectId, ref: 'user'},
    epic: {type: String}, // EPIC задачи
    parentId: {type: Types.ObjectId, ref: "task"}, // ID родительской задачи
    parentsTitles: {type: String}, // Названия иерархии родительских задач
    status: {type: Boolean}, // Статус задачи (True=Выполнено, False=НЕ Выполнено)
    title: {type: String, required: true}, // Название задачи
    description: {type: String}, // Описание задачи
    isEvent: {type: Boolean}, // Тип задачи (True=Задача, False=Мероприятие)
    dateStart: {type: Date}, // Время начала задачи/мероприятия
    dateEnd: {type: Date}, // Дедлайн выполнения задачи/время конца мероприятия
    createDate: {type: Date, default: Date.now}, // Время и дата, когда создана задача
    eisenhower: {type: String}, // Разделение задач по важности (A/B/C/D)
    subTasks: [new Schema({
        name: {
            type: String,
            required: true
        },
        status: {
            type: Boolean,
        }
    }, { _id: true })]
})

module.exports = model('task', schema)