import { assetsPrefixUrl } from '../../constants';
import * as React from 'react';
import TechnologyIcon from '../technology-icon/technology-icon.component';
import styles from "./project-card.module.sass";

const ProjectCard = ({ project, type }) => {
  const { link, subProjects, colors, technologies, name, image, description } = project;
  const [name1, name2] = name.split(" ");
  const [mainColor = "#FFF", secondaryColor = "#d34947"] = colors;
  const projectNavigate = (link) => {
    window.open(link, '_blank');
  }
  return (
    <div className={`my-5 d-flex justify-content-center align-items-center ${styles.oneProject} ${type === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`d-flex flex-column justify-content-center align-items-center ${styles.text}`}>
        <div className={`d-flex justify-content-center align-items-center mb-3 w-75 ${styles.description}`}>
          {description}
        </div>
        <div className={`d-flex flex-column ${styles.name} ${styles[type]}`}>
          <span style={{color: mainColor}}>{name1}</span>
          <span style={{color: secondaryColor}}>{name2}</span>
        </div>
        <div className={`d-flex justify-content-center align-items-center ${styles.technologies}`}>
          {technologies.map((item, index) => <TechnologyIcon key={index} technology={item}/>)}
        </div>
        {link && <div className={`d-flex justify-content-center align-items-center mt-4 ${styles.link}`}>
          <i className="lni-arrow-left mr-4"></i>
          Learn more
        </div>}
        {
          subProjects && subProjects.length && <div className={`${styles.subProjects} text-left mt-4`}>
            {
              subProjects
                .sort((a, b) => a.link > b.link ? 1 : -1)
                .map(({name: subName, link}, index) => (
                  <div key={index} onClick={projectNavigate.bind(null, link)} className={`d-flex align-items-center justify-content-start ${styles.subProject} ${link ? styles['link'] : ''}`}>
                    <div className="dot red mr-1" />
                    <span>{subName}</span>
                  </div>
                ))
            }
          </div>
        }
      </div>
      <div className={`${styles.image}`} style={{ backgroundImage: `url(${assetsPrefixUrl}${image})` }}/>
    </div>
  );
}

export default ProjectCard;
