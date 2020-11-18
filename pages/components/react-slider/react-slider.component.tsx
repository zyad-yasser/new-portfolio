import * as React from "react";
import { useState, useEffect, useRef } from "react";
const styles = require("./react-slider.component.sass");

const ReactSlider = props => {
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
    const outerElements = children.length - config.elementsPerPage[screenSize];
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

  const sliderContainer = useRef(null)
  const moverEl = useRef(null)
  const controllerButton = useRef(null)

  const handleDimensions = () => {
    const containerElement = sliderContainer.current;
    if (containerElement) {
      const width = `${containerElement.clientWidth}px`;
      const marginLeft = moverCalculator();
      const moverStyle = { width, marginLeft };
      setMoverStyle(moverStyle);
    }
  }

  const moverCalculator = () => {
    const oneElement = moverEl.current;
    if (oneElement) {
      const elementSize = oneElement.clientWidth;
      const marginLeft = -activePage * elementSize;
      return `${marginLeft}px`;
    }
    return `0px`;
  }

  const columnCalculator = () => {
    const containerElement = sliderContainer.current;
    const elements = elementsPerPage();
    const width = `${Math.ceil(containerElement.clientWidth / elements)}px`;
    return width;
  }

  const screenSize = () => {
    const bodyWidth = window.innerWidth;
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
    elementsPerPage: {
      lg: 1,
      md: 1,
      sm: 1
    },
    duration: 3,
    automatic: true,
    bullets: {
      show: false,
    },
    nav: {
      show: false,
      rightIcon: "arrow-right-circle",
      leftIcon: "arrow-left-circle",
    }
  };

  const { children = [], config = defaultConfig } = props;
  
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
        const controllerButtonEl: HTMLElement = controllerButton.current;
        if (automatic && controllerButtonEl) {
          controllerButtonEl.click();
        }
      }, config.duration * 1000);
      return () => clearInterval(interval);
    }
  }, [automatic]);

  return (
    <div className="w-100" onMouseEnter={handleMouseEvent.bind(null, true)} onMouseLeave={handleMouseEvent.bind(null, false)}>
      <div className={`d-flex align-items-center w-100 ${styles.miniSlider}`}>
        <div
          className={`align-items-center justify-content-center h-100 ${styles.controller} ${config.nav.show ? 'd-flex' : 'd-none'}`}
        >
          <i 
            className={`${config.iconPrefix}-${config.nav.leftIcon} ${activePage === 0 && styles.disabled}`} 
            onClick={handleController.bind(null, 'decrement')}
          />
        </div>
        <div ref={sliderContainer} className={`d-flex align-items-center position-relative h-100 ${styles.items}`}>
          <div className={`d-flex align-items-center position-absolute ${styles.mover}`} style={moverStyle}>
            {
              children.length 
                ? children.map((item, index) => {
                    return (
                      <div key={index} ref={moverEl} className="d-flex align-items-start col px-0" style={computedColumn}>
                        { item }
                      </div>
                    );
                  })
                : { children }
            }
          </div>
        </div>
        <div
          className={`align-items-center justify-content-center h-100 ${styles.controller} ${config.nav.show ? 'd-flex ' : 'd-none'}`}
        >
          <i
            ref={controllerButton}
            className={`${config.iconPrefix}-${config.nav.rightIcon} ${activePage === (pagesArray.length - 1) && styles.disabled}`} 
            onClick={handleController.bind(null, 'increment')}
          />
        </div>
      </div>
      { config.bullets.show && children.length && <div className="w-100 d-flex align-items-center justify-content-center">
        <div className="d-flex mt-2">
          {pagesArray.map((_, index) => {
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
    }
    </div>
  );
};

export default ReactSlider;
