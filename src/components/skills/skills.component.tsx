import * as React from 'react';
import SingleSlider from '../single-slider/single-slider.component';
import Title from '../title/title.component';
import styles from "./skills.module.sass";

const Skills = () => {
  return (
    <div id="skills" className={`d-flex align-items-center justify-content-center w-100 ${styles.skills}`}>
      <div className={`d-flex align-items-center justify-content-center w-100 ${styles.about}`}>
        <div className={`text-left container ${styles.centeredContent}`}>
          <Title label='Skills' textColor="#FFF" lineColor="#212529" />
          <SingleSlider />
        </div>
      </div>
    </div>
  );
}

export default Skills;
