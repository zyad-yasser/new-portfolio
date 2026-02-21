import { SocaialMediaAccount } from "@/models";
import styles from "./social-media-icon.module.sass";

const SocialMediaIcon = ({
  data: { value, icon, color: backgroundColor },
}: { data: SocaialMediaAccount }) => {
  const navigator = (value: string) => () => window.open(value, "_blank");
  return (
    <div
      className={`d-flex align-items-center justify-content-center ${styles.account}`}
      onClick={navigator(value)}
      style={{ backgroundColor }}
    >
      <i className={icon} />
    </div>
  );
};

export default SocialMediaIcon;
