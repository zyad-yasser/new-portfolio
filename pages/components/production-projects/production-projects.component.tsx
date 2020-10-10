import { productionProjects } from "../../../pages/statics";
import * as React from "react";
import ProjectCard from "../project-card/project-card.component";
import { projectDirection } from "../../../pages/helpers";



const ProductionProjects = (props) => {
  return(
    productionProjects.map((item, index) => <ProjectCard project={item} key={index} type={ projectDirection(index) }/>) 
  );
};

export default ProductionProjects;
