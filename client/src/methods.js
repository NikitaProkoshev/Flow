import { FaUser, FaUsers, FaHeart, FaPlane } from 'react-icons/fa';

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

export const epicToColor = {
    '': 'rgba(224, 224, 224,',
    МегаФон: 'rgba(0, 185, 86,',
    РУДН: 'rgba(0, 121, 194,',
    Личное: 'rgba(149, 117, 205,',
    Семья: 'rgba(255, 241, 118,',
    Уля: 'rgba(240, 98, 146,',
    Поездки: 'rgba(234, 88, 12,',
    ФК_Краснодар: 'rgba(0,73,35,',
    Flow: 'rgba(63, 204, 167,',
};

export const epicToIcon = {
    МегаФон: 'megafon',
    РУДН: 'rudn',
    Личное: <FaUser className="epicIcon text-2xl leading-6 min-w-6 min-h-6" id={'epicЛичноеIcon'} color={`${epicToColor['Личное']}1)`} />,
    Семья: <FaUsers className="epicIcon text-2xl leading-6 min-w-6 min-h-6" id={'epicСемьяIcon'} color={`${epicToColor['Семья']}1)`} />,
    Уля: <FaHeart className="epicIcon text-2xl leading-6 min-w-6 min-h-6" id={'epicУляIcon'} color={`${epicToColor['Уля']}1)`} />,
    Поездки: <FaPlane className="epicIcon text-2xl leading-6 min-w-6 min-h-6" id={'epicПоездкиIcon'} color={`${epicToColor['Поездки']}1)`} />,
    ФК_Краснодар: 'FC_Krasnodar',
    Flow: 'logo',
};

export function upDownSubTask(target, subTasks, subTask, setSubTasks) {
    let subTasksCopy = subTasks.slice(0);
    const subTaskPos = subTasksCopy.indexOf(subTask);
    const newSubTaskPos = target.classList.contains('upIcon') ? subTaskPos - 1 : subTaskPos + 1;
    [subTasksCopy[subTaskPos], subTasksCopy[newSubTaskPos]] = [subTasksCopy[newSubTaskPos],subTasksCopy[subTaskPos]];
    setSubTasks(subTasksCopy);
}

export async function checkingSome(e, task, checkingState, request, token) {
    console.log(task);
    const { _id, status, subTasks } = task;
    console.group(_id);
    checkingState(_id);
    await request(
        '/api/task/check/' + task._id,
        'PUT',
        { _id: _id, status: !status, subTasks: subTasks },
        { Authorization: `Bearer ${token}` }
    );
    checkingState('');
}
