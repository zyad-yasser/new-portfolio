"use client";

import { useUiStore } from "@/store/ui-store";
import styles from "./nav-btn.module.sass";

const NavBtn = () => {
  const { isOpen, isHover, toggleMenu, hoverNavButton } = useUiStore();

  return (
    <div className={`d-flex justify-content-center align-items-center ${styles.navMenu}`}>
      <div
        className={`${styles.navIcon} ${isOpen && styles.open} ${isHover && styles.hover}`}
        onClick={toggleMenu}
        onMouseEnter={hoverNavButton}
        onMouseLeave={hoverNavButton}
      >
        <div />
        <div />
        <div />
      </div>
    </div>
  );
};

export default NavBtn;
