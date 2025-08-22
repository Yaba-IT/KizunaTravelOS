import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import PropTypes from 'prop-types';

function Section({ 
  id, 
  title, 
  children, 
  maxWidth = 'lg',
  sx = {},
  titleVariant = 'h2',
  titleAlign = 'center',
  spacing = 4,
  ...props 
}) {
  return (
    <Box
      component="section"
      id={id}
      sx={{
        py: spacing,
        ...sx,
      }}
      {...props}
    >
      <Container maxWidth={maxWidth}>
        {title && (
          <Typography
            variant={titleVariant}
            align={titleAlign}
            sx={{
              mb: spacing,
              fontWeight: 'bold',
            }}
          >
            {title}
          </Typography>
        )}
        {children}
      </Container>
    </Box>
  );
}

Section.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  sx: PropTypes.object,
  titleVariant: PropTypes.string,
  titleAlign: PropTypes.oneOf(['left', 'center', 'right', 'justify']),
  spacing: PropTypes.number,
};

export default Section;