import React from 'react';
import ReactDOM from 'react-dom';
import './index.sass';
import App from './App';
import * as serviceWorker from './serviceWorker';
require('dotenv').config();

ReactDOM.render(<App />, document.getElementById('root'));
serviceWorker.unregister();
