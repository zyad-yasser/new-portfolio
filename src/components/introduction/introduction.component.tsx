import * as React from 'react';
import styles from "./introduction.module.sass";

const Introduction = (props) => {
  return (
    <div className={`d-flex align-items-center justify-content-center w-100 ${styles.introduction}`}>
        <div className={`text-left ${styles.centeredContent}`}>
          <div className={`${styles.jobTitle}`}>
            Full stack software enginner
          </div>
          <div className={`${styles.mainPhrase}`}>
            THIS IS ZYAD YASSER
          </div>
          <div className={`text-center ${styles.welcome}`}>
            Welcome to my portfolio
          </div>
        </div>
    </div>
  );
}

export default Introduction;
