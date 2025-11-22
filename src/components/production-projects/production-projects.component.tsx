"use client";

import { motion } from "framer-motion";
import { projectDirection } from "../../helpers";
import { productionProjects } from "../../statics";
import ProjectCard from "../project-card/project-card.component";

const ProductionProjects = () => {
  return (
    <div>
      {productionProjects.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{
            duration: 0.6,
            delay: index * 0.1,
            ease: "easeOut",
          }}
        >
          <ProjectCard project={item} type={projectDirection(index)} />
        </motion.div>
      ))}
    </div>
  );
};

export default ProductionProjects;
