import { productionProjects } from "../../statics";
import * as React from "react";
import ProjectCard from "../project-card/project-card.component";
import { projectDirection } from "../../helpers";
import Reveal from 'react-reveal/Reveal';

const ProductionProjects = (props) => {
  return(
    <Reveal effect="fade" effectOut="fade" left cascade>
      {
        productionProjects.map((item, index) => <ProjectCard project={item} key={index} type={ projectDirection(index) }/>)
      }
    </Reveal>
  );
};

export default ProductionProjects;
