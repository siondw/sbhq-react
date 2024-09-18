// Topbar.js
import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, CogIcon } from '@heroicons/react/24/outline';

const Topbar = () => {
  return (
    <header className="flex justify-between items-center py-4 px-6 bg-gray-800">
      <span className="text-2xl font-semibold text-white">NFL Sunday Night Football Quiz</span>
      <div className="flex items-center">
        <button className="flex mx-4 text-white hover:text-gray-200">
          <BellIcon className="h-6 w-6" />
        </button>
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600">
            <CogIcon className="w-5 h-5 mr-2" />
            Settings
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-gray-700 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-600 text-white' : 'text-gray-200'
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-600 text-white' : 'text-gray-200'
                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};

export default Topbar;
