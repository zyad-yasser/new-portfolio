import { assetsPrefixUrl } from "../../constants";

interface TechnologyIconProps {
  technology: string;
}

const TechnologyIcon = ({ technology }: TechnologyIconProps) => {
  return (
    <div className="flex justify-center items-center p-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors group">
      <img
        src={`${assetsPrefixUrl}/icons/${technology}.png`}
        width="17"
        height="17"
        alt={technology}
        title={technology}
        className="object-contain"
      />
      <span className="ml-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        {technology}
      </span>
    </div>
  );
};

export default TechnologyIcon;
