import { Grid } from "@material-ui/core";
import * as React from "react";
import styles from "./contact-form.module.sass";

const ContactForm = (props) => {
  return (
    <div
      className={`d-flex align-items-center justify-content-center w-100 mt-3 ${styles.contactForm}`}
    >
      <Grid container spacing={3}>
        <Grid item sm={12} md={6}>
          <input className="one-input" placeholder="name" />
        </Grid>
        <Grid item sm={12} md={6}>
          <input className="one-input" placeholder="subject" />
        </Grid>
        <Grid item sm={12} md={12}>
          <input className="one-input" placeholder="email" />
        </Grid>
        <Grid item sm={12} md={12}>
          <textarea className="one-input" placeholder="content"></textarea>
        </Grid>
      </Grid>
    </div>
  );
};

export default ContactForm;
