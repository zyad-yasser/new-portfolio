import * as React from 'react';
const styles = require("./footer.component.sass");

const Footer = (props) => {
  return (
    <div className={`d-flex h-100 ${styles.footer}`}>
      <div className={`${styles.sectionUp}`}>
        <div className={`${styles.about}`}>
          Designed and developed with ❤️ by Zyad Yasser
        </div>
      </div>
      <div className={`${styles.sectionDown}`}>
        <div className={`${styles.flipper}`}>
          <button className={`btn btn-danger ${styles.hireMe}`}>Hire me</button>
        </div>
      </div>
    </div>
  );
}

export default Footer;