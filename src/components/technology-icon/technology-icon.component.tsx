import { Tooltip } from "@mui/material";
import { assetsPrefixUrl } from "../../constants";
import styles from "./technology-icon.module.sass";

const TechnologyIcon = ({ technology }) => {
  return (
    <div className={`d-flex justify-content-center align-items-center ${styles.icon}`}>
      <Tooltip title={technology}>
        <img src={`${assetsPrefixUrl}/icons/${technology}.png`} width="17px" height="17px" />
      </Tooltip>
    </div>
  );
};

export default TechnologyIcon;
