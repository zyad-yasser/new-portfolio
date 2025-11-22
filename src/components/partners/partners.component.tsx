"use client";

import { partners } from "../../statics";
import PartnerCard from "../partner-card/partner-card.component";
import styles from "./partners.module.sass";

const Partners = () => {
  return (
    <div
      className={`d-flex flex-wrap align-items-center justify-content-center w-100 ${styles.partners}`}
    >
      {partners.map((partner, index) => (
        <PartnerCard key={`p-${index}`} partner={partner} />
      ))}
    </div>
  );
};

export default Partners;
