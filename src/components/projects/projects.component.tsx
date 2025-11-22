import { projectsTabs } from "../../statics";
import Tabs from "../tabs/tabs.component";

const Projects = (props) => {
  return (
    <div className="flex items-center justify-center w-full p-4 py-20">
      <div className="flex items-center justify-center w-full">
        <div className="text-left max-w-6xl mx-auto px-4">
          <div className="w-full mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">Projects</h2>
            <div className="w-16 h-1 bg-primary mx-auto mb-12" />
            <div className="content mt-12">
              <Tabs tabs={projectsTabs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
