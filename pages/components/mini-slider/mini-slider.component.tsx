import * as React from "react";
import { useState, useEffect } from "react";
const styles = require("./mini-slider.component.sass");

const MiniSlider = props => {
  const [activePage, setActivePage] = useState(0);
  const [pagesArray, setPagesArray] = useState([]);
  const [automatic, setAutomatic] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [moverStyle, setMoverStyle] = useState({
    width: "100%",
    marginLeft: "0px"
  });

  const [computedColumn, setComputedColumn] = useState({
    minWidth: '33.33%',
  });

  const [bodyDimensions, setBodyDimensions] = useState({
    width: 0,
    height: 0
  })

  const handleBottomController = (activePage) => {
    setActivePage(activePage);
  }

  const pagesCalculator = (screenSize) => {
    const outerElements = items.length - config.elementsPerPage[screenSize];
    let count = outerElements > 0
      ? outerElements
      : 0;
    count++;
    const pagesArray = new Array(count).fill('');
    setPagesArray(pagesArray);
  }

  const handleController = (type) => {
    const pagesNumber = pagesArray.length;
    let currentActivePage = activePage;
    if (type === "increment" && activePage < (pagesNumber - 1)) {
      currentActivePage++;
    } else if (type === "increment" && config.automatic && currentActivePage === (pagesNumber - 1)) {
      currentActivePage = 0;
    } else if (type === "decrement" && activePage > 0) {
      currentActivePage--;
    }
    setActivePage(currentActivePage);
  }

  const handleDimensions = () => {
    const containerElement = document.querySelector(".mi-sl-c-c");
    const width = `${containerElement.clientWidth}px`;
    const marginLeft = moverCalculator();
    const moverStyle = { width, marginLeft };
    setMoverStyle(moverStyle);
  }

  const moverCalculator = () => {
    const oneElement = document.querySelector(".mi-sl-c");
    const elementSize = oneElement.clientWidth;
    const marginLeft = -activePage * elementSize;
    return `${marginLeft}px`;
  }

  const columnCalculator = () => {
    const containerElement = document.querySelector(".mi-sl-c-c");
    const elements = elementsPerPage();
    const width = `${Math.ceil(containerElement.clientWidth / elements)}px`;
    return width;
  }

  const screenSize = () => {
    const bodyWidth = document.querySelector("body").clientWidth;
    return bodyWidth > 992
      ? 'lg'
      : bodyWidth <= 992 && bodyWidth > 576
      ? 'md'
      : bodyWidth <= 576
      ? 'sm'
      : 'sm'
  }

  const elementsPerPage = () => {
    const screen = screenSize();
    const selectedItemsPerPage = config.elementsPerPage[screen];
    setItemsPerPage(selectedItemsPerPage);
    return config.elementsPerPage[screen];
  }

  const handleAutomatic = () => {
    if (config.automatic) {
      setAutomatic(true)
    }
  }

  const handleMouseEvent = (value) => {
    setAutomatic(!value);
  }

  const handleResize = (event) => {
    const body = document.querySelector("body");
    const width = body.clientWidth;
    const height = body.clientWidth;
    setBodyDimensions({ width, height });
    handleBottomController(0);
  }

  const resizeListiner = () => {
    let delay;
    window.addEventListener('resize', (event) => {
      clearTimeout(delay);
      delay = setTimeout(() => {
        handleResize(event)
      }, 500)
    });
  }

  const defaultConfig = {
    iconPrefix: "lni",
    rightIcon: "arrow-right-circle",
    leftIcon: "arrow-left-circle",
    elementsPerPage: {
      lg: 3,
      md: 2,
      sm: 1
    },
    duration: 3,
    automatic: true
  };

  const defaultItems = [
    {
      icon: "cup",
      title: "Premium quality 1",
      text:
        "With high skills, and modern stack, we can deliver the best premium quality you need for your project."
    },
    {
      icon: "cup",
      title: "Premium quality 2",
      text:
        "With high skills, and modern stack, we can deliver the best premium quality you need for your project."
    },
    {
      icon: "cup",
      title: "Premium quality 3",
      text:
        "With high skills, and modern stack, we can deliver the best premium quality you need for your project."
    },
    {
      icon: "cup",
      title: "Premium quality 4",
      text:
        "With high skills, and modern stack, we can deliver the best premium quality you need for your project."
    },
    {
      icon: "cup",
      title: "Premium quality 5",
      text:
        "With high skills, and modern stack, we can deliver the best premium quality you need for your project."
    },
    {
      icon: "cup",
      title: "Premium quality 5",
      text:
        "With high skills, and modern stack, we can deliver the best premium quality you need for your project."
    },
    {
      icon: "cup",
      title: "Premium quality 5",
      text:
        "With high skills, and modern stack, we can deliver the best premium quality you need for your project."
    },
    {
      icon: "cup",
      title: "Premium quality 5",
      text:
        "With high skills, and modern stack, we can deliver the best premium quality you need for your project."
    }
  ];

  const { items = defaultItems, config = defaultConfig } = props;

  useEffect(() => {
    const screen = screenSize();
    pagesCalculator(screen);
    handleDimensions();
    setComputedColumn({
      minWidth: columnCalculator()
    });
    handleAutomatic();
    resizeListiner();
  }, []);

  useEffect(() => {
    handleDimensions();
  }, [activePage]);

  useEffect(() => {
    const screen = screenSize();
    pagesCalculator(screen);
    handleDimensions();
    setComputedColumn({
      minWidth: columnCalculator()
    });
  }, [bodyDimensions])

  useEffect(() => {
    if(config.automatic) {
      const interval = setInterval(() => {
        const controllerButton: HTMLElement = document.querySelector(".mi-sl-b");
        if (automatic) {
          controllerButton.click();
        }
      }, config.duration * 1000);
      return () => clearInterval(interval);
    }
  }, [automatic]);

  return (
    <div onMouseEnter={handleMouseEvent.bind(null, true)} onMouseLeave={handleMouseEvent.bind(null, false)}>
      <div className={`d-flex align-items-center w-100 ${styles.miniSlider}`}>
        <div
          className={`d-flex align-items-center justify-content-center h-100 ${styles.controller}`}
        >
          <i 
            className={`${config.iconPrefix}-${config.leftIcon} ${activePage === 0 && styles.disabled}`} 
            onClick={handleController.bind(null, 'decrement')}
          />
        </div>
        <div className={`d-flex align-items-center position-relative h-100 mi-sl-c-c ${styles.items}`}>
          <div className={`d-flex align-items-center position-absolute ${styles.mover}`} style={moverStyle}>
            {items.map((item, index) => {
              return (
                <div key={index} className="d-flex align-items-start mi-sl-c col" style={computedColumn}>
                  <div className="left">
                    <div
                      className={`d-flex align-items-center justify-content-center ${styles.miniSliderIcon}`}
                    >
                      <i className={`${config.iconPrefix}-${item.icon}`} />
                    </div>
                  </div>
                  <div className="right ml-2 flex-grow-1">
                    <div className={`w-100 ${styles.title} ${ itemsPerPage === 1 ? "text-center": ""}`}>{item.title}</div>
                    <div className={`w-100 mt-1 ${styles.text} ${ itemsPerPage === 1 ? "text-center": ""}`}>{item.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div
          className={`d-flex align-items-center justify-content-center h-100 ${styles.controller}`}
        >
          <i 
            className={`mi-sl-b ${config.iconPrefix}-${config.rightIcon} ${activePage === (pagesArray.length - 1) && styles.disabled}`} 
            onClick={handleController.bind(null, 'increment')}
          />
        </div>
      </div>
      <div className="w-100 d-flex align-items-center justify-content-center">
        <div className="d-flex mt-2">
          {pagesArray.map((item, index) => {
            return (
              <div
                key={index}
                className={`d-flex align-items-center justify-content-center mx-2 ${styles.bottomController} ${activePage === index && styles.active}`}
                onClick={handleBottomController.bind(null, index)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MiniSlider;