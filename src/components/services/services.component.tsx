import Grid from "@material-ui/core/Grid";
import { services } from "../../statics";
import * as React from "react";
import ReactSlider from "../react-slider/react-slider.component";
import { useRef, useState } from "react";
import Fade from "react-reveal/Fade";
import { assetsPrefixUrl } from "../../constants";
import { useEffect } from "react";
import styles from "./services.module.sass";

const Services = (props) => {
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
    },
    mouse: {
      pauseOnHover: false,
    }
  };

  const [slideText, setSlideText] = useState<string|null>('');

  const imageRef = useRef(null);

  const onSlideChange = (slideIndex: number) =>{
    const slideText = services[slideIndex].name;
    setSlideText(null);
    setTimeout(() => {
      setSlideText(slideText);
    }, 200);
  }

  const onMouseMove = (event: any) => {
    const { clientX, clientY } = event;
    const imgEl: HTMLElement = imageRef.current
    imgEl.style.transform = `translate(-${clientX/50}px, -${clientY/50}px)`
    console.log(imgEl.style.top)

  }

  useEffect(() => {
    onSlideChange(0);
  }, [])

  return(
    <div onMouseMove={onMouseMove} id="services" className={`d-flex align-items-center justify-content-center w-100 py-3 ${styles.services}`}>
      <div className={`text-left container ${styles.centeredContent}`}>
        <div className={`w-100 mx-auto text-center ${styles.title}`}>
          <div className={`w-100 ${styles.text}`}>
            Services
          </div>
          <div className={`w-7 mx-auto ${styles.liner}`} />
        </div>
        <div className="content mt-5">
          <Grid container spacing={3}>
            <Grid item sm={12} md={6}>
              <div ref={imageRef} className={`position-relative ${styles.mover}`} >
                <ReactSlider config={config} onSlideChange={onSlideChange}>
                  {
                    services.map(({ image }, index) => (
                      <img key={`sl-${index}`} height="300px" src={ assetsPrefixUrl + image} />
                    ))
                  }
                </ReactSlider>
              </div>
            </Grid>
            <Grid item sm={12} md={6}>
              <Fade className="d-flex align-items-center justify-content-center w-100 h-100" top={true}>
                <div className={`d-flex align-items-center justify-content-center text-center h-100 ${styles.name}`}>
                  {slideText}
                </div>
              </Fade>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default Services;
