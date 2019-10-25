import * as React from "react";
const styles = require("./mini-slider.component.sass");

const MiniSlider = props => {
  const handleBottomController = (page) => {
    console.log(page)
  }
  const defaultConfig = {
    iconPrefix: "lni",
    rightIcon: "arrow-right-circle",
    leftIcon: "arrow-left-circle",
    elementsPerPage: {
      lg: 3,
      md: 2,
      sm: 1
    }
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
    }
  ];
  const { items = defaultItems, config = defaultConfig } = props;
  const bottomControllerCalculator = (screenSize) => {
    const outerElements = items.length - config.elementsPerPage[screenSize];
    let count = outerElements > 0
      ? outerElements
      : 0;
    count++;
    return count;
  }
  const bottomController = new Array(bottomControllerCalculator("lg")).fill('');

  return (
    <>
      <div className={`d-flex align-items-center w-100 ${styles.miniSlider}`}>
        <div
          className={`d-flex align-items-center justify-content-center h-100 ${styles.controller}`}
        >
          <i className={`${config.iconPrefix}-${config.leftIcon}`} />
        </div>
        <div className={`d-flex align-items-center ${styles.items}`}>
          {items.map((item, index) => {
            return (
              <div key={index} className="col col-4 d-flex align-items-start">
                <div className="left">
                  <div
                    className={`d-flex align-items-center justify-content-center ${styles.miniSliderIcon}`}
                  >
                    <i className={`${config.iconPrefix}-${item.icon}`} />
                  </div>
                </div>
                <div className="right ml-2 flex-grow-1">
                  <div className={`w-100 ${styles.title}`}>{item.title}</div>
                  <div className={`w-100 mt-1 ${styles.text}`}>{item.text}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className={`d-flex align-items-center justify-content-center h-100 ${styles.controller}`}
        >
          <i className={`${config.iconPrefix}-${config.rightIcon}`} />
        </div>
      </div>
      <div className="w-100 d-flex align-items-center justify-content-center">
        <div className="d-flex mt-2">
          {bottomController.map((item, index) => {
            return (
              <div
                key={index}
                className={`d-flex align-items-center justify-content-center mx-2 ${styles.bottomController}`}
                onClick={handleBottomController.bind(null, index)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MiniSlider;
