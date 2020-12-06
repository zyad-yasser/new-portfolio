import { Grid } from "@material-ui/core";
import * as React from "react";
import styles from "./contact-icons.module.sass";

const ContactIcons = (props) => {
  return (
    <div
      className={`d-flex align-items-center justify-content-center w-100 ${styles.contactIcons}`}
    >
      <Grid container spacing={3}>
        <Grid item sm={12} md={3}>
          <div className={`${styles.contactItem}`}>
            <div className={`${styles.icon}`}>
              <i className="lni-phone-handset" />
            </div>
            <div className={`${styles.text}`}>
            <div className={`${styles.title}`}>
                mobile
              </div>
              <div className={`${styles.value}`}>
                +201111980284
              </div>
            </div>
          </div>
        </Grid>
        <Grid item sm={12} md={3}>
          <div className={`${styles.contactItem}`}>
            <div className={`${styles.icon}`}>
              <i className="lni-envelope" />
            </div>
            <div className={`${styles.text}`}>
              <div className={`${styles.title}`}>
                email
              </div>
              <div className={`${styles.value}`}>
                zyadyasser6@gmail.com
              </div>
            </div>
          </div>
        </Grid>
        <Grid item sm={12} md={6}>
          <div className={`${styles.contactItem}`}>
            <div className={`${styles.icon}`}>
            <i className="lni-pin" />
            </div>
            <div className={`${styles.text}`}>
            <div className={`${styles.title}`}>
                Address
              </div>
              <div className={`${styles.value}`}>
                <p>B.62, Bank El-Eskan, Al-Dawahi, Port-Said, Egypt</p>
                <p>1st Tayaran St., Nasr City, Cairo, Egypt</p>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default ContactIcons;
