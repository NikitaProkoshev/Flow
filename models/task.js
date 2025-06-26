const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
    owner: {type: Types.ObjectId, ref: 'user'},
    epic: {type: String}, // EPIC задачи
    status: {type: Boolean}, // Статус задачи (True=Выполнено, False=НЕ Выполнено)
    title: {type: String, required: true}, // Название задачи
    description: {type: String}, // Описание задачи
    isEpic: {type: Boolean}, // Уровень задачи (True=EPIC, False=Task)
    color: {type: String}, // ONLY EPIC Цвет задач данного EPIC'а
    isTask: {type: Boolean}, // Тип задачи (True=Задача, False=Мероприятие)
    dateStart: {type: Date}, // Время начала задачи/мероприятия
    dateEnd: {type: Date}, // Дедлайн выполнения задачи/время конца мероприятия
    createDate: {type: Date, default: Date.now}, // Время и дата, когда создана задача
    eisenhower: {type: String} // Разделение задач по важности (A/B/C/D)
})

module.exports = model('task', schema)