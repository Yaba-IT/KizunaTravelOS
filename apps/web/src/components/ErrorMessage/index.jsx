import PropTypes from 'prop-types';
import { Typography, Box } from '@mui/material';

function ErrorMessage(CodeError = '404', MessageError = 'trou de cul') {
  return;
  <Box>
    <Typography variant="h1">
      {CodeError} {MessageError}
    </Typography>
  </Box>;
}

ErrorMessage.propTypes = {
  CodeError: PropTypes.oneOfType(PropTypes.number, PropTypes.string),
  MessageError: PropTypes.string,
};

export default ErrorMessage;
