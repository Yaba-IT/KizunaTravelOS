import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { Typography, MenuItem, Menu, Button, Box } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { IsExternalLink } from '../../utils/IsExternalLink';

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}));

function NavBtnItem({ name, target, sub }, ...props) {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClickExpend = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleCloseExpend = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(null);
  };

  const NavigateToLink = () => {
    if (IsExternalLink(target)) {
      window.open(target)
    } else {
      navigate(target);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        disableElevation
        sx={{ my: 2, backgroundColor: "#152e44" }}
        onClick={NavigateToLink}
        {...props}
        endIcon={sub &&
          <Box data-testid="btn-menu" onClick={handleClickExpend} color='inherit' display={'flex'} alignItems={'center'}>
            {open ? <ExpandLess /> : <ExpandMore />}
          </Box>
        }
      >
        <Typography variant='body1' sx={{ textTransform: "capitalize" }}>
          {name}
        </Typography>

      </Button>
      {sub && (
        <StyledMenu
          slotProps={{
            list: {
              'aria-labelledby': 'scrollBtn',
            },
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseExpend}
        >
          {
            sub?.map((item) => (
              <MenuItem onClick={handleCloseExpend} disableRipple>
                {item?.name ?? "na"}
              </MenuItem>
            ))
          }
        </StyledMenu>
      )}
    </>
  );
}

NavBtnItem.propTypes = {
  name: PropTypes.string.isRequired,
  target: PropTypes.string,
  sub: PropTypes.arr
}

export default NavBtnItem;