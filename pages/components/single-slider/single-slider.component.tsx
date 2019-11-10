import * as React from "react";
import { useState, useEffect } from "react";
const styles = require("./single-slider.component.sass");
import Fade from "react-reveal/Fade";
import Slide from "react-reveal/Slide";

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

  const [activeImage, setActiveImage] = useState(null);

  const defaultItems = [
    {
      icon: "/static/logos/mean.png",
      title: "MEAN stack development",
      text: "All about full stack development using Angular / Node.js",
      caption:
        "Starting from backend development using the amazing Node.js runtime, to frontend development using Angular (latest) the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.",
      image: "/static/logos/mean-expanded.png"
    },
    {
      icon: "/static/logos/mern.png",
      title: "MERN stack development",
      text: "Full stack development using React.js / Node.js",
      caption:
        "I find amazing enjoyable work when I write full stack apps using React and when it combined with Next.js and Node.js, it becomes super stack.",
      image: "/static/logos/mern-expanded.png"
    },
    {
      icon: "/static/logos/frontend.png",
      title: "Frontend development",
      text: "It's like art to me when I work using Vue / Svelte",
      caption:
        "Making and building applications using amazing frontend frameworks available, also building libraries, components, and building blocks which can be combined to acheive your dreams in your app.",
      image: "/static/logos/frontend-expanded.png"
    },
    {
      icon: "/static/logos/cross-platform.png",
      title: "Cross platform development",
      text: "Developing mobile applications using cross platform technologies",
      caption:
        "Building mobile applications functionality and interfaces one of the most enjoyable jobs to do, Ionic, Native Script, Flutter, each one of them has it's special impact on the application.",
      image: "/static/logos/cross-platform-expanded.png"
    },
    {
      icon: "/static/logos/devops.png",
      title: "DevOps",
      text: "Moving your app from the state of development, to the production",
      caption:
        "Your app is the most important thing to pay attention to when it comes to production, with the experience in AWS, Firebase, heroku, Nginx, Apache, Linux, we can deliver your application to production with the most stable state with all your needs.",
      image: "/static/logos/devops-expanded.png"
    },
    {
      icon: "/static/logos/ui.png",
      title: "UI design / development",
      text: "Designing, and developing impressive UIs",
      caption:
        "Building UIs is the so important key parameter of successfull application, as when it comes to easy, amd attactive design, this makes the user keen to use the app, HTML5, CSS3, Bootstrap, JavaScript solid experience to deliver the desired UIS.",
      image: "/static/logos/ui-expanded.png"
    },
    {
      icon: "/static/logos/gfx.png",
      title: "Graphic design",
      text: "All about graphics and media design",
      caption:
        "As this was my first hobby to have, I love using designing apps, Photoshop, Illustrator, XD, Abstract, Sketch, I love when the wireframes become interactive dynamic user experience.",
      image: "/static/logos/gfx-expanded.png"
    },
    {
      icon: "/static/logos/iot.png",
      title: "IOT / Desktop applications development",
      text: "Building robotics, desktop applications, and smart houses",
      caption:
        "The field of building robotics and control it throw apps is robust, I use Node.js to control several boards to build robotics and control smart houses, also I use Electron.js to build desktop applications.",
      image: "/static/logos/iot-expanded.png"
    }
  ];

  const { items = defaultItems, config = defaultConfig } = props;

  const handleSlideChange = (type) => {
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

  const handleImageChange = () => {
    setActiveImage(null);
    setTimeout(() => {
      setActiveImage(items[activeSlide].image);
    }, 200);
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

  useEffect(() => {
    handleImageChange();
  }, [activeSlide]);

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
          >
            <i className="lni-chevron-left" />
          </button>
          <button
            className={`d-flex align-items-center justify-content-center ${
              styles.next
            } ${activeSlide < (items.length - 1) && styles.active}`}
            onClick={handleSlideChange.bind(null, "increment")}
            disabled={activeSlide === (items.length - 1)}
          >
            <i className="lni-chevron-right" />
          </button>
          <button
            className="d-none si-sl-b "
            onClick={handleSlideChange.bind(null, "increment")}
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
        <Slide left={true} when={activeImage}>
          <img src={items[activeSlide].image} />
        </Slide>
      </div>
    </div>
  );
};

export default SingleSlider;
