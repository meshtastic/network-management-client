import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import NavigationBacktrace from '@components/NavigationBacktrace';
import ChannelListElement from '@components/Messaging/ChannelListElement';
import { selectDeviceChannels } from '@features/device/deviceSelectors';

const MessagingPage = () => {
  const channels = useSelector(selectDeviceChannels());
  const [activeChannel, setActiveChannel] = useState<number | null>(null);

  return (
    <div className='flex flex-row w-full height-full'>
      <div className='flex flex-col w-96 shadow-lg'>
        <div className='flex justify-center align-middle px-9 h-20 border-b border-gray-100'>
          <NavigationBacktrace className='my-auto mr-auto' levels={["Messaging"]} />
        </div>

        <div className='flex flex-col flex-1 px-9 py-6'>
          <div className='flex flex-row justify-between align-middle mb-6'>
            <h1 className='text-4xl leading-10 font-semibold text-gray-700'>Messaging</h1>
            <button type="button" className='cursor-pointer' onClick={() => alert('not implemented')}>
              <Cog6ToothIcon className='w-6 h-6 text-gray-400 my-auto' />
            </button>
          </div>

          <div className='flex flex-col flex-1 gap-3'>
            {channels
              .filter(c => c.config.role !== 0) // * ignore DISABLED role
              .map(c => (
                <ChannelListElement
                  key={c.config.index}
                  setActiveChannel={setActiveChannel}
                  channel={c}
                  isSelected={c.config.index === activeChannel}
                />
              ))}
          </div>
        </div>
      </div>
      <div className='flex flex-1'>Other stuff</div>
    </div>
  );
};

export default MessagingPage;