import NavBtn from "../nav-btn/nav-btn.component";

const styles = require('./navbar.component.sass');
const Navbar = (props) => {
  return (
    <div className={`d-flex h-100 ${styles.nav}`}>
      <div className={`d-flex justify-content-center align-items-center ${styles.icon}`}>
        ZY
      </div>
      <NavBtn />
    </div>
  );
}

export default Navbar;