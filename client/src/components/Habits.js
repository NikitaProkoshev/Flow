import React, { useState } from 'react';
import { dateToString } from '../methods';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { Checkbox, IconButton } from '@chakra-ui/react';
import { useTasks } from '../context/TasksContext';
import { HabitsSkeleton } from './HabitsSkeleton';
// import { useHttp } from '../hooks/http.hook';
// import { AuthContext } from '../context/AuthContext';

export const Habits = ({ habits }) => {
    const { loading } = useTasks();
    // const { request } = useHttp();
    // const { token } = useContext(AuthContext);
    const todayString = dateToString(new Date());
    const yesterdayString = dateToString(new Date().setDate(new Date().getDate() - 1));
    const [frontIsToday, setFrontIsToday] = useState(true);

    const todayHabits = habits.filter(habit => habit.instanceDate.slice(0, 10) === todayString);
    const yesterdayHabits = habits.filter(habit => habit.instanceDate.slice(0, 10) === yesterdayString);

    if (loading) return <HabitsSkeleton />;

    // async function checkingSubTask(e, task, subTask) {
    //     const { _id, status, subTasks } = task;
    //     let subTasksCopy = subTasks.slice(0);
    //     const newSubTasks = subTasksCopy.map( (sT) => (sT._id === subTask._id) ? { name: subTask.name, status: !subTask.status, _id: subTask._id } : sT );
    //     await request('/api/task/check/' + task._id, 'PUT', { _id: _id, status: status, subTasks: newSubTasks }, { Authorization: `Bearer ${token}` });
    // }

    {[0, undefined].includes(todayHabits?.length) && <div className="noHabitsMessage">Пока привычек нет</div>}


    const backHabitsInfo = ((habits) => (<div className="backHabitsInfo flex flex-col items-center my-4">
        <IconButton variant="ghost" minW={7} h={7} colorPalette='gray' mx={2} onClick={(e) => setFrontIsToday(!frontIsToday)}>
            {frontIsToday ? <FaChevronLeft className="text-2xl text-[#e0e0e0]" /> : <FaChevronRight className="text-2xl text-[#e0e0e0]" />}
        </IconButton>
        {habits && habits.map((habit) => (
            <Checkbox.Root w={5} h={6} size="md" spacing="1rem" variant='outline' colorPalette='green' disabled={true} defaultChecked={habit.status} mt={3}><Checkbox.HiddenInput /><Checkbox.Control w={5} h={5} /></Checkbox.Root>
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
                                <Checkbox.Root w='full' h={6} size="md" spacing="1rem" variant='outline' colorPalette='green' checked={habit.status}>
                                    <Checkbox.HiddenInput /><Checkbox.Control w={5} h={5} /><Checkbox.Label fontSize='md' fontWeight='400'>{habit.title}</Checkbox.Label>
                                </Checkbox.Root>
                            </div>
                        )}
                    </div>
                </div>
                {!frontIsToday && backHabitsInfo(todayHabits)}</div>
    </div>);
};
