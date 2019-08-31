import Layout from './components/Layout';
import Link from 'next/link';
import axios from 'axios';
import '../assets/sass/index.sass';

const ShowLink = ({ movie }) => (
  <li key={movie.id}>
    <Link as={`/p/${movie.id}`} href={`/post?id=${movie.id}`}>
      <a>{movie.name}</a>
    </Link>
  </li>
);

const Index = (props) => (
  <Layout>
    <h1>Test SSR</h1>
    {/* {JSON.stringify(props.url.query)}  */}
    <ul>
      {props.movies.map((movie) => (
        <ShowLink key={movie.id} movie={movie} />
      ))}
    </ul>
  </Layout>
);

Index.getInitialProps = async function() {
  const res = await axios.get('https://api.tvmaze.com/search/shows?q=ironman');
  const data = res.data.map(item => item.show);
  return {
    movies: data
  }
};

export default Index;