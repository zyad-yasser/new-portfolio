import { Grid } from '@material-ui/core';
import * as React from 'react';
import MiniSlider from '../mini-slider/mini-slider.component';
import Title from '../title/title.component';
import styles from "./about.module.sass";

const About = (props) => {
  return (
    <div id="about" className={`d-flex align-items-center justify-content-center w-100 ${styles.about}`}>
      <div className={`text-left container ${styles.centeredContent}`}>
        <Title label='Let me introduce my self' textColor="#212529" lineColor="#d34a47" />
        <div className={`w-100 mt-5 d-flex align-items-center justify-content-between ${styles.aboutContent}`}>
          <Grid container spacing={3}>
            <Grid item sm={12} md={6}>
            <div className={`d-flex align-items-center h-100 ${styles.leftContent}`}>
            <div>
              <div className={`w-100 ${styles.title}`}>
                A full stack web developer
              </div>
              <div className={`w-100 pt-2 ${styles.text}`}>
                <p>This is Zyad, a full stack software engineer, specified in web development, I have true passion about creating awesome stuff, also about getting in touch with the latest technologies.</p>
                <p>I have an engineering bachelor in Civil Engineering, but with my all love to technology and design, from first day I desided to keep doing what I love, so let's build something together.</p>
              </div>
              <div className={`w-100 d-flex pt-2 buttons ${styles.text}`}>
                <button className={`btn btn-danger mr-3 ${styles.btn}`}>Portfolio</button>
                <button className={`btn btn-danger ${styles.btn}`}>Skills</button>
              </div>
            </div>
          </div>
            </Grid>
            <Grid item sm={12} md={6} className="w-100">
              <div className={`h-100 ${styles.rightImage}`} />
            </Grid>
          </Grid>
        </div>
        <div className={`w-100 mt-3 mt-lg-5 ${styles.miniSlider}`}>
          <MiniSlider />
        </div>
      </div>
    </div>
  );
}

export default About;
