import * as React from 'react';
import { sections } from '../../statics';
import { capetalizeFirstLetter } from '../../helpers'
import { useSelector } from "react-redux";
import Fade from 'react-reveal/Fade';
import styles from "./mega-menu.module.sass";

const MegaMenu = (props) => {
  const ui = useSelector((state: any) => state.ui);
  return (
    <Fade left={true} when={ui.isOpen} unmountOnExit={true} collapse={true}>
      <div className={`d-flex align-items-center ${styles.megaMenu}`}>
        <Fade left cascade unmountOnExit={true} mountOnEnter={true} appear={ui.isOpen} when={ui.isOpen} exit={true} distance="550px">
          <div>
            {sections.map(
              (section, index) => (
                <div className={`w-100 ${styles.item}`} key={index}>
                  <div className={`${styles.wrapper}`}>
                    {capetalizeFirstLetter(section.name)}
                    {section.active && <div className={`${styles.line}`} />}
                  </div>
                </div>
              )
            )}
          </div>
        </Fade>
        {/* <div className={`w-100 p-3 text-center ${styles.logo}`}>
          <img className={`${styles.logo}`} src="/static/logo.png" width="100%"/>
        </div> */}
      </div>
    </Fade>
  );
}

export default MegaMenu;
