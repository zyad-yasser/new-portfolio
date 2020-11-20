import { testimonials } from "../../statics";
import * as React from "react";
import ReactSlider from "../react-slider/react-slider.component";
import TestimonialCard from "../testimonial-card/testimonial-card.component";
const styles = require("./testimonials-slider.component.sass");

const TestimonialsSlider = (props) => {
  const config = {
    iconPrefix: "lni",
    elementsPerPage: {
      lg: 1,
      md: 1,
      sm: 1
    },
    duration: 6,
    automatic: true,
    bullets: {
      show: false,
    },
    nav: {
      show: false,
      rightIcon: "arrow-right-circle",
      leftIcon: "arrow-left-circle",
    }
  }
  return(
    <div className={`d-flex flex-column align-items-center justify-content-center w-100 ${styles.testimonialsSlider}`}>
      <div className={`d-flex align-items-center justify-content-start w-100 ${styles.title}`}>
        Picked testimonials
      </div>
      <ReactSlider config={config}>
        {
          testimonials.map((data, index) => (
            <TestimonialCard data={data} key={index} />
          ))
        }
      </ReactSlider>
    </div>
  );
};

export default TestimonialsSlider;
