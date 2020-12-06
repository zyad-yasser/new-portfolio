import styles from "./nav-btn.module.sass";
import { HOVER_NAV_BUTTON, TOGGLE_MENU } from "@/store/types";
import { useSelector, useDispatch } from "react-redux";
const NavBtn = props => {
  const ui = useSelector((state: any) => state.ui);
  const dispatch: any = useDispatch();
  return (
    <div
      className={`d-flex justify-content-center align-items-center ${styles.navMenu}`}
    >
      <div
        className={`${styles.navIcon} ${ui.isOpen && styles.open} ${ui.isHover && styles.hover}`}
        onClick={
          () => dispatch({
            type: TOGGLE_MENU
          })
        }
        onMouseEnter={
          () => dispatch({
            type: HOVER_NAV_BUTTON
          })
        }
        onMouseLeave={
          () => dispatch({
            type: HOVER_NAV_BUTTON
          })
        }
      >
        <div/>
        <div/>
        <div/>
      </div>
    </div>
  );
};

export default NavBtn;
