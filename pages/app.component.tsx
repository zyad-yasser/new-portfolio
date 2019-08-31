import Layout from './components/layout/layout.component';
import './app.component.sass';
import Head from 'next/head'

const Index = (props) => (
  <>
    <Head>
      <title>Zyad Yasser | Portfolio</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Layout/>
  </>
);

export default Index;