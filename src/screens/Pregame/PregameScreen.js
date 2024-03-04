import MainText from "../../components/MainText/MainText";
import Header from "../../components/Header/Header";

import pregameGif from "../../assets/catch_nobg.gif";

import styles from "./PregameScreen.module.css";

function PregameScreen() {
return (
    <div className={styles.pregameScreen}>
        <div className={styles.pregameHeader}>
            <Header username={"Test Username"}/>
        </div>
        <div className={styles.screenContent}>
            <MainText
                header="Starting Soon"
                subheader="Make sure to join the Whatsapp group to stay updated!"
            />
            <img src={pregameGif} alt="Pregame Gif" className={styles.pregameGif} style={{ width: 250, height: 250 }} />
        </div>
    </div>
);
}

export default PregameScreen;