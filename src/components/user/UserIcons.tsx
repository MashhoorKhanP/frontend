import React, { useState } from "react";
import { Avatar, Badge, Box, IconButton, Tooltip } from "@mui/material";
import { FavoriteBorder } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "../../store/types";
import UserMenu from "./UserMenu";
import useCheckToken from "../hooks/useCheckToken";

const UserIcons: React.FC = () => {
  useCheckToken;
  const { currentUser } = useSelector((state: RootState) => state.user);
  console.log(currentUser?.firstName)
  const [anchorUserMenu, setAnchorUserMenu] = useState<HTMLElement | null>(
    null
  );
  return (
    <Box>
      <Tooltip title="Wishlist">
        <IconButton size="large" color="inherit">
        <Badge color="error" badgeContent={15}>
          <FavoriteBorder
            sx={{ display: { color: "#000000", fontSize: 26 } }}
          />
        </Badge>
      </IconButton>
      </Tooltip>
      
      <Tooltip title="User Profile">
        <IconButton onClick={(e) => setAnchorUserMenu(e.currentTarget)}>
          <Avatar
            src={currentUser?.profileImage}
            alt={currentUser?.firstName}
            sx={{
              width: 32,
              height: 32,
            }}
          >
            {currentUser?.firstName?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <UserMenu
        anchorUserMenu={anchorUserMenu}
        setAnchorUserMenu={setAnchorUserMenu}
      />
    </Box>
  );
};

export default UserIcons;
