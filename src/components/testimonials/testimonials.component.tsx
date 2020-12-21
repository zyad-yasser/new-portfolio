import Grid from "@material-ui/core/Grid";
import * as React from "react";
import Partners from "../partners/partners.component";
import TestimonialsSlider from "../testimonials-slider/testimonials-slider.component";
import styles from "./testimonials.module.sass";

const Testimonials = (props) => {
  return(
    <div id="testimonials" className={`d-flex align-items-center justify-content-center w-100 ${styles.projects}`}>
      <div className={`d-flex align-items-center justify-content-center w-100 ${styles.about}`}>
        <div className={`text-left container ${styles.centeredContent}`}>
          <div className={`w-100 mx-auto text-center ${styles.title}`}>
            <div className={`w-100 ${styles.text}`}>
              Testimonials & Partners
            </div>
            <div className={`w-7 mx-auto ${styles.liner}`} />
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
    </div>
  );
};

export default Testimonials;
