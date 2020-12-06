import { partners } from "../../statics";
import * as React from "react";
import PartnerCard from "../partner-card/partner-card.component";
import { useState } from "react";
import styles from "./partners.module.sass";

const Partners = (props) => {
  return(
    <div className={`d-flex flex-wrap align-items-center justify-content-center w-100 ${styles.partners}`}>
      {
        partners.map(
          (partner, index) => (<PartnerCard key={`p-${index}`} partner={ partner } />)
        )
      }
    </div>
  );
};

export default Partners;
