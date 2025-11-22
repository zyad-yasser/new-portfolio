import * as React from "react";
import Reveal from "react-reveal/Reveal";
import { projectDirection } from "../../helpers";
import { otherProjects } from "../../statics";
import ProjectCard from "../project-card/project-card.component";

const OtherProjects = (props) => {
  return (
    <Reveal effect="fade" effectOut="fade" exit delay={4000} wait={4000} left cascade>
      {otherProjects.map((item, index) => (
        <ProjectCard project={item} key={index} type={projectDirection(index)} />
      ))}
    </Reveal>
  );
};

export default OtherProjects;
