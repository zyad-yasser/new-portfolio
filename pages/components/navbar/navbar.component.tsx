const styles = require('./navbar.component.sass');
const Navbar = (props) => {
  return (
    <div className={`d-flex h-100 ${styles.nav}`}>
      <div className={`d-flex justify-content-center align-items-center ${styles.icon}`}>
        ZY
      </div>
      <div className={`d-flex justify-content-center align-items-center ${styles.navMenu}`}>
        <div className={`${styles.navIcon}`}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;