import React from "react";
import { Card, Button, EmptyState, VStack, Skeleton, Badge } from "@chakra-ui/react";
import { epicToIcon, formatRecurrenceFrequency, formatRecurrenceTime, formatRecurrencePeriod } from "../methods";
import { CreateTask } from "./CreateTask.tsx";
import { FaListUl, FaRepeat } from "react-icons/fa6";
import { MdAccessTime, MdCalendarToday } from "react-icons/md";
import { useTasks } from "../context/TasksContext.js";

interface Template {
    _id: string;
    title: string;
    description?: string;
    epic: string;
    dateStart?: string | Date;
    dateEnd?: string | Date;
    recurrence?: {
        frequency?: string;
        interval?: number;
        byWeekDays?: number[];
        byMonthDays?: number[];
        startDate?: string | Date;
        endDate?: string | Date;
    };
}

interface TemplatesProps {
    templates: Template[];
}

export const Templates = ({ templates }: TemplatesProps) => {
    const { loading } = useTasks();

    if (loading) {
        return <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full p-4 items-start sm:px-8">
            {Array.from({ length: 16 }, (_, index) => (<Card.Root key={index} maxW="sm" display="flex" flexDirection="column" alignItems="flex-start" p={4} bg="#121213" borderRadius="2xl">
                <Card.Header p={0} w="full"><Skeleton height="24px" width="80%" mb={2} /><Skeleton height="16px" width="60%" /></Card.Header>
                <Card.Body w="full"><Skeleton height="14px" width="90%" mb={1} /><Skeleton height="14px" width="70%" /></Card.Body>
                <Card.Footer justifyContent="flex-end" w="full"><Skeleton height="32px" width="100px" /></Card.Footer>
            </Card.Root>))}
        </div>
    }    

    if (!templates || templates.length === 0) {
        return <EmptyState.Root size="lg" w="full"><EmptyState.Content>
            <EmptyState.Indicator><FaListUl size="2rem" color="#e0e0e0" /></EmptyState.Indicator>
            <VStack textAlign="center"><EmptyState.Title>Нет шаблонов</EmptyState.Title><EmptyState.Description>Создайте новый шаблон</EmptyState.Description></VStack>
        </EmptyState.Content></EmptyState.Root>
    }

    return (<div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full p-4 items-start sm:px-8">
        {templates.map((template) => (
            <Card.Root key={template._id} maxW="sm" display="flex" flexDirection="column" alignItems="flex-start" p={4}>
                <Card.Header p={0}>
                    <Card.Title display="flex" flexDirection="row" alignItems="center" wordBreak='break-word' h='auto' gap={3}>
                        {['МегаФон','РУДН','ФК_Краснодар','Flow'].includes(template.epic)
                            ? <img className="epicIcon size-6" src={`..\\img\\${epicToIcon[template.epic]}.png`} alt={template.epic} />
                            : epicToIcon[template.epic]
                        }
                        <h3 className="text-xl text-[#e0e0e0]">{template.title}</h3>
                    </Card.Title>
                    {template.description && <Card.Description display="flex" flexDirection="row" alignItems="center" wordBreak='break-word' h='auto' fontSize='lg' lineHeight='1.75rem' color='#c0c0c0'>
                        {template.description}</Card.Description>}
                </Card.Header>
                <Card.Body px={0} pt={1} pb={3}>
                    <p className="text-sm text-[#a0a0a0]">
                        <Badge h={6} variant="outline" colorPalette="grey" mr={2} mt={2}><MdCalendarToday />{formatRecurrencePeriod(template)}</Badge>
                        <Badge h={6} variant="outline" colorPalette="grey" mr={2} mt={2}><FaRepeat />{template.recurrence?.interval + ' ' + formatRecurrenceFrequency(template)}</Badge>
                        <Badge h={6} variant="outline" colorPalette="grey" mt={2}><MdAccessTime />{formatRecurrenceTime(template)}</Badge>
                    </p>
                </Card.Body>
                <Card.Footer justifyContent="flex-end" p={0} w="full">
                    <Button onClick={() => { CreateTask.open('a', { task: template as any }) }}>Редактировать</Button>
                </Card.Footer>
            </Card.Root>
        ))}
    </div>);
}