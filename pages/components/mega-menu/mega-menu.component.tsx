import * as React from 'react';
import { sections } from '../../statics/sections';
import { capetalizeFirstLetter } from '../../helpers'
const styles = require("./mega-menu.component.sass");

const MegaMenu = (props) => {
  return (
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
  );
}

export default MegaMenu;