import * as React from 'react';
import { List, ListItemButton, ListItemText, Collapse, Box, IconButton } from '@mui/material';
import { ExpandLess, ExpandMore} from '@mui/icons-material';

function NavBtnList({ lists }) {
  const [openList, setOpenList] = React.useState({});

  const handleClick = (name) => {
    setOpenList((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      {lists.map((list) => (
        <Box data-testid="list-item" key={list.name}>
          <ListItemButton>
            <ListItemText primary={list.name} onClick={() => { handleCloseNavMenu() }} />

            {list.sub &&
              <IconButton onClick={() => handleClick(list.name)}>
                {openList[list.name] ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            }
          </ListItemButton>

          {list.sub && (
            <Collapse in={openList[list.name]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {list.sub.map((subItem, subIndex) => (
                  <ListItemButton key={subIndex} sx={{ pl: 4 }} onClick={() => { handleCloseNavMenu() }}>
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