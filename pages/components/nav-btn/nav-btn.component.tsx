const styles = require("./nav-btn.component.sass");
import { useSelector, useDispatch } from "react-redux";
import { TOGGLE_MENU, HOVER_NAV_BUTTON } from "../../../pages/store/types";
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
