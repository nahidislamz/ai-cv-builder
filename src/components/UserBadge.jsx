import React from "react";
import { Chip, ThemeProvider, useTheme } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import { motion } from "framer-motion";

const UserBadge = ({ isPremiumUser }) => {
  const theme = useTheme()

  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 300, damping: 20 }
  };

  const MotionChip = motion(Chip);

  return (
    <ThemeProvider theme={theme}>
      {isPremiumUser ? (
        <MotionChip
          icon={<StarIcon />}
          label="Premium User"
          color="secondary"
          variant="filled"
          size="small"
          sx={{
            mb: 1,
            fontWeight: "bold",
            background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
            color: "white",
            boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
            "& .MuiChip-icon": {
              color: "white",
            },
          }}
          initial="initial"
          animate="animate"
          variants={badgeVariants}
        />
      ) : (
        <MotionChip
          icon={<PersonIcon />}
          label="Free User"
          color="primary"
          variant="outlined"
          size="small"
          sx={{
            mb: 1,
            fontWeight: "bold",
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            "& .MuiChip-icon": {
              color: theme.palette.primary.main,
            },
          }}
          initial="initial"
          animate="animate"
          variants={badgeVariants}
        />
      )}
    </ThemeProvider>
  );
};

export default UserBadge;