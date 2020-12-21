import { useSelector } from "react-redux";
import NavBtn from "../nav-btn/nav-btn.component";
import HireMe from '../hire-me/hire-me.component';

const styles = require('./navbar.module.sass');
const Navbar = () => {
  const ui = useSelector((state: any) => state.ui);

  return (
    <div className={`d-flex h-100 ${styles.nav} ${ui.isOpen && styles.open}`}>
      <div className={`d-flex justify-content-center align-items-center ${styles.icon}`}>
        ZY
      </div>
      <div className={`${styles.hireMe} align-items-center mr-auto`}>
        <HireMe />
      </div>
      <NavBtn />
    </div>
  );
}

export default Navbar;
