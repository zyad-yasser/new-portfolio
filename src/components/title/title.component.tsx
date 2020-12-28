import * as React from 'react';
import styles from "./title.module.sass";

const Title = ({ label, textColor, lineColor }) => {
  return (
    <div className={`text-left d-flex container ${styles.centeredContent}`}>
      <div className={`mx-auto d-inline-flex align-items-end justify-content-center text-center position-relative ${styles.title}`}>
        <div className={`w-100 ${styles.text}`} style={ { color: textColor } }>
          { label }
        </div>
        <div className={`w-25 mx-auto position-absolute ${styles.liner}`} style={ { backgroundColor: lineColor } } />
      </div>
    </div>
  );
}

export default Title;
