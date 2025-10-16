import { FaUser, FaUsers, FaHeart, FaPlane, FaArrowRight } from 'react-icons/fa';
import { toaster } from './components/ui/toaster';

export const getEisenhowerColor = {'A': 'red', 'B': 'yellow', 'C': 'green', 'D': 'cyan'}

// Функция для преобразования локального времени в UTC
export const toUTCString = (dateString, timeString) => {
    if (!dateString) return '';
    
    // Создаем дату в локальной временной зоне пользователя
    const localDateTime = timeString ? `${dateString}T${timeString}` : `${dateString}T00:00:00`;
    const localDate = new Date(localDateTime);
    
    // Возвращаем в формате ISO UTC
    return localDate.toISOString();
}

export const dateToString = (date) => {
    if (!date) return '';
    // Если дата в формате ISO (с Z), она уже в UTC и будет правильно отображена в локальной зоне
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

export async function checkingSome(task, request, token, updateTasks) {
    await request('/api/task/check/' + task._id, 'PUT', { _id: task._id, status: !task.status, subTasks: task.subTasks }, { Authorization: `Bearer ${token}` });
    toaster.create({
        description: 'Задача выполнена!',
        type: 'success',
        duration: 3000,
        action: {
            label: "Отменить",
            onClick: async () => {await request('/api/task/check/' + task._id, 'PUT', { _id: task._id, status: task.status, subTasks: task.subTasks }, { Authorization: `Bearer ${token}` }); updateTasks(true)},
          }
    })
    updateTasks(true);
}

export function formatDateDisplay(dateStart, dateEnd, startHasTime, endHasTime, fontSize, color) {
    const isToday = (date) =>  date.toDateString() === today.toDateString();
    const formatTime = (date) =>  date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });
    const formatDate = (date, showYear = false) => date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', ...(showYear && { year: 'numeric' }) });

    console.log(fontSize, color);

    if (!dateStart || dateStart?.getFullYear() === 1970) {
        return (<div className={`flex items-center space-x-2 text-[${color || '#a0a0a0'}]`}>
            <span className={`text-${fontSize || 'md'} font-medium`}> {isToday(dateEnd) ? 'Сегодня' : formatDate(dateEnd, dateEnd.getFullYear() !== today.getFullYear())} </span>
            {endHasTime && (
                <><span className={`text-[${color || '#a0a0a0'}]`}>•</span><span className={`text-${fontSize || 'md'}`}>{formatTime(dateEnd)}</span></>
            )}
        </div>)
    }

    const sameDay = dateStart.toDateString() === dateEnd.toDateString();
    return (
        <div className={`flex items-center space-x-2 text-[${color || '#a0a0a0'}]`}>
            <div className="flex items-center space-x-1">
                <span className={`text-${fontSize || 'md'} font-medium`}>{isToday(dateStart) ? 'Сегодня' : formatDate(dateStart, dateStart.getFullYear() !== today.getFullYear())}</span>
                {startHasTime && <><span className="text-gray-500">•</span><span className={`text-${fontSize || 'md'}`}>{formatTime(dateStart)}</span></>}
            </div>
            <FaArrowRight className={`text-[${color || '#a0a0a0'}] text-${fontSize || 'md'}`} />
            <div className="flex items-center space-x-1">
                {!sameDay && (<span className={`text-${fontSize || 'md'} font-medium`}>{isToday(dateEnd) ? 'Сегодня' : formatDate(dateEnd, dateEnd.getFullYear() !== today.getFullYear() )}</span>)}
                {endHasTime && (<>
                    {!sameDay && (
                        <span className={`text-[${color || '#a0a0a0'}]`}>•</span>
                    )}
                    <span className={`text-${fontSize || 'md'}`}>
                        {formatTime(dateEnd)}
                    </span>
                </>)}
            </div>
        </div>
    );
}

export function formatRecurrencePeriod(template) {
    const { recurrence } = template;
    
    if (!recurrence) return '';

    const isToday = (date) => date.toDateString() === today.toDateString();
    const formatDate = (date, showYear = false) => date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', ...(showYear && { year: 'numeric' }) });

    // Форматирование дат периода
    let periodString = '';
    if (recurrence.startDate && recurrence.endDate) {
        const startDate = new Date(recurrence.startDate);
        const endDate = new Date(recurrence.endDate);
        
        const startShowYear = startDate.getFullYear() !== today.getFullYear();
        const endShowYear = endDate.getFullYear() !== today.getFullYear();
        
        // Проверяем, находятся ли даты в одном месяце и годе
        const sameMonth = startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();
        
        if (sameMonth && !isToday(startDate) && !isToday(endDate)) {
            // Если даты в одном месяце, используем сокращенный формат
            const dayStart = startDate.getDate();
            const monthStr = startDate.toLocaleDateString('ru-RU', { month: 'short' });
            const yearStr = startShowYear ? ` ${startDate.getFullYear()}` : '';
            const dayEnd = endDate.getDate();
            
            periodString = `${dayStart} -> ${dayEnd} ${monthStr}${yearStr}`;
        } else {
            // Обычный формат для разных месяцев или если одна из дат "Сегодня"
            const startDateStr = isToday(startDate) ? 'Сегодня' : formatDate(startDate, startShowYear);
            const endDateStr = isToday(endDate) ? 'Сегодня' : formatDate(endDate, endShowYear);
            
            periodString = `${startDateStr} -> ${endDateStr}`;
        }
    }

    return periodString
}

export function formatRecurrenceFrequency(template) {
    const { recurrence } = template;
    const interval = recurrence.interval || 1;
    const frequency = recurrence.frequency;
    let frequencyString = '';
    
    switch (frequency) {
        case 'daily':
            frequencyString = interval === 1 ? 'день' : (interval < 5 ? 'дня' : 'дней');
            break;
        case 'weekly':
            frequencyString = interval === 1 ? 'неделю' : (interval < 5 ? 'недели' : 'недель');
            break;
        case 'monthly':
            frequencyString = interval === 1 ? 'месяц' : (interval < 5 ? 'месяца' : 'месяцев');
            break;
        case 'yearly':
            frequencyString = interval === 1 ? 'год' : (interval < 5 ? 'года' : 'лет');
            break;
        default:
            frequencyString = undefined;
    }

    return frequencyString
}

export function formatRecurrenceTime(template) {
    const { dateStart, dateEnd } = template;
    const formatTime = (date) => date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });

    let timeString = '';
    if (dateStart && dateEnd) {
        const startDate = new Date(dateStart);
        const endDate = new Date(dateEnd);
        
        const startHasTime = typeof dateStart === 'string' ? !dateStart.endsWith('T00:00:00.000Z') : false;
        const endHasTime = typeof dateEnd === 'string' ? !dateEnd.endsWith('T00:00:00.000Z') : false;
        
        if (startHasTime && endHasTime) {
            const startTime = formatTime(startDate);
            const endTime = formatTime(endDate);
            timeString = `${startTime} -> ${endTime}`;}
        else if (startHasTime) { timeString = `${formatTime(startDate)}`}
        else if (endHasTime) { timeString = `${formatTime(endDate)}`}
    }

    return timeString
}