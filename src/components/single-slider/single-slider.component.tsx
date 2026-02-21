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
      icon: "/logos/react.png",
      title: "React & Next.js",
      text: "Modern React development with Next.js, TypeScript & Zustand",
      caption:
        "Expert in building high-performance React applications with Next.js 16, TypeScript, server components, and modern state management using Zustand. Experienced with React 19, Framer Motion for animations, and TailwindCSS v4 for styling.",
      image: "/logos/react-expanded.png",
    },
    {
      icon: "/logos/vue.png",
      title: "Vue.js & Modern Frontend",
      text: "Vue.js, TypeScript, and component-based architecture",
      caption:
        "Building scalable applications with Vue.js and TypeScript. Experience with Ionic for hybrid mobile apps, Firebase integration, and real-time features. Created production platforms like Shasha.io and Commaful.",
      image: "/logos/vue-expanded.png",
    },
    {
      icon: "/logos/angular.png",
      title: "Angular & Enterprise Apps",
      text: "Enterprise-grade applications with Angular & TypeScript",
      caption:
        "Developed complex enterprise solutions including Takeda production management boards, Voestalpine welding dashboard, and Money Fellows. Expert in Angular, RxJS, and building robust, scalable architectures.",
      image: "/logos/angular-expanded.png",
    },
    {
      icon: "/logos/node.png",
      title: "Node.js & Backend",
      text: "Backend development with Node.js, Express & databases",
      caption:
        "Full-stack backend expertise with Node.js, Express, Sails.js, Firebase, and MongoDB. Built scalable APIs for platforms like Shasha.io, Clean Tagger, and numerous production applications with AWS deployment.",
      image: "/logos/node-expanded.png",
    },
    {
      icon: "/logos/mobile.png",
      title: "Mobile Development",
      text: "Cross-platform mobile apps with Ionic, Capacitor & Flutter",
      caption:
        "Created successful mobile applications using Ionic, Capacitor, and hybrid technologies. Published apps include Commaful (App Store) and Money Fellows (Google Play). Expert in building native-like mobile experiences.",
      image: "/logos/mobile-expanded.png",
    },
    {
      icon: "/logos/cloud.png",
      title: "Cloud & DevOps",
      text: "AWS, Firebase, Docker, and modern deployment practices",
      caption:
        "Production deployment experience with AWS, Firebase, Heroku, Nginx, and Apache. Proficient in CI/CD, Docker containerization, Linux server management, and ensuring high availability for production applications.",
      image: "/logos/cloud-expanded.png",
    },
    {
      icon: "/logos/typescript.png",
      title: "TypeScript & Modern JS",
      text: "Type-safe development with TypeScript, ES6+",
      caption:
        "Strong advocate for type safety with extensive TypeScript experience across all frameworks. Building maintainable, scalable applications with modern JavaScript (ES6+), async/await, and functional programming patterns.",
      image: "/logos/typescript-expanded.png",
    },
    {
      icon: "/logos/ui.png",
      title: "UI/UX & Design Systems",
      text: "TailwindCSS, Sass, shadcn/ui, and responsive design",
      caption:
        "Creating beautiful, responsive interfaces with TailwindCSS v4, Sass, and modern design systems like shadcn/ui. Experience with Figma, Adobe XD, and transforming designs into pixel-perfect implementations with Framer Motion animations.",
      image: "/logos/ui-expanded.png",
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
