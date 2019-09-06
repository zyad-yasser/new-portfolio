import Navbar from "../navbar/navbar.component";
import Footer from "../footer/footer.component";
const styles = require('./layout.component.sass');

const Layout = (props) => (
  <div className={`d-flex ${styles.mainContainer}`}>
    <Navbar />
    <div className="flex-grow-1 h-100">
      { props.children }
    </div>
    <Footer />
  </div>
)

export default Layout