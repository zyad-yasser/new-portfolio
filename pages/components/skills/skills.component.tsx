import * as React from 'react';
const styles = require("./skills.component.sass");

const Skills = (props) => {
  return (
    <div className={`d-flex align-items-center justify-content-center w-100 ${styles.skills}`}>
      <div className={`d-flex align-items-center justify-content-center w-100 ${styles.about}`}>
        <div className={`text-left container ${styles.centeredContent}`}>
          <div className={`w-100 mx-auto text-center ${styles.title}`}>
            <div className={`w-100 ${styles.text}`}>
              Skills
            </div>
            <div className={`w-7 mx-auto ${styles.liner}`} />
          </div>
          <div className={`w-100 mt-5 d-flex align-items-center justify-content-between ${styles.skillsContent}`}>
            <div className={`p-4 h-100 d-flex align-items-center position-relative ${styles.leftContent}`}>
              <div className={`text-left d-flex align-items-center justify-content-between position-absolute w-100 ${styles.controllers}`}>
                <div className={`d-flex align-items-center justify-content-center ${styles.prev}`}>
                  <i className="lni-chevron-left" />
                </div>
                <div className={`d-flex align-items-center justify-content-center ${styles.next}`}>
                  <i className="lni-chevron-right" />
                </div>
              </div>
              <div>
                <div className={`d-flex align-items-center justify-content-start ${styles.title}`}>
                  <div className={`d-flex align-items-center justify-content-center ${styles.icon}`} />
                  <div className={`${styles.text} ml-2 h-100 mt-4`}>
                    <div className={`w-100 ${styles.head}`}>
                      MEAN stack development
                    </div>
                    <div className={`w-100 mt-2 ${styles.info}`}>
                      All about full stack development using Angular / NodeJS
                    </div>
                  </div>
                </div>
                <div className={`mt-2 p-3 ${styles.content}`}>
                  Starting from backend development using the amazing <strong>Node.js</strong> runtime, to frontend development using <strong>Angular (latest)</strong> the most powerful beloved framework, and finally we neverforget about database design and queries using MongoDB.
                </div>
              </div>
            </div>
            <div className={`h-100 d-flex align-items-center justify-content-center ${styles.rightContent}`}>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skills;