import * as React from "react";
import Reveal from "react-reveal/Reveal";
import { projectDirection } from "../../helpers";
import { productionProjects } from "../../statics";
import ProjectCard from "../project-card/project-card.component";

const ProductionProjects = (props) => {
  return (
    <Reveal effect="fade" effectOut="fade" exit delay={4000} wait={4000} left cascade>
      {productionProjects.map((item, index) => (
        <ProjectCard project={item} key={index} type={projectDirection(index)} />
      ))}
    </Reveal>
  );
};

export default ProductionProjects;
