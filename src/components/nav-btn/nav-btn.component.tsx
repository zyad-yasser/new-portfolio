import { HOVER_NAV_BUTTON, TOGGLE_MENU } from "@/store/types";
import { useDispatch, useSelector } from "react-redux";
import styles from "./nav-btn.module.sass";
const NavBtn = (props) => {
  const ui = useSelector((state: any) => state.ui);
  const dispatch: any = useDispatch();
  return (
    <div className={`d-flex justify-content-center align-items-center ${styles.navMenu}`}>
      <div
        className={`${styles.navIcon} ${ui.isOpen && styles.open} ${ui.isHover && styles.hover}`}
        onClick={() =>
          dispatch({
            type: TOGGLE_MENU,
          })
        }
        onMouseEnter={() =>
          dispatch({
            type: HOVER_NAV_BUTTON,
          })
        }
        onMouseLeave={() =>
          dispatch({
            type: HOVER_NAV_BUTTON,
          })
        }
      >
        <div />
        <div />
        <div />
      </div>
    </div>
  );
};

export default NavBtn;
