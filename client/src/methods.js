export const dateToString = (date) => {
    return new Date(date).toLocaleDateString('en-ca', {"year": "numeric", "month": "numeric", "day": "numeric"})
}

export const todayString = new Date().toLocaleDateString('ru-RU');
const [day, month, year] = todayString.split('.');
var yesterday = new Date();
yesterday.setDate(new Date(`${year}-${month}-${day}`).getDate() - 1);
export const yesterdayString = yesterday.toLocaleDateString('ru-RU');

export const epicToIcon = {"МегаФон": "megafon", "РУДН": "rudn", "Личное": "person_outline", "Семья": "people_outline", "Уля": "favorite_border", "ФК_Краснодар": "FC_Krasnodar"}
export const epicToColor = {"": "rgba(224, 224, 224,", "МегаФон": "rgba(0, 185, 86,", "РУДН": "rgba(0, 121, 194,", "Личное": "rgba(149, 117, 205,", "Семья": "rgba(255, 241, 118,", "Уля": "rgba(240, 98, 146,", "ФК_Краснодар": "rgba(0,73,35,"}