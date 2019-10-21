import Layout from './components/layout/layout.component';
import './app.component.sass';
import Head from 'next/head'
import Introduction from './components/introduction/introduction.component';
import About from './components/about/about.component';

const Index = (props) => (
  <>
    <Head>
      <title>Zyad Yasser | Portfolio</title>
      <link rel="stylesheet" href="/static/bootstrap.min.css"/>
      <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,700,900&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css?family=Roboto+Condensed&display=swap" rel="stylesheet"/>
      <link rel="shortcut icon" href="/static/favicon.ico" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Layout>
      <Introduction />
      <About />
    </Layout>
  </>
);

export default Index;