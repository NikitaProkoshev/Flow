export const dateToString = (date) => {
    return new Date(date).toLocaleDateString('en-ca', {"year": "numeric", "month": "numeric", "day": "numeric"})
}

export const todayString = new Date().toLocaleDateString('ru-RU');
const [day, month, year] = todayString.split('.');
var yesterday = new Date();
yesterday.setDate(new Date(`${year}-${month}-${day}`).getDate() - 1);
export const yesterdayString = yesterday.toLocaleDateString('ru-RU');