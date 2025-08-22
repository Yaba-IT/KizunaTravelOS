import React from 'react';
import { Box, Container } from '@mui/material';
import PropTypes from 'prop-types';

function SectionWrapper({ 
  children, 
  useContainer = true,
  maxWidth = 'lg',
  sx = {},
  ...props 
}) {
  const content = (
    <Box
      sx={{
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );

  if (useContainer) {
    return (
      <Container maxWidth={maxWidth}>
        {content}
      </Container>
    );
  }

  return content;
}

SectionWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  useContainer: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  sx: PropTypes.object,
};

export default SectionWrapper;