import * as React from "react";
import Tabs from "../tabs/tabs.component";
import styles from "./projects.module.sass";
import { projectsTabs } from "../../statics";
import Title from "../title/title.component";

const Projects = () => {
  return(
    <div id="projects" className={`d-flex align-items-center justify-content-center w-100 p-4 ${styles.projects}`}>
      <div className={`d-flex align-items-center justify-content-center w-100 ${styles.about}`}>
        <div className={`text-left container ${styles.centeredContent}`}>
          <Title label='Projects' textColor="#FFF" lineColor="#d34a47" />
          <div className="content mt-5">
            <Tabs tabs={projectsTabs}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
