import { projectDirection } from "../../../pages/helpers";
import { otherProjects } from "../../../pages/statics";
import * as React from "react";
import ProjectCard from "../project-card/project-card.component";
import Fade from 'react-reveal/Reveal';

const OtherProjects = props => {
  return(<Fade when={true} cascade={true} ssrReveal={true} effect="fadeInUp">
    {
      otherProjects.map((item, index) => <ProjectCard project={item} key={index} type={ projectDirection(index) }/>)
    }
  </Fade>
  );
};

export default OtherProjects;
