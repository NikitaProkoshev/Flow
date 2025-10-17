import { Templates } from "../components/Templates.tsx";
import { useTasks } from "../context/TasksContext.js";

export const TemplatesPage = () => {
    const { eventsTemplates, tasksTemplates } = useTasks();

    return (<div className='m-4'>
        <h2 className="gradient-font text-3xl">Повторяющиеся задачи</h2>
        <Templates templates={tasksTemplates} />
        <h2 className="gradient-font text-3xl">Повторяющиеся мероприятия</h2>
        <Templates templates={eventsTemplates} />
    </div>)
}