import { projectDirection } from "../../../pages/helpers";
import { otherProjects } from "../../../pages/statics";
import * as React from "react";
import ProjectCard from "../project-card/project-card.component";
import Reveal from 'react-reveal/Reveal';

const OtherProjects = props => {
  return(
    <Reveal effect="fade" effectOut="fade" exit delay={4000} wait={4000} left cascade>
      {
        otherProjects.map((item, index) => <ProjectCard project={item} key={index} type={ projectDirection(index) }/>)
      }
    </Reveal>
  );
};

export default OtherProjects;
