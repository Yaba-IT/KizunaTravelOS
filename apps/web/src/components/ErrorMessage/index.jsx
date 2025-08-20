import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';

function ErrorMessage({ errorCode = '404', messageError = 'NOT FOUND' }) {
  return (
    <Typography variant="h3">
      {errorCode} {messageError}
    </Typography>
  );
}

ErrorMessage.propTypes = {
  errorCode: PropTypes.string,
  messageError: PropTypes.string,
};

export default ErrorMessage;
