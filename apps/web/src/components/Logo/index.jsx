import React from 'react';
import { Box } from '@mui/material';

function Logo ({srcUrl, ...props}) {
  return (
    <Box component={"img"} src={srcUrl} alt={'logo'} {...props} />
  );
}

export default Logo;
