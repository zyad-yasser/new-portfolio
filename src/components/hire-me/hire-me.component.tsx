import * as React from 'react';
import styles from "./hire-me.module.sass";

const HireMe = () => {
  const scrollBottom = () => {
    const mainContentEl: HTMLElement = document.querySelector('.content-main');
    if (mainContentEl) {
      mainContentEl.scrollTo({
        top: 9999,
        behavior: 'smooth',
      });
    }
  }
  return (
    <button onClick={scrollBottom} className={`btn btn-danger hvr-ripple-out infinite ${styles.hireMe}`}>Hire me</button>
  );
}

export default HireMe;
