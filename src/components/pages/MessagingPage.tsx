import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import React from 'react';

const MessagingPage = () => {
  return (
    <div className='flex flex-row w-full height-full'>
      <div className='flex flex-col w-96 shadow-lg'>
        <div className='flex justify-center align-middle px-9 h-20 border-b border-gray-100'>
          <div className='my-auto mr-auto'>Backtrace here</div>
        </div>

        <div className='flex flex-col flex-1 px-9 py-6'>
          <div className='flex flex-row justify-between align-middle mb-6'>
            <h1 className='text-4xl leading-10 font-semibold text-gray-700'>Messaging</h1>
            <button type="button" className='cursor-pointer' onClick={() => alert('not implemented')}>
              <Cog6ToothIcon className='w-6 h-6 text-gray-400 my-auto' />
            </button>
          </div>

          <div className='flex-1 bg-gray-400'>
            channels will go here
          </div>
        </div>
      </div>
      <div className='flex flex-1'>Other stuff</div>
    </div>
  );
};

export default MessagingPage;