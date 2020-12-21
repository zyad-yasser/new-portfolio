import Navbar from "../navbar/navbar.component";
import Footer from "../footer/footer.component";
import MegaMenu from "../mega-menu/mega-menu.component";
const styles = require('./layout.module.sass');

const Layout = (props) => (
  <div className={`d-flex position-relative justify-content-center ${styles.mainContainer}`}>
    <MegaMenu />
    <Navbar />
    <div className={`flex-grow-1 h-100 content-main ${styles.customScroll}`}>
      {props.children}
    </div>
    <Footer />
  </div>
)

export default Layout
