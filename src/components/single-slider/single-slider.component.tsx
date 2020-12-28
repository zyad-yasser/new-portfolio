import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './single-slider.module.sass';
import Fade from 'react-reveal/Fade';
import Slide from 'react-reveal/Slide';
import { skills } from '@/statics';
import { Grid } from '@material-ui/core';

const SingleSlider = (props) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [automatic, setAutomatic] = useState(false);
  const defaultConfig = {
    iconPrefix: 'lni',
    rightIcon: 'chevron-right',
    leftIcon: 'chevron-left',
    duration: 3,
    automatic: true,
  };

  const [activeImage, setActiveImage] = useState(null);

  const { items = skills, config = defaultConfig } = props;

  const handleSlideChange = (type) => {
    const pagesNumber = items.length;
    let currentActiveSlide = activeSlide;
    if (type === 'increment' && currentActiveSlide < pagesNumber - 1) {
      currentActiveSlide++;
    } else if (
      type === 'increment' &&
      config.automatic &&
      currentActiveSlide === pagesNumber - 1
    ) {
      currentActiveSlide = 0;
    } else if (type === 'decrement' && currentActiveSlide > 0) {
      currentActiveSlide--;
    }
    setActiveSlide(currentActiveSlide);
  };

  const handleImageChange = () => {
    setActiveImage(null);
    setTimeout(() => {
      setActiveImage(items[activeSlide].image);
    }, 200);
  };

  const handleAutomatic = () => {
    if (config.automatic) {
      setAutomatic(true);
    }
  };

  const handleMouseEvent = (value) => {
    setAutomatic(!value);
  };

  useEffect(() => {
    handleAutomatic();
  }, []);

  useEffect(() => {
    if (config.automatic) {
      const interval = setInterval(() => {
        const controllerButton: HTMLElement = document.querySelector(
          '.si-sl-b',
        );
        if (automatic) {
          controllerButton.click();
        }
      }, config.duration * 1000);
      return () => clearInterval(interval);
    }
  }, [automatic]);

  useEffect(() => {
    handleImageChange();
  }, [activeSlide]);

  return (
    <div
      className={`w-100 mt-3 mt-lg-5 d-flex align-items-center justify-content-between ${styles.skillsContent}`}
      onMouseEnter={handleMouseEvent.bind(null, true)}
      onMouseLeave={handleMouseEvent.bind(null, false)}
    >
      <Grid container spacing={3}>
        <Grid item sm={12} md={6} className="max-250 w-100">
          <div
            className={`d-flex align-items-center position-relative ${styles.leftContent } ${styles.max250 }`}
          >
            <div
              className={`text-left d-flex align-items-center justify-content-between position-absolute w-100 ${styles.controllers}`}
            >
              <button
                className={`d-flex align-items-center justify-content-center ${
                  styles.prev
                } ${activeSlide > 0 && styles.active}`}
                onClick={handleSlideChange.bind(null, 'decrement')}
              >
                <i className="lni-chevron-left" />
              </button>
              <button
                className={`d-flex align-items-center justify-content-center ${
                  styles.next
                } ${activeSlide < items.length - 1 && styles.active}`}
                onClick={handleSlideChange.bind(null, 'increment')}
                disabled={activeSlide === items.length - 1}
              >
                <i className="lni-chevron-right" />
              </button>
              <button
                className="d-none si-sl-b "
                onClick={handleSlideChange.bind(null, 'increment')}
              />
            </div>
            {items.map((item, index) => (
              <Fade
                key={index}
                right={true}
                opposite={true}
                when={activeSlide === index}
              >
                <div
                  className={`p-4 h-100 d-flex align-items-center position-absolute ${styles.mainSlider}`}
                >
                  <div>
                    <div
                      className={`d-flex align-items-center justify-content-start ${styles.title}`}
                    >
                      <div
                        className={`d-flex align-items-center justify-content-center ${styles.icon}`}
                      >
                        <img src={item.icon} />
                      </div>
                      <div className={`${styles.text} ml-2 h-100 mt-4`}>
                        <div className={`w-100 ${styles.head}`}>
                          {item.title}
                        </div>
                        <div className={`w-100 mt-2 ${styles.info}`}>
                          {item.text}
                        </div>
                      </div>
                    </div>
                    <div className={`mt-2 p-3 ${styles.content}`}>
                      {item.caption}
                    </div>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </Grid>
        <Grid item sm={12} md={6} className="max-250 w-100 mt-3 mt-md-0">
          <div
            className={`h-100 d-flex align-items-center justify-content-center ${styles.rightContent}`}
          >
            <Slide bottom={true} when={activeImage}>
              <img src={items[activeSlide].image} />
            </Slide>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default SingleSlider;
