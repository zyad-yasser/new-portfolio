import * as React from 'react';
import { sections } from '../../statics/sections';
import { capetalizeFirstLetter } from '../../helpers'
import { useSelector } from "react-redux";
import Fade from 'react-reveal/Fade';
const styles = require("./mega-menu.component.sass");

const MegaMenu = (props) => {
  const ui = useSelector((state: any) => state.ui);
  return (
    ui.isOpen && (
    <Fade left="true">
      <div className={`h-100 d-flex align-items-center ${styles.megaMenu}`}>
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
        <div className={`w-100 p-3 text-center ${styles.logo}`}>
          <img className={`${styles.logo}`} src="/static/logo.png" width="100%"/>
        </div>
      </div>
    </Fade>
    )
  );
}

export default MegaMenu;