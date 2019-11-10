import * as React from "react";
import { useState, useEffect } from "react";
const styles = require("./single-slider.component.sass");
import Fade from "react-reveal/Fade";

const SingleSlider = props => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [automatic, setAutomatic] = useState(false);
  const defaultConfig = {
    iconPrefix: "lni",
    rightIcon: "chevron-right",
    leftIcon: "chevron-left",
    duration: 3,
    automatic: true
  };

  const defaultItems = [
    {
      icon: "/static/logos/mean.png",
      title: "MEAN stack development",
      text: "All about full stack development using Angular / NodeJS",
      caption:
        "Starting from backend development using the amazing Node.js runtime, to frontend development using Angular (latest) the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.",
      image: "/static/logos/mean-expanded.png"
    },
    {
      icon: "/static/logos/mern.png",
      title: "MEAN stack development",
      text: "All about full stack development using Angular / NodeJS",
      caption:
        "Starting from backend development using the amazing Node.js runtime, to frontend development using Angular (latest) the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.",
      image: "/static/logos/mean.png"
    },
    {
      icon: "/static/logos/vue.png",
      title: "MEAN stack development",
      text: "All about full stack development using Angular / NodeJS",
      caption:
        "Starting from backend development using the amazing Node.js runtime, to frontend development using Angular (latest) the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.",
      image: "/static/logos/mean.png"
    },
    {
      icon: "/static/logos/cross-platform.png",
      title: "MEAN stack development",
      text: "All about full stack development using Angular / NodeJS",
      caption:
        "Starting from backend development using the amazing Node.js runtime, to frontend development using Angular (latest) the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.",
      image: "/static/logos/mean.png"
    },
    {
      icon: "/static/logos/devops.png",
      title: "MEAN stack development",
      text: "All about full stack development using Angular / NodeJS",
      caption:
        "Starting from backend development using the amazing Node.js runtime, to frontend development using Angular (latest) the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.",
      image: "/static/logos/mean.png"
    },
    {
      icon: "/static/logos/ui.png",
      title: "MEAN stack development",
      text: "All about full stack development using Angular / NodeJS",
      caption:
        "Starting from backend development using the amazing Node.js runtime, to frontend development using Angular (latest) the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.",
      image: "/static/logos/mean.png"
    },
    {
      icon: "/static/logos/gfx.png",
      title: "MEAN stack development",
      text: "All about full stack development using Angular / NodeJS",
      caption:
        "Starting from backend development using the amazing Node.js runtime, to frontend development using Angular (latest) the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.",
      image: "/static/logos/mean.png"
    },
    {
      icon: "/static/logos/iot.png",
      title: "MEAN stack development",
      text: "All about full stack development using Angular / NodeJS",
      caption:
        "Starting from backend development using the amazing Node.js runtime, to frontend development using Angular (latest) the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.",
      image: "/static/logos/mean.png"
    }
  ];

  const { items = defaultItems, config = defaultConfig } = props;

  const handleSlideChange = (type, area) => {
    const pagesNumber = items.length;
    let currentActiveSlide = activeSlide;
    if (type === "increment" && currentActiveSlide < (pagesNumber - 1)) {
      currentActiveSlide++;
    } else if (type === "increment" && config.automatic && currentActiveSlide === (pagesNumber - 1)) {
      currentActiveSlide = 0;
    } else if (type === "decrement" && currentActiveSlide > 0) {
      currentActiveSlide--;
    }
    setActiveSlide(currentActiveSlide);
  }

  const handleAutomatic = () => {
    if (config.automatic) {
      setAutomatic(true)
    }
  }

  const handleMouseEvent = (value) => {
    setAutomatic(!value);
  }

  useEffect(() => {
    handleAutomatic();
  }, []);

  useEffect(() => {
    if(config.automatic) {
      const interval = setInterval(() => {
        const controllerButton: HTMLElement = document.querySelector(".si-sl-b");
        if (automatic) {
          controllerButton.click();
        }
      }, config.duration * 1000);
      return () => clearInterval(interval);
    }
  }, [automatic]);

  return (
    <div
      className={`w-100 mt-5 d-flex align-items-center justify-content-between ${styles.skillsContent}`}
      onMouseEnter={handleMouseEvent.bind(null, true)}
      onMouseLeave={handleMouseEvent.bind(null, false)}
    >
      <div
        className={`h-100 d-flex align-items-center position-relative ${styles.leftContent}`}
      >
        <div
          className={`text-left d-flex align-items-center justify-content-between position-absolute w-100 ${styles.controllers}`}
        >
          <button
            className={`d-flex align-items-center justify-content-center ${
              styles.prev
            } ${activeSlide > 0 && styles.active}`}
            onClick={handleSlideChange.bind(null, "decrement")}
            disabled={activeSlide === 0}
          >
            <i className="lni-chevron-left" />
          </button>
          <button
            className={`d-flex align-items-center justify-content-center si-sl-b ${
              styles.next
            } ${activeSlide < (items.length - 1) && styles.active}`}
            onClick={handleSlideChange.bind(null, "increment")}
            disabled={activeSlide === (items.length - 1)}
          >
            <i className="lni-chevron-right" />
          </button>
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
                    <div className={`w-100 ${styles.head}`}>{item.title}</div>
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
      <div
        className={`h-100 d-flex align-items-center justify-content-center ${styles.rightContent}`}
      >
        <img src={items[activeSlide].image} />
      </div>
    </div>
  );
};

export default SingleSlider;
