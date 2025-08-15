import { FaUser, FaUsers, FaHeart } from 'react-icons/fa';

export const dateToString = (date) => {
    return new Date(date).toLocaleDateString('en-ca', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
};

export const today = new Date();
export const todayString = today.toLocaleDateString('ru-RU');
const [day, month, year] = todayString.split('.');
var yesterday = new Date();
yesterday.setDate(new Date(`${year}-${month}-${day}`).getDate() - 1);
export const yesterdayString = yesterday.toLocaleDateString('ru-RU');

export const epicToIcon = {
    МегаФон: 'megafon',
    РУДН: 'rudn',
    Личное: (
        <FaUser
            className="epicIcon text-2xl leading-6 min-w-6 min-h-6"
            id={'epicЛичноеIcon'}
        />
    ),
    Семья: (
        <FaUsers
            className="epicIcon text-2xl leading-6 min-w-6 min-h-6"
            id={'epicСемьяIcon'}
        />
    ),
    Уля: (
        <FaHeart
            className="epicIcon text-2xl leading-6 min-w-6 min-h-6"
            id={'epicУляIcon'}
        />
    ),
    ФК_Краснодар: 'FC_Krasnodar',
    Flow: 'F',
};

export const epicToColor = {
    '': 'rgba(224, 224, 224,',
    МегаФон: 'rgba(0, 185, 86,',
    РУДН: 'rgba(0, 121, 194,',
    Личное: 'rgba(149, 117, 205,',
    Семья: 'rgba(255, 241, 118,',
    Уля: 'rgba(240, 98, 146,',
    ФК_Краснодар: 'rgba(0,73,35,',
    Flow: 'rgba(0, 145, 227,',
};

export function upDownSubTask(e, subTasks, subTask, setSubTasks) {
    let subTasksCopy = subTasks.slice(0);
    const subTaskPos = subTasksCopy.indexOf(subTask);
    const newSubTaskPos = e.target.classList.contains('upIcon')
        ? subTaskPos - 1
        : subTaskPos + 1;
    [subTasksCopy[subTaskPos], subTasksCopy[newSubTaskPos]] = [
        subTasksCopy[newSubTaskPos],
        subTasksCopy[subTaskPos],
    ];
    setSubTasks(subTasksCopy);
}
