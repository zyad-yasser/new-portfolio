import { assetsPrefixUrl } from '../../../pages/constants';
import * as React from 'react';
import { Tooltip } from '@material-ui/core';
const styles = require("./technology-icon.component.sass");

const TechnologyIcon = ({ technology }) => {
  return (<div className={`d-flex justify-content-center align-items-center ${styles.icon}`}>
    <Tooltip title={technology}>
      <img src={`${assetsPrefixUrl}/icons/${technology}.png`} width="17px" height="17px" />
    </Tooltip>
  </div>);
}

export default TechnologyIcon;