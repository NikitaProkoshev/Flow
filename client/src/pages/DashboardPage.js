import React, { useState, useMemo } from 'react';
import { Tabs, Card, Badge, Progress, Stat, Grid, Text, Box, Flex, Heading } from "@chakra-ui/react";
import { dateToString } from '../methods';
import { useTasks } from '../context/TasksContext';

// Утилиты для расчета статистики
const calculateProductivity = (tasks) => {
    if (!tasks || tasks.length === 0) return { percentage: 0, completed: 0, total: 0 };
    const completed = tasks.filter(task => task.status).length;
    const total = tasks.length;
    return {
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        total
    };
};

const calculateEisenhowerDistribution = (tasks) => {
    if (!tasks || tasks.length === 0) return { A: 0, B: 0, C: 0, D: 0 };
    return tasks.reduce((acc, task) => {
        if (task.eisenhower) {
            acc[task.eisenhower] = (acc[task.eisenhower] || 0) + 1;
        }
        return acc;
    }, { A: 0, B: 0, C: 0, D: 0 });
};

const calculateEpicDistribution = (tasks) => {
    if (!tasks || tasks.length === 0) return {};
    return tasks.reduce((acc, task) => {
        if (task.epic) {
            acc[task.epic] = (acc[task.epic] || 0) + 1;
        }
        return acc;
    }, {});
};

const calculateHabitStats = (habits) => {
    if (!habits || habits.length === 0) return { total: 0, completed: 0, percentage: 0, streaks: {} };
    
    const completed = habits.filter(habit => habit.status).length;
    const total = habits.length;
    
    // Простой расчет streak (серия дней подряд)
    const streaks = {};
    habits.forEach(habit => {
        if (!streaks[habit.title]) {
            streaks[habit.title] = habit.status ? 1 : 0;
        }
    });
    
    return {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        streaks
    };
};

const calculateSubTaskStats = (tasks) => {
    if (!tasks || tasks.length === 0) return { total: 0, completed: 0, percentage: 0, avgPerTask: 0 };
    
    let totalSubTasks = 0;
    let completedSubTasks = 0;
    let tasksWithSubTasks = 0;
    
    tasks.forEach(task => {
        if (task.subTasks && task.subTasks.length > 0) {
            tasksWithSubTasks++;
            totalSubTasks += task.subTasks.length;
            completedSubTasks += task.subTasks.filter(sub => sub.status).length;
        }
    });
    
    return {
        total: totalSubTasks,
        completed: completedSubTasks,
        percentage: totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0,
        avgPerTask: tasksWithSubTasks > 0 ? Math.round(totalSubTasks / tasksWithSubTasks * 10) / 10 : 0
    };
};

const calculateTrend = (allTasks, period) => {
    const now = new Date();
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 1;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    
    const trendData = [];
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = dateToString(date);
        
        const dayTasks = allTasks.filter(task => 
            !task.isTemplate && 
            task.createDate && 
            dateToString(new Date(task.createDate)) === dateStr
        );
        
        const completed = dayTasks.filter(task => task.status).length;
        const total = dayTasks.length;
        
        trendData.push({
            date: dateStr,
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        });
    }
    
    return trendData;
};

// Компоненты для отображения статистики
const ProductivityWidget = ({ tasks, title }) => {
    const stats = calculateProductivity(tasks);
    
    return (
        <Card.Root p={4} bg="gray.800" borderWidth="1px" borderColor="gray.700">
            <Card.Header p={0} mb={3}>
                <Flex align="center" gap={2}>
                    <Heading size="sm" color="white">{title}</Heading>
                </Flex>
            </Card.Header>
            <Card.Body p={0}>
                <Stat.Root>
                    <Stat.ValueText fontSize="2xl" color="white" mb={2}>
                        {stats.percentage}%
                    </Stat.ValueText>
                    <Text color="gray.400" fontSize="sm" mb={3}>
                        {stats.completed} из {stats.total} задач
                    </Text>
                    <Progress.Root value={stats.percentage} colorPalette="blue" size="sm" />
                </Stat.Root>
            </Card.Body>
        </Card.Root>
    );
};

