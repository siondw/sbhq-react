import React from "react";
import Header from "../../components/Header/Header";
import MainText from "../../components/MainText/MainText";
import styles from "./EliminatedScreen.module.css";

function EliminatedScreen() {
  const gradientStyle = "linear-gradient(167deg, #710117 29.79%, #54627B 90.89%)"; // Example gradient

return (
    <div className={styles.eliminatedScreen}>
        <Header />
        <div className={styles.content}>
            <div className={styles.textWithIcon}>
                <span className={styles.eliminatedText}>Eliminated</span>
                <span className={styles.xIcon}>❌</span> {/* Added x emoji */}
            </div>
            <MainText
                header=""
                subheader="Thanks for playing!"
                gradient={gradientStyle}
            />
        </div>
    </div>
);
}

export default EliminatedScreen;
