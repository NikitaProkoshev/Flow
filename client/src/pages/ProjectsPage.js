import { useTasks } from "../context/TasksContext";
import { createTreeCollection } from "@chakra-ui/react";
import { TreeView } from "@chakra-ui/react";
import { CreateTask } from "../components/CreateTask.tsx";
import { epicToIcon, getEisenhowerColor, formatDateDisplay } from "../methods";
import { Badge } from "@chakra-ui/react";
import { BsFolder, BsFolderFill } from "react-icons/bs";

export const ProjectsPage = () => {
    const { projects } = useTasks();

    function getParents(parentId) {
        const parentsTitles = [];
        while (parentId) {
            const parentTask = projects.filter(task => task._id === parentId)[0];
            parentsTitles.push(parentTask?._id);
            parentId = parentTask?.parentId;
        }
        return parentsTitles;
    }

    var projectsSorted = projects.sort((a, b) => getParents(b.parentId).length - getParents(a.parentId).length);

    const defaultExpandedValues = [];

    var projectsTreeView = JSON.parse(JSON.stringify(projectsSorted));
    var treeView = [];
    projectsTreeView.forEach(project => {
        const newObject = { id: project._id, name: project.title, shortName: project.shortTitle, epic: project.epic, eisenhower: project.eisenhower, dateStart: project.dateStart, dateEnd: project.dateEnd, parentId: project.parentId, children: [] }
        treeView.filter(child => child.parentId && child.parentId === project._id)?.map(child => {newObject.children.push(child); treeView = treeView.filter(aboba => aboba.id !== child.id)});
        if (newObject.children.length > 0) defaultExpandedValues.push(newObject.name);
        treeView.push(newObject);
    })

    console.log(defaultExpandedValues);

    const collection = createTreeCollection({
        nodeToValue: (node) => node.id,
        nodeToString: (node) => node.name,
        rootNode: {
            id: "ROOT",
            name: "",
            children: treeView,
        }
    })

    return (<div className='m-4'>
        <TreeView.Root collection={collection} size='xl' expandOnClick={false} defaultExpandedValue={defaultExpandedValues} style={{'--tree-icon-size': '1.5rem'}}>
            <TreeView.Label><h2 className="gradient-font text-3xl">Проекты</h2></TreeView.Label>
            <TreeView.Tree>
                <TreeView.Node indentGuide={<TreeView.BranchIndentGuide/>} branchContentProps={{ml: 10}} render={({ node, nodeState }) => 
                    nodeState.isBranch ? (
                        <TreeView.BranchControl borderRadius='2xl' ml={3}>
                            {console.log(node.name, getParents(node.id).length)}
                            <TreeView.BranchTrigger ml={4}>
                                {nodeState.expanded ? <BsFolder className='w-6 h-6' /> : <BsFolderFill className='w-6 h-6' />}
                            </TreeView.BranchTrigger>
                            <TreeView.BranchText>
                                <div className="flex flex-col items-start w-[calc(100%-3rem)] mx-2 my-4" onClick={() => { CreateTask.open('a', { task: projects.find(project => project._id === node.id) }) }}>
                                    <div className="flex flex-row items-center h-auto break-all">
                                        {['МегаФон','РУДН','ФК_Краснодар','Flow'].includes(node.epic) ? <img className="size-6" src={`..\\img\\${epicToIcon[node.epic]}.png`} alt={node.epic} /> : epicToIcon[node.epic]}
                                        <h3 className="text-xl ml-3 text-[#e0e0e0]">{node.name + (node.shortName ? ` [${node.shortName}]` : '')}</h3>
                                    </div>
                                    <div className="flex flex-row items-center h-auto break-all mt-3 w-full text-md">
                                        <Badge w={6} h={6} mr={3} px={2} py={1} rounded='md' textAlign='center' fontSize='xs' lineHeight='1' variant='subtle' colorPalette={getEisenhowerColor[node.eisenhower]}>{node.eisenhower}</Badge>
                                        {formatDateDisplay(node.dateStart ? new Date(node.dateStart) : undefined,new Date(node.dateEnd),
                                            typeof node.dateStart === 'string' ? !node.dateStart.endsWith('T21:00:00.000Z') : false,
                                            typeof node.dateEnd === 'string' ? !node.dateEnd.endsWith('T21:00:00.000Z') : false)}
                                    </div>
                                </div>
                            </TreeView.BranchText>
                        </TreeView.BranchControl>
                    ) : (
                        <TreeView.Item borderRadius='2xl' ml={3}>
                            <BsFolder className='ml-4'/>
                            <TreeView.ItemText>
                                <div className="flex flex-col items-start w-[calc(100%-3rem)] mx-2 my-4" onClick={() => { CreateTask.open('a', { task: projects.find(project => project._id === node.id) }) }}>
                                    <div className="flex flex-row items-center h-auto break-all">
                                        {['МегаФон','РУДН','ФК_Краснодар','Flow'].includes(node.epic) ? <img className="size-6" src={`..\\img\\${epicToIcon[node.epic]}.png`} alt={node.epic} /> : epicToIcon[node.epic]}
                                        <h3 className="text-xl ml-3 text-[#e0e0e0]">{node.name}</h3>
                                    </div>
                                    <div className="flex flex-row items-center h-auto break-all mt-3 w-full text-md">
                                        <Badge w={6} h={6} mr={3} px={2} py={1} rounded='md' textAlign='center' fontSize='xs' lineHeight='1' variant='subtle' colorPalette={getEisenhowerColor[node.eisenhower]}>{node.eisenhower}</Badge>
                                        {formatDateDisplay(node.dateStart ? new Date(node.dateStart) : undefined,new Date(node.dateEnd),
                                            typeof node.dateStart === 'string' ? !node.dateStart.endsWith('T21:00:00.000Z') : false,
                                            typeof node.dateEnd === 'string' ? !node.dateEnd.endsWith('T21:00:00.000Z') : false)}
                                    </div>
                                </div>
                            </TreeView.ItemText>
                        </TreeView.Item>
                    )
                } />
            </TreeView.Tree>
          </TreeView.Root>
    </div>)
}