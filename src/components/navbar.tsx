import * as React from 'react';

export default class GeneralErrorComponent extends React.Component {
  render () {
    return (
      <div className="error-conainer w-100 d-flex align-items-center justify-content-center fonter-12">
        Error in audio record device
      </div>
    );
  }
}