import * as React from "react";
import Tabs from "../tabs/tabs.component";
import styles from "./projects.module.sass";
import { projectsTabs } from "../../statics";

const Projects = (props) => {
  return(
    <div id="projects" className={`d-flex align-items-center justify-content-center w-100 p-4 ${styles.projects}`}>
      <div className={`d-flex align-items-center justify-content-center w-100 ${styles.about}`}>
        <div className={`text-left container ${styles.centeredContent}`}>
          <div className={`w-100 mx-auto text-center ${styles.title}`}>
            <div className={`w-100 ${styles.text}`}>
              Projects
            </div>
            <div className={`w-7 mx-auto ${styles.liner}`} />
            <div className="content mt-5">
              <Tabs tabs={projectsTabs}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