const EisenhowerChart = ({ tasks }) => {
    const distribution = calculateEisenhowerDistribution(tasks);
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    const colors = { A: 'red', B: 'yellow', C: 'green', D: 'cyan' };
    const labels = { A: 'Важно и срочно', B: 'Важно, не срочно', C: 'Не важно, срочно', D: 'Не важно, не срочно' };
    
    return (
        <Card.Root p={4} bg="gray.800" borderWidth="1px" borderColor="gray.700">
            <Card.Header p={0} mb={4}>
                <Flex align="center" gap={2}>
                    <Heading size="sm" color="white">Распределение по приоритетам</Heading>
                </Flex>
            </Card.Header>
            <Card.Body p={0}>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    {Object.entries(distribution).map(([priority, count]) => (
                        <Box key={priority} p={3} bg="gray.700" rounded="md">
                            <Flex justify="space-between" align="center" mb={2}>
                                <Badge colorPalette={colors[priority]} variant="solid" size="sm">
                                    {priority}
                                </Badge>
                                <Text color="white" fontWeight="bold">{count}</Text>
                            </Flex>
                            <Text color="gray.400" fontSize="xs" mb={2}>
                                {labels[priority]}
                            </Text>
                            <Progress.Root 
                                value={total > 0 ? (count / total) * 100 : 0} 
                                colorPalette={colors[priority]} 
                                size="sm" 
                            />
                        </Box>
                    ))}
                </Grid>
            </Card.Body>
        </Card.Root>
    );
};

const EpicDistribution = ({ tasks }) => {
    const distribution = calculateEpicDistribution(tasks);
    const sortedEpics = Object.entries(distribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5); // Топ 5 эпиков
    
    return (
        <Card.Root p={4} bg="gray.800" borderWidth="1px" borderColor="gray.700">
            <Card.Header p={0} mb={4}>
                <Flex align="center" gap={2}>
                    <Heading size="sm" color="white">Задачи по категориям</Heading>
                </Flex>
            </Card.Header>
            <Card.Body p={0}>
                <Box spaceY={3}>
                    {sortedEpics.map(([epic, count]) => (
                        <Flex key={epic} justify="space-between" align="center" p={2} bg="gray.700" rounded="md">
                            <Text color="white" fontSize="sm">{epic}</Text>
                            <Badge colorPalette="green" variant="outline">{count}</Badge>
                        </Flex>
                    ))}
                </Box>
            </Card.Body>
        </Card.Root>
    );
};

const HabitStats = ({ habits }) => {
    const stats = calculateHabitStats(habits);
    
    return (
        <Card.Root p={4} bg="gray.800" borderWidth="1px" borderColor="gray.700">
            <Card.Header p={0} mb={4}>
                <Flex align="center" gap={2}>
                    <Heading size="sm" color="white">Статистика привычек</Heading>
                </Flex>
            </Card.Header>
            <Card.Body p={0}>
                <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
                    <Box textAlign="center">
                        <Text color="white" fontSize="2xl" fontWeight="bold">{stats.percentage}%</Text>
                        <Text color="gray.400" fontSize="sm">Выполнено</Text>
                    </Box>
                    <Box textAlign="center">
                        <Text color="white" fontSize="2xl" fontWeight="bold">{stats.completed}</Text>
                        <Text color="gray.400" fontSize="sm">из {stats.total}</Text>
                    </Box>
                </Grid>
                <Progress.Root value={stats.percentage} colorPalette="orange" size="md" />
            </Card.Body>
        </Card.Root>
    );
};

const SubTaskStats = ({ tasks }) => {
    const stats = calculateSubTaskStats(tasks);
    
    return (
        <Card.Root p={4} bg="gray.800" borderWidth="1px" borderColor="gray.700">
            <Card.Header p={0} mb={4}>
                <Flex align="center" gap={2}>
                    <Heading size="sm" color="white">Подзадачи</Heading>
                </Flex>
            </Card.Header>
            <Card.Body p={0}>
                <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
                    <Box textAlign="center">
                        <Text color="white" fontSize="2xl" fontWeight="bold">{stats.percentage}%</Text>
                        <Text color="gray-400" fontSize="sm">Выполнено</Text>
                    </Box>
                    <Box textAlign="center">
                        <Text color="white" fontSize="2xl" fontWeight="bold">{stats.avgPerTask}</Text>
                        <Text color="gray-400" fontSize="sm">среднее на задачу</Text>
                    </Box>
                </Grid>
                <Progress.Root value={stats.percentage} colorPalette="indigo" size="md" />
            </Card.Body>
        </Card.Root>
    );
};

const TrendChart = ({ allTasks, period }) => {
    const trendData = calculateTrend(allTasks, period);
    const avgProductivity = Math.round(
        trendData.reduce((sum, day) => sum + day.percentage, 0) / trendData.length
    );
    
    return (
        <Card.Root p={4} bg="gray-800" borderWidth="1px" borderColor="gray-700">
            <Card.Header p={0} mb={4}>
                <Flex align="center" gap={2}>
                    <Heading size="sm" color="white">Тренд продуктивности</Heading>
                </Flex>
            </Card.Header>
            <Card.Body p={0}>
                <Box mb={4}>
                    <Text color="white" fontSize="lg" fontWeight="bold">{avgProductivity}%</Text>
                    <Text color="gray-400" fontSize="sm">средняя продуктивность</Text>
                </Box>
                <Box h="100px" bg="gray-700" rounded="md" p={2}>
                    <Flex h="full" align="end" gap={1}>
                        {trendData.map((day, index) => (
                            <Box
                                key={index}
                                flex="1"
                                bg="emerald-400"
                                rounded="sm"
                                style={{
                                    height: `${Math.max(day.percentage, 5)}%`,
                                    opacity: 0.8
                                }}
                                title={`${day.date}: ${day.percentage}%`}
                            />
                        ))}
                    </Flex>
                </Box>
            </Card.Body>
        </Card.Root>
    );
};

