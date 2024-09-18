import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CogIcon, UsersIcon, QuestionMarkCircleIcon, ChartBarIcon, CheckCircleIcon } from '@heroicons/react/outline';
import styles from './Sidebar.module.css'; // Import scoped styles

const Sidebar = () => {
  const menuItems = [
    { name: 'Overview', path: '/admin/overview', icon: HomeIcon },
    { name: 'Contests', path: '/admin/contests', icon: ChartBarIcon },
    { name: 'Questions', path: '/admin/questions', icon: QuestionMarkCircleIcon },
    { name: 'Participants', path: '/admin/participants', icon: UsersIcon },
    { name: 'Submissions', path: '/admin/submissions', icon: CheckCircleIcon },
  ];

  return (
    <div className={styles.sidebar}>
      <nav className={styles.menu}>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `${styles['menu-item']} ${isActive ? styles.active : ''}`}
          >
            <item.icon className={styles.icon} />
            <span className={styles.label}>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
