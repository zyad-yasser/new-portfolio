"use client";

import { useState } from "react";
import { assetsPrefixUrl } from "../../constants";
import { Partner } from "../../models";
import styles from "./partner-card.module.sass";

interface PartnerCardProps {
  partner: Partner;
}

const PartnerCard = ({ partner }: PartnerCardProps) => {
  const [hovered, setHovered] = useState(false);
  const toggleHover = (type: boolean) => (event: React.MouseEvent) => {
    event.stopPropagation();
    setHovered(type);
  };

  return (
    <div
      onMouseEnter={toggleHover(true)}
      onMouseLeave={toggleHover(false)}
      className={`d-flex align-items-center justify-content-center position-relative m-3 ${styles.card}  ${hovered && styles.hovered}`}
    >
      {/* <div className={`d-flex align-items-center justify-content-center position-absolute ${styles.name}`}>{partner.name}</div>
      <img src={ assetsPrefixUrl + partner.image } width="100px" height="62px"/> */}
    </div>
  );
};

export default PartnerCard;
