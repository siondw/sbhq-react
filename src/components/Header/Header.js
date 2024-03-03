import React from 'react';
import styles from './Header.module.css'; // Assuming you moved the CSS to a separate file

const Header = () => (
    <header className={styles.header}>
        <div className={styles.icons}>
            <img
                className="trophy"
                loading="eager"
                alt="Trophy"
                src="../../assets/trophy.png" 
            />
            <div>Superbowl HQ</div>
        </div>
        <div className={styles.userName}>Siondw ▼</div>
    </header>
);

export default Header;