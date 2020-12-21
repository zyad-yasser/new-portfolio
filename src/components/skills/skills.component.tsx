import * as React from 'react';
import SingleSlider from '../single-slider/single-slider.component';
import styles from "./skills.module.sass";

const Skills = () => {
  return (
    <div id="skills" className={`d-flex align-items-center justify-content-center w-100 ${styles.skills}`}>
      <div className={`d-flex align-items-center justify-content-center w-100 ${styles.about}`}>
        <div className={`text-left container ${styles.centeredContent}`}>
          <div className={`w-100 mx-auto text-center ${styles.title}`}>
            <div className={`w-100 ${styles.text}`}>
              Skills
            </div>
            <div className={`w-7 mx-auto ${styles.liner}`} />
          </div>
          <SingleSlider />
        </div>
      </div>
    </div>
  );
}

export default Skills;
