import Grid from "@material-ui/core/Grid";
import * as React from "react";
const styles = require("./contacts.component.sass");

const Contacts = (props) => {
  return(
    <div className={`d-flex align-items-center justify-content-center w-100 ${styles.contacts}`}>
      <div className={`text-left container ${styles.centeredContent}`}>
        <div className={`w-100 mx-auto text-center ${styles.title}`}>
          <div className={`w-100 ${styles.text}`}>
            Contact me
          </div>
          <div className={`w-7 mx-auto ${styles.liner}`} />
          <div className="content mt-5">
            <Grid container spacing={3}>
              <Grid item sm={12} md={6}>
                
              </Grid>
              <Grid item sm={12} md={6}>

              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
