import React from 'react';
import { Skeleton } from '@chakra-ui/react';

export const TasksListSkeleton = () => {
    const taskConfigs = [{ hasParent: false, subTasks: 2 }, { hasParent: true, subTasks: 0 }, { hasParent: true, subTasks: 1 }];

    return (<div className='tasksList'>
        {Array.from({ length: 3 }, (_, index) => index).map((_, taskIndex) => {
            const config = taskConfigs[taskIndex];
            return (
                <div key={`task-${taskIndex}`} className="my-4 pb-[1px] bg-[#0f0f10] rounded-2xl">
                    <div className="flex items-center bg-[#121213] rounded-2xl">
                        <Skeleton w={6} h={6} ml={4} mr={2} borderRadius="md" />
                        <div className="flex flex-col items-start w-[calc(100%-3rem)] mx-2 my-4">
                            <div className="flex flex-row items-center h-auto break-all w-full">
                                <Skeleton w={6} h={6} borderRadius="md" />
                                {config.hasParent && <Skeleton h={6} ml={3} px={2} py={1} width={['30%', '5%', '10%'][taskIndex]} borderRadius="md" />}
                                <Skeleton height="24px" width={['40%', '70%', '30%'][taskIndex]} ml={3} borderRadius="md" />
                            </div>
                            <div className="flex flex-row items-center h-auto break-all mt-3 w-full text-md w-full">
                                <Skeleton w={6} h={6} mr={3} px={2} py={1} borderRadius="md" />
                                <Skeleton height="20px" width={['10%', '15%', '20%'][taskIndex]} borderRadius="md" />
                            </div>
                        </div>
                    </div>
                    {config.subTasks > 0 && <div className="my-3 ml-14">
                        {Array.from({ length: config.subTasks }, (_, subIndex) => (
                            <div key={`sub-${taskIndex}-${subIndex}`} className="my-3 flex flex-row items-center">
                                <Skeleton w={5} h={5} borderRadius="md" />
                                <Skeleton height="20px" width={['60%', '45%', '70%'][subIndex]} ml={3} borderRadius="md" />
                            </div>
                        ))}
                    </div>}
                </div>
            );
        })}
    </div>);
};
