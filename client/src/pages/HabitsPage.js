import { useTasks } from "../context/TasksContext.js";
import { Badge, Box } from "@chakra-ui/react";
import { formatRecurrenceFrequency } from "../methods";
import { FaRepeat } from "react-icons/fa6";

export const HabitsPage = () => {
    const { habitsTemplates } = useTasks();

    return (<div className='m-4'>
        <h2 className="gradient-font text-3xl">ХУЙ</h2>
        <Box w='50%'>
            {habitsTemplates.map((template) => (
                <div key={template._id} className="my-4 pb-[1px] bg-[#0e0e10] rounded-2xl">
                    <div className="flex items-center bg-[#131315] rounded-2xl">
                        <div className="flex flex-col items-start w-[calc(100%-3rem)] mx-2 my-4">
                            <div className="flex flex-row items-center h-auto break-all">
                                <h3 className="text-xl ml-3 text-[#e0e0e0]">{template.title}</h3>
                            </div>
                            <div className="flex flex-row items-center h-auto break-all mt-3 w-full text-md">
                                <p className="text-sm text-[#a0a0a0]">
                                    <Badge h={6} variant="outline" colorPalette="grey" mr={2} mt={2}><FaRepeat />{template.recurrence?.interval + ' ' + formatRecurrenceFrequency(template)}</Badge>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </Box>
    </div>)
}