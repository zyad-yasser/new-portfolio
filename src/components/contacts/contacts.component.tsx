import * as React from "react";
import ContactForm from "../contact-form/contact-form.component";
import ContactIcons from "../contact-icons/contact-icons.component";
import ContactSocial from "../contact-social/contact-social.component";
import styles from "./contacts.module.sass";

const Contacts = (props) => {
  return(
    <div className={`d-flex align-items-center justify-content-center w-100 ${styles.contacts}`}>
      <div className={`text-left container ${styles.centeredContent}`}>
        <div className={`w-100 mx-auto text-center ${styles.title}`}>
          <div className={`w-100 ${styles.text}`}>
            Contact me
          </div>
          <div className={`w-7 mx-auto ${styles.liner}`} />
        </div>
        <div className="content mt-5">
          <ContactIcons />
          <ContactForm className="mt-3"/>
          <ContactSocial className="mt-3"/>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
