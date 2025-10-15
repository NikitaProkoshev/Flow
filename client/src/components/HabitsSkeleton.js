import React from 'react';
import { Skeleton, IconButton } from '@chakra-ui/react';
import { FaChevronLeft } from 'react-icons/fa6';

export const HabitsSkeleton = () => {
    const skeletonHabits = Array.from({ length: 6 }, (_, index) => index);

    return (
        <div className="habitsPage my-4 rounded-2xl bg-[rgba(22,22,22,0.5)]">
            <div className="backHabits flex flex-row">
                <div className="backHabitsInfo flex flex-col items-center my-4">
                    <IconButton variant="ghost" minW={7} h={7} colorPalette='gray' mx={2} disabled><FaChevronLeft className="text-2xl text-[#e0e0e0]" /></IconButton>
                    {skeletonHabits.map((_, index) => (<Skeleton key={`back-${index}`} w={5} h={5} borderRadius="md" mt='0.875rem' mb='0.125rem'/>))}
                </div>
                <div className="frontHabits w-full p-4 bg-[#161616] rounded-2xl">
                    <Skeleton height="1.75rem" width="15rem" mb={3} borderRadius="md"/>
                    <div className="habitsSubTasksBlock grid grid-rows-auto gap-3 mt-3">
                        {skeletonHabits.map((_, index) => (<div key={`front-${index}`} className="subTask w-full h-6">
                            <div className="flex items-center gap-4">
                                <Skeleton w={5} h={5} borderRadius="md"/>
                                <Skeleton height={6} width={['75%', '85%', '65%', '90%', '70%', '80%'][index]} borderRadius="md"/>
                            </div>
                        </div>))}
                    </div>
                </div>
            </div>
        </div>
    );
};
