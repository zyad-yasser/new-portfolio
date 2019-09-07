import { useState } from "react";
const styles = require("./nav-btn.component.sass");
const NavBtn = props => {
  const [isOpen, toggleOpen] = useState(false);
  const [isHover, toggleHover] = useState(false);
  const toggleMenu = (): void => {
    toggleOpen(!isOpen);
  };
  const toggleEffect = (): void => {
    if(!isOpen) {
      toggleHover(!isHover);
    }
  };
  return (
    <div
      className={`d-flex justify-content-center align-items-center ${styles.navMenu}`}
    >
      <div
        className={`${styles.navIcon} ${isOpen && styles.open} ${isHover && styles.hover}`}
        onClick={toggleMenu}
        onMouseEnter={toggleEffect}
        onMouseLeave={toggleEffect}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default NavBtn;
