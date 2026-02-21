"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SingleSliderProps {
  items?: Array<{
    icon: string;
    title: string;
    text: string;
    caption: string;
    image: string;
  }>;
  config?: {
    iconPrefix?: string;
    rightIcon?: string;
    leftIcon?: string;
    duration?: number;
    automatic?: boolean;
  };
}

const SingleSlider = (props: SingleSliderProps) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [automatic, setAutomatic] = useState(false);
  const defaultConfig = {
    iconPrefix: "lni",
    rightIcon: "chevron-right",
    leftIcon: "chevron-left",
    duration: 3, // seconds,
    automatic: true,
  };

  const [activeImage, setActiveImage] = useState<string | null>(null);

  const defaultItems = [
    {
      icon: "/static/logos/mean.png",
      title: "MEAN stack development",
      text: "All about full stack development using Angular / Node.js",
      caption:
        "Starting from backend development using the amazing Node.js runtime, to frontend development using Angular (latest) the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.",
      image: "/static/logos/mean-expanded.png",
    },
    {
      icon: "/static/logos/mern.png",
      title: "MERN stack development",
      text: "Full stack development using React.js / Node.js",
      caption:
        "I find amazing enjoyable work when I write full stack apps using React and when it combined with Next.js and Node.js, it becomes super stack.",
      image: "/static/logos/mern-expanded.png",
    },
    {
      icon: "/static/logos/frontend.png",
      title: "Frontend development",
      text: "It's like art to me when I work using Vue / Svelte",
      caption:
        "Making and building applications using amazing frontend frameworks available, also building libraries, components, and building blocks which can be combined to acheive your dreams in your app.",
      image: "/static/logos/frontend-expanded.png",
    },
    {
      icon: "/static/logos/cross-platform.png",
      title: "Cross platform development",
      text: "Developing mobile applications using cross platform technologies",
      caption:
        "Building mobile applications functionality and interfaces one of the most enjoyable jobs to do, Ionic, Native Script, Flutter, each one of them has it's special impact on the application.",
      image: "/static/logos/cross-platform-expanded.png",
    },
    {
      icon: "/static/logos/devops.png",
      title: "DevOps",
      text: "Moving your app from the state of development, to the production",
      caption:
        "Your app is the most important thing to pay attention to when it comes to production, with the experience in AWS, Firebase, heroku, Nginx, Apache, Linux, we can deliver your application to production with the most stable state with all your needs.",
      image: "/static/logos/devops-expanded.png",
    },
    {
      icon: "/static/logos/ui.png",
      title: "UI design / development",
      text: "Designing, and developing impressive UIs",
      caption:
        "Building UIs is the so important key parameter of successfull application, as when it comes to easy, amd attactive design, this makes the user keen to use the app, HTML5, CSS3, Bootstrap, JavaScript solid experience to deliver the desired UIS.",
      image: "/static/logos/ui-expanded.png",
    },
    {
      icon: "/static/logos/gfx.png",
      title: "Graphic design",
      text: "All about graphics and media design",
      caption:
        "As this was my first hobby to have, I love using designing apps, Photoshop, Illustrator, XD, Abstract, Sketch, I love when the wireframes become interactive dynamic user experience.",
      image: "/static/logos/gfx-expanded.png",
    },
    {
      icon: "/static/logos/iot.png",
      title: "IOT / Desktop applications development",
      text: "Building robotics, desktop applications, and smart houses",
      caption:
        "The field of building robotics and control it throw apps is robust, I use Node.js to control several boards to build robotics and control smart houses, also I use Electron.js to build desktop applications.",
      image: "/static/logos/iot-expanded.png",
    },
  ];

  const { items = defaultItems, config = defaultConfig } = props;

  const handleSlideChange = (type: string) => {
    const pagesNumber = items.length;
    let currentActiveSlide = activeSlide;
    if (type === "increment" && currentActiveSlide < pagesNumber - 1) {
      currentActiveSlide++;
    } else if (type === "increment" && config.automatic && currentActiveSlide === pagesNumber - 1) {
      currentActiveSlide = 0;
    } else if (type === "decrement" && currentActiveSlide > 0) {
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

  const handleMouseEvent = (value: boolean) => {
    setAutomatic(!value);
  };

  useEffect(() => {
    handleAutomatic();
  }, []);

  useEffect(() => {
    if (config.automatic) {
      const interval = setInterval(() => {
        const controllerButton = document.querySelector(".si-sl-b") as HTMLElement;
        if (automatic && controllerButton) {
          controllerButton.click();
        }
      }, (config.duration || 3) * 1000);
      return () => clearInterval(interval);
    }
  }, [automatic]);

  useEffect(() => {
    handleImageChange();
  }, [activeSlide]);

  return (
    <div
      className="w-full mt-8 flex items-center justify-between"
      onMouseEnter={handleMouseEvent.bind(null, true)}
      onMouseLeave={handleMouseEvent.bind(null, false)}
    >
      <div className="h-full flex items-center relative flex-1">
        <div className="text-left flex items-center justify-between absolute w-full z-10 px-4">
          <button
            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
              activeSlide > 0
                ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                : "border-gray-300 text-gray-300 cursor-not-allowed"
            }`}
            onClick={handleSlideChange.bind(null, "decrement")}
          >
            <i className="lni-chevron-left" />
          </button>
          <button
            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
              activeSlide < (items.length - 1)
                ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                : "border-gray-300 text-gray-300 cursor-not-allowed"
            }`}
            onClick={handleSlideChange.bind(null, "increment")}
            disabled={activeSlide === items.length - 1}
          >
            <i className="lni-chevron-right" />
          </button>
          <button className="hidden si-sl-b" onClick={handleSlideChange.bind(null, "increment")} />
        </div>
        {items.map((item, index) => (
          <AnimatePresence key={index} mode="wait">
            {activeSlide === index && (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="p-6 h-full flex items-center absolute inset-0">
                  <div>
                    <div className="flex items-center justify-start mb-4">
                      <div className="flex items-center justify-center w-16 h-16 p-3 bg-primary/10 rounded-lg mr-4">
                        <img
                          src={item.icon}
                          className="w-full h-full object-contain"
                          alt={item.title}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.text}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                      <p className="text-card-foreground leading-relaxed">{item.caption}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
      <div className="h-full flex items-center justify-center flex-1 ml-8">
        <AnimatePresence mode="wait">
          {activeImage && (
            <motion.img
              key={activeImage}
              src={items[activeSlide].image}
              className="max-w-full max-h-96 object-contain"
              alt={items[activeSlide].title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SingleSlider;
