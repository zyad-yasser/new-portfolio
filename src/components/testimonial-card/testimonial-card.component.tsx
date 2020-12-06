import { Testimonial } from "../../models";
import * as React from "react";
import { assetsPrefixUrl } from "../../constants";
import styles from "./testimonial-card.module.sass";

const TestimonialCard = ({ data }: { data: Testimonial }) => {
  return (
    <div
      className={`d-flex flex-column w-100 ${styles.card}`}
    >
      <div
        className={`d-flex align-items-center justify-content-center w-100 position-relative ${styles.content}`}
      >
        <div
          className={`d-flex align-items-start justify-content-center ${styles.begin}`}
        >
          <i className="lni-quotation" />
        </div>
        <div
          className={`d-flex align-items-center justify-content-center w-100 ${styles.body}`}
        >
          {data.body}
        </div>
        <div
          className={`d-flex align-items-end justify-content-center ${styles.end}`}
        >
          <i className="lni-quotation" />
        </div>
      </div>
      <div className={`d-flex align-items-center justify-content-center w-100 mt-4 ${styles.author}`}>
        <img width="50px" height="50px" src={ assetsPrefixUrl + data.photo} />
        <div className={`ml-3 ${styles.info}`}>
          <div className={`${styles.writer} text-left`}>{data.writer}</div>
          <div className={`${styles.title} text-left`}>{data.title}</div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
