import * as React from 'react';
import { List, ListItemButton, ListItemText, Collapse, Box, IconButton } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useHandleNavigate } from '../../hooks/useHandleNavigate';

function NavBtnList({ lists }) {

  const [openList, setOpenList] = React.useState({});

  const handleClick = (e, name) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenList((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleNavigate = useHandleNavigate();

  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      {lists.map((list) => (
        <Box data-testid="list-item" key={list.name}>
          <ListItemButton>
            <ListItemText primary={list.name} onClick={() => handleNavigate(list.target)} />

            {list.sub &&
              <IconButton onClick={(e) => handleClick(e, list.name)}>
                {openList[list.name] ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            }
          </ListItemButton>

          {list.sub && (
            <Collapse in={openList[list.name]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {list.sub.map((subItem, subIndex) => (
                  <ListItemButton key={subIndex} sx={{ pl: 4 }} onClick={() => handleNavigate(subItem.target)}>
                    <ListItemText primary={subItem.name} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          )}
        </Box>
      ))}
    </List>
  );
}

export default NavBtnList;