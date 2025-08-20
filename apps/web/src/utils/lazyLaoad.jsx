import { Suspense } from 'react';
import PropTypes from 'prop-types';

function lazyLoad(LazyComponent) {
  if (!LazyComponent) return <div>Loading...</div>;

  return (
    <Suspense fallback={'Loading...'}>
      <LazyComponent />
    </Suspense>
  );
}

lazyLoad.propTypes = {
  LazyComponent: PropTypes.node.isRequired,
};

export default lazyLoad;
