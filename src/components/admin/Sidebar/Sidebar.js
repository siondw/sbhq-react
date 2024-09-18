// Sidebar.js
import React from 'react';
import { HomeIcon, QuestionMarkCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ setCurrentScreen, currentScreen }) => {
  const menuItems = [
    { name: 'Overview', screen: 'overview', Icon: HomeIcon },
    { name: 'Questions', screen: 'questions', Icon: QuestionMarkCircleIcon },
    { name: 'Participants', screen: 'participants', Icon: UserGroupIcon },
  ];

  return (
    <div className="w-64 bg-gray-800">
      <div className="flex items-center justify-center h-20 shadow-md">
        <h1 className="text-3xl font-bold text-blue-500">Quiz Admin</h1>
      </div>
      <nav className="mt-5">
        {menuItems.map(({ name, screen, Icon }) => (
          <button
            key={name}
            onClick={() => setCurrentScreen(screen)}
            className={`flex items-center mt-4 py-2 px-6 w-full text-left ${
              currentScreen === screen ? 'bg-gray-700 bg-opacity-25 text-gray-100' : 'text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="mx-3">{name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