export const DashboardPage = () => {
    const { allTasks } = useTasks();
    const [tab, setTab] = useState("today");
    
    const today = new Date();
    const week = new Date();
    const month = new Date();
    week.setDate(week.getDate() - 7);
    month.setMonth(month.getMonth() - 1);

    // Фильтрация задач по периодам
    const filteredTasks = useMemo(() => {
        const tasksCopy = JSON.parse(JSON.stringify(allTasks));
        const habits = tasksCopy.filter(task => 
            task.epic === 'Привычки' && 
            task.templateId && 
            [dateToString(today), dateToString(new Date(today.getTime() - 24*60*60*1000))].includes(task.instanceDate?.slice(0, 10))
        );
        const nonHabitTasks = tasksCopy.filter(task => task.epic !== 'Привычки' && !task.isTemplate);
        
        let periodTasks = [];
        switch(tab) {
            case 'today':
                periodTasks = nonHabitTasks.filter(task => 
                    [task.dateStart, task.dateEnd].includes(dateToString(today)) || 
                    (dateToString(task.dateStart) < dateToString(today) && dateToString(task.dateEnd) > dateToString(today))
                );
                break;
            case 'week':
                periodTasks = nonHabitTasks.filter(task => 
                    dateToString(task.dateStart) <= dateToString(today) && 
                    dateToString(task.dateEnd) >= dateToString(week)
                );
                break;
            case 'month':
                periodTasks = nonHabitTasks.filter(task => 
                    dateToString(task.dateStart) <= dateToString(today) && 
                    dateToString(task.dateEnd) >= dateToString(month)
                );
                break;
            default:
                periodTasks = nonHabitTasks;
        }
        
        return { habits, tasks: periodTasks };
    }, [allTasks, tab, today, week, month]);

    return (
        <div className='dashboard m-4'>
            <Tabs.Root 
                value={tab} 
                variant='line' 
                css={{'--tabs-trigger-radius': 'var(--chakra-radii-2xl)', '--bg-currentcolor': '#121213'}} 
                onValueChange={(e) => setTab(e.value)}
            >
                <Tabs.List mb={6}>
                    <Tabs.Trigger value="today">Сегодня</Tabs.Trigger>
                    <Tabs.Trigger value="week">Неделя</Tabs.Trigger>
                    <Tabs.Trigger value="month">Месяц</Tabs.Trigger>
                </Tabs.List>
                
                <Tabs.Content value="today">
                    <Box>
                        <Heading size="lg" color="white" mb={6}>Статистика за сегодня</Heading>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} mb={8}>
                            <ProductivityWidget 
                                tasks={filteredTasks.tasks} 
                                title="Продуктивность"
                            />
                            <HabitStats habits={filteredTasks.habits} />
                            <SubTaskStats tasks={filteredTasks.tasks} />
                        </Grid>
                        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                            <EisenhowerChart tasks={filteredTasks.tasks} />
                            <EpicDistribution tasks={filteredTasks.tasks} />
                        </Grid>
                    </Box>
                </Tabs.Content>
                
                <Tabs.Content value="week">
                    <Box>
                        <Heading size="lg" color="white" mb={6}>Статистика за неделю</Heading>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} mb={8}>
                            <ProductivityWidget 
                                tasks={filteredTasks.tasks} 
                                title="Продуктивность"
                            />
                            <HabitStats habits={filteredTasks.habits} />
                            <SubTaskStats tasks={filteredTasks.tasks} />
                        </Grid>
                        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6} mb={6}>
                            <EisenhowerChart tasks={filteredTasks.tasks} />
                            <EpicDistribution tasks={filteredTasks.tasks} />
                        </Grid>
                        <TrendChart allTasks={allTasks} period="week" />
                    </Box>
                </Tabs.Content>
                
                <Tabs.Content value="month">
                    <Box>
                        <Heading size="lg" color="white" mb={6}>Статистика за месяц</Heading>
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} mb={8}>
                            <ProductivityWidget 
                                tasks={filteredTasks.tasks} 
                                title="Продуктивность"
                            />
                            <HabitStats habits={filteredTasks.habits} />
                            <SubTaskStats tasks={filteredTasks.tasks} />
                        </Grid>
                        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6} mb={6}>
                            <EisenhowerChart tasks={filteredTasks.tasks} />
                            <EpicDistribution tasks={filteredTasks.tasks} />
                        </Grid>
                        <TrendChart allTasks={allTasks} period="month" />
                    </Box>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
};
