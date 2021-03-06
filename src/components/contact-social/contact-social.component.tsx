import { socialMediaAccounts } from "../../statics";
import * as React from "react";
import SocialMediaIcon from "../social-media-icon/social-media-icon.component";
import styles from "./contact-social.module.sass";

const ContactSocial = (props) => {
  return (
    <div
      className={`mt-3 d-flex align-items-center justify-content-center flex-grow-0 w-100 ${styles.contactSocial}`}
    >
      {
        socialMediaAccounts.map((item, index) => <SocialMediaIcon data={item} key={`sc-${index}`}/>)
      }
    </div>
  );
};

export default ContactSocial;
