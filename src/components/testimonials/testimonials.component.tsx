import Grid from "@material-ui/core/Grid";
import * as React from "react";
import Partners from "../partners/partners.component";
import TestimonialsSlider from "../testimonials-slider/testimonials-slider.component";
import Title from "../title/title.component";
import styles from "./testimonials.module.sass";

const Testimonials = (props) => {
  return(
    <div id="testimonials" className={`d-flex align-items-center justify-content-center w-100 ${styles.testimonials}`}>
      <div className={`d-flex align-items-center justify-content-center w-100 ${styles.about}`}>
        <div className={`text-left container ${styles.centeredContent}`}>
          <Title label='Testimonials & Partners' textColor="#212529" lineColor="#d34a47" />
          <div className="content mt-5">
            <Grid container spacing={3}>
              <Grid item sm={12} md={6}>
                <TestimonialsSlider />
              </Grid>
              <Grid item sm={12} md={6}>
                <Partners />
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
