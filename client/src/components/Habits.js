import React, { useState, useContext } from 'react';
import { dateToString } from '../methods';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { IconButton } from '@chakra-ui/react';
import { useTasks } from '../context/TasksContext';
import { HabitsSkeleton } from './HabitsSkeleton';
import { Check } from './Check';


export const Habits = () => {
    const { habits, loading } = useTasks();
    const todayString = dateToString(new Date());
    const yesterdayString = dateToString(new Date().setDate(new Date().getDate() - 1));
    const [frontIsToday, setFrontIsToday] = useState(true);

    const todayHabits = habits.filter(habit => habit.instanceDate.slice(0, 10) === todayString);
    const yesterdayHabits = habits.filter(habit => habit.instanceDate.slice(0, 10) === yesterdayString);

    if (loading) return <HabitsSkeleton />;

    {[0, undefined].includes(todayHabits?.length) && <div className="noHabitsMessage">Пока привычек нет</div>}

    const backHabitsInfo = ((habits) => (<div className="backHabitsInfo flex flex-col items-center my-4">
        <IconButton variant="ghost" minW={7} h={7} colorPalette='gray' mx={2} onClick={(e) => setFrontIsToday(!frontIsToday)}>
            {frontIsToday ? <FaChevronLeft className="text-2xl text-[#e0e0e0]" /> : <FaChevronRight className="text-2xl text-[#e0e0e0]" />}
        </IconButton>
        {habits && habits.map((habit) => (
            <Check mt={3} disabled dChecked={habit.status} />
        ))}
    </div>))

    return ( <div className="habitsPage my-4 rounded-2xl bg-[#0e0e10]">
            <div className="backHabits flex flex-row">
                {frontIsToday && backHabitsInfo(yesterdayHabits)}
                <div className="frontHabits w-full p-4 bg-[#131315] rounded-2xl">
                    <h3 className="text-xl text-[#e0e0e0]">{frontIsToday ? 'Сегодня' : 'Вчера'}</h3>
                    <div className="habitsSubTasksBlock grid grid-rows-auto gap-3 mt-3">
                        {(frontIsToday ? todayHabits : yesterdayHabits).map((habit) => 
                            <div key={habit.id} className="subTask w-full h-6">
                                <Check rW='full' dCheked={habit.status} checked={habit.status} label={habit.title} onClick={{task: habit}} />
                            </div>
                        )}
                    </div>
                </div>
                {!frontIsToday && backHabitsInfo(todayHabits)}</div>
    </div>);
};
