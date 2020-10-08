import * as React from 'react';
import { useEffect, useState } from 'react';
import { Tab } from '../../../pages/models/tab';
const styles = require("./tabs.component.sass");

const Tabs = ({ tabs }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const setActiveTab = (index: number) => {
    setActiveTabIndex(index);
  }

  useEffect(() => {
    setRenderedComponent(tabs[activeTabIndex].component);
  }, [activeTabIndex])

  const [renderedComponent, setRenderedComponent] = useState(tabs[0].component);
  return (
    <div className={`w-100 position-relative ${styles.tabs}`}>
      <div className="activator position-absolute"></div>
      <div className={`d-flex align-items-center justify-content-center w-100 ${styles.tabsNav}`}>
        {
          tabs.map((item: Tab, index: number) => <div key={index} className={`d-flex align-items-center justify-content-center h-100 ${styles.oneTab} ${activeTabIndex === index ? styles.active : ''}`}>
            <div onClick={setActiveTab.bind(null, index) }>{item.name}</div>
          </div>)
        }
      </div>
      <div className="content mt-5">{renderedComponent}</div>
    </div>
  );
}

export default Tabs;