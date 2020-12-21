import * as React from 'react';
import HireMe from '../hire-me/hire-me.component';
import styles from './footer.module.sass';

const Footer = (props) => {
  const scrollBottom = () => {
    const mainContentEl: HTMLElement = document.querySelector('.content-main');
    if (mainContentEl) {
      mainContentEl.scrollTo({
        top: 9999,
        behavior: 'smooth',
      });
    }
  };
  return (
    <div className={`d-flex h-100 ${styles.footer}`}>
      <div className={`${styles.sectionUp}`}>
        <div className={`${styles.about}`}>
          Designed and developed with ❤️ by Zyad Yasser
        </div>
      </div>
      <div className={`${styles.sectionDown}`}>
        <div className={`${styles.flipper}`}>
          <div className={`${styles.hireMe}`}>
            <HireMe />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
