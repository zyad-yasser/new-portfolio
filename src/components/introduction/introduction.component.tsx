import styles from "./introduction.module.sass";

const Introduction = () => {
  return (
    <div
      className={`d-flex align-items-center justify-content-center w-100 ${styles.introduction}`}
    >
      {/* Animated lighting effects */}
      <div className={styles.lightingEffect}>
        <div className={styles.spotlight1}></div>
        <div className={styles.spotlight2}></div>
        <div className={styles.spotlight3}></div>
      </div>

      <div className={`text-left ${styles.centeredContent}`}>
        <div className={`${styles.jobTitle}`}>Full stack software enginner</div>
        <div className={`${styles.mainPhrase}`}>THIS IS ZYAD YASSER</div>
        <div className={`text-center ${styles.welcome}`}>Welcome to my portfolio</div>
      </div>
    </div>
  );
};

export default Introduction;
