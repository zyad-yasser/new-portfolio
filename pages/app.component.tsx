import Layout from './components/layout/layout.component';
import './app.component.sass';
import Head from 'next/head'

const Index = (props) => (
  <>
    <Head>
      <title>Zyad Yasser | Portfolio</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"></link>
      <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,700,900&display=swap" rel="stylesheet"/>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Layout/>
  </>
);

export default Index;