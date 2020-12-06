import { assetsPrefixUrl } from '../../constants';
import * as React from 'react';
import { Tooltip } from '@material-ui/core';
import styles from "./technology-icon.module.sass";

const TechnologyIcon = ({ technology }) => {
  return (<div className={`d-flex justify-content-center align-items-center ${styles.icon}`}>
    <Tooltip title={technology}>
      <img src={`${assetsPrefixUrl}/icons/${technology}.png`} width="17px" height="17px" />
    </Tooltip>
  </div>);
}

export default TechnologyIcon;
