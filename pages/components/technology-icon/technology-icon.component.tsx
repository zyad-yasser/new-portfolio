import { assetsPrefixUrl } from '../../../pages/constants';
import * as React from 'react';
const styles = require("./technology-icon.component.sass");

const TechnologyIcon = ({ technology }) => {
  return (<div className={`d-flex justify-content-center align-items-center ${styles.icon}`}>
    <img src={`${assetsPrefixUrl}/icons/${technology}.png`} width="17px" height="17px" />
  </div>);
}

export default TechnologyIcon;