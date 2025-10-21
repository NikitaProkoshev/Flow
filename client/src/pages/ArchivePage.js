import { useTasks } from "../context/TasksContext";
import { TasksList } from "../components/TasksList";

export const ArchivePage = () => {
    const { doneTasks } = useTasks();
    return (<div className='m-4'>
        <h2 className="gradient-font text-3xl">Выполненные задачи</h2>
        <TasksList tasks={doneTasks} mode='done' />
    </div>)
}