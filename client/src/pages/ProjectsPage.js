import { useTasks } from "../context/TasksContext";
import { TasksList } from "../components/TasksList";

export const ProjectsPage = () => {
    const { projects } = useTasks();
    return (<div className='m-4'>
        <h2 className="gradient-font text-3xl">Проекты</h2>
        <TasksList tasks={projects} />
    </div>)
}