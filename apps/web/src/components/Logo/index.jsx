import { Box } from '@mui/material';
import React from 'react';

const Logo = ({srcUrl, ...props}) => {
  const i = srcUrl.split('/').length - 1;
  console.log(i);
  return (
    <Box component={"img"} src={srcUrl} alt={`${srcUrl.split('/')[i]}-image`} {...props} />
  );
}

export default Logo;
