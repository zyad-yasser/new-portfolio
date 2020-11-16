import { productionProjects } from "../../../pages/statics";
import * as React from "react";
import ProjectCard from "../project-card/project-card.component";
import { projectDirection } from "../../../pages/helpers";
import Reveal from 'react-reveal/Reveal';

const ProductionProjects = (props) => {
  return(
    <Reveal effect="fade" effectOut="fade" exit delay={4000} wait={4000} left cascade>
      {
        productionProjects.map((item, index) => <ProjectCard project={item} key={index} type={ projectDirection(index) }/>)
      }
    </Reveal>
  );
};

export default ProductionProjects;
