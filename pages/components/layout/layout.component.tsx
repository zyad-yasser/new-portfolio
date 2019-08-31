import Navbar from "../navbar/navbar.component";
import Footer from "../footer/footer.component";

const Layout = (props) => (
  <div>
    <Navbar />
    <div className="content">
      { props.children }
    </div>
    <Footer />
  </div>
)

export default Layout