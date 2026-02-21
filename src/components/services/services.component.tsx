"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useEffect } from "react";
import { getFirebaseStorageUrl } from "../../constants";
import { services } from "../../statics";
import ReactSlider from "../react-slider/react-slider.component";

const Services = () => {
  const config = {
    iconPrefix: "lni",
    elementsPerPage: {
      lg: 1,
      md: 1,
      sm: 1,
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
    },
  };
  const [slideText, setSlideText] = useState<string | null>("");

  const onSlideChange = (slideIndex: number) => {
    const slideText = services[slideIndex].name;
    setSlideText(null);
    setTimeout(() => {
      setSlideText(slideText);
    }, 200);
  };

  useEffect(() => {
    onSlideChange(0);
  }, []);

  return (
    <div className="flex items-center justify-center w-full py-20 bg-background">
      <div className="text-left max-w-6xl mx-auto px-4">
        <div className="w-full mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Services</h2>
          <div className="w-16 h-1 bg-primary mx-auto" />
        </div>
        <div className="content mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <ReactSlider config={config} onSlideChange={onSlideChange}>
                {services.map(({ image }, index) => (
                  <img
                    key={`sl-${index}`}
                    className="h-80 w-full object-contain"
                    src={getFirebaseStorageUrl(image)}
                    alt="Service"
                  />
                ))}
              </ReactSlider>
            </div>
            <div>
              <div className="flex items-center justify-center w-full h-full min-h-[300px]">
                <AnimatePresence mode="wait">
                  {slideText && (
                    <motion.div
                      key={slideText}
                      className="flex items-center justify-center text-center h-full text-3xl font-semibold text-primary"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      {slideText}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
