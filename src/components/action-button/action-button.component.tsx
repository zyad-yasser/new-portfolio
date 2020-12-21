import { CircularProgress } from '@material-ui/core';
import * as React from 'react';
import styles from "./action-button.module.sass";

const ActionButton = ({ style, state = 'ready', label, type, disabled, classes }) => {
  return (
    <button disabled={disabled} type={type} style={style} className={`${classes} d-flex align-items-center justify-content-center btn btn-danger ${styles.actionButton}`}>
      {
        state === 'loading'
          ? <CircularProgress style={{color: '#FFF', width: '20px', height: '20px'}} color='primary' />
          : label
      }
    </button>
  );
}

export default ActionButton;
