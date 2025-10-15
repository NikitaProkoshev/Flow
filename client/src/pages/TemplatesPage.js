import { Templates } from "../components/Templates.tsx";
import { useTasks } from "../context/TasksContext.js";

export const TemplatesPage = () => {
    const { allTasks } = useTasks();

    var tasksCopy = JSON.parse(JSON.stringify(allTasks));
    tasksCopy = tasksCopy.filter(task => task.epic !== 'Привычки');
    const eventsTemplates = tasksCopy.filter(task => task.isEvent && task.isTemplate);
    tasksCopy = tasksCopy.filter(task => !task.isEvent);
    const tasksTemplates = tasksCopy.filter(task => task.isTemplate);

    return (<div className='m-4'>
        <h2 className="gradient-font text-3xl">Повторяющиеся задачи</h2>
        <Templates templates={tasksTemplates} />
        <h2 className="gradient-font text-3xl">Повторяющиеся мероприятия</h2>
        <Templates templates={eventsTemplates} />
    </div>)
}