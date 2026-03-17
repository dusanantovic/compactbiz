import { ListItemButton, ListItemText, styled } from "@mui/material";

export const MenuListItemButton = styled(ListItemButton)(({ theme }) => ({
    margin: "1px 10px",
    borderRadius: "8px",
    padding: "9px 12px",
    transition: "background-color 0.15s ease",
    "&.Mui-selected": {
        backgroundColor: "rgba(162, 227, 204, 0.14) !important",
        "& .MuiListItemText-primary": {
            color: "#d4f5ea",
            fontWeight: 600
        },
        "& .MuiListItemIcon-root svg": {
            color: `${theme.palette.secondary.main} !important`
        },
        "&:hover": {
            backgroundColor: "rgba(162, 227, 204, 0.2) !important"
        }
    },
    "&:hover:not(.Mui-selected)": {
        backgroundColor: "rgba(255,255,255,0.06) !important"
    },
    "& .MuiListItemText-primary": {
        color: "rgba(255,255,255,0.72)",
        fontSize: "13.5px",
        fontWeight: 500,
        letterSpacing: "0.01em"
    },
    "& .MuiListItemIcon-root": {
        minWidth: "34px",
        "& svg": {
            color: "rgba(255,255,255,0.4)",
            fontSize: "18px",
            transition: "color 0.15s ease"
        }
    },
    "& > svg": {
        color: "rgba(255,255,255,0.28)",
        fontSize: "16px",
        flexShrink: 0
    }
}));

export const MenuListItemSubButton = styled(ListItemButton)(({ theme }) => ({
    margin: "1px 10px 1px 24px",
    borderRadius: "7px",
    padding: "8px 12px",
    transition: "background-color 0.15s ease",
    "&.Mui-selected": {
        backgroundColor: "rgba(162, 227, 204, 0.14) !important",
        "& .MuiListItemText-primary": {
            color: "#d4f5ea",
            fontWeight: 600
        },
        "& .MuiListItemIcon-root svg": {
            color: `${theme.palette.secondary.main} !important`
        },
        "&:hover": {
            backgroundColor: "rgba(162, 227, 204, 0.2) !important"
        }
    },
    "&:hover:not(.Mui-selected)": {
        backgroundColor: "rgba(255,255,255,0.06) !important"
    },
    "& .MuiListItemText-primary": {
        color: "rgba(255,255,255,0.6)",
        fontSize: "13px",
        fontWeight: 500
    },
    "& .MuiListItemIcon-root": {
        minWidth: "28px",
        "& svg": {
            color: "rgba(255,255,255,0.35)",
            fontSize: "15px"
        }
    }
}));

export const MenuGroupHeader = styled("div")({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 16px 5px",
    cursor: "pointer",
    userSelect: "none",
    "& svg": {
        color: "rgba(255,255,255,0.28)",
        fontSize: "14px",
        transition: "transform 0.2s ease"
    },
    "&:hover .group-label": {
        color: "rgba(255,255,255,0.55)"
    }
});

export const MenuGroupLabel = styled("span")({
    fontSize: "10.5px",
    fontWeight: 700,
    letterSpacing: "0.09em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.35)",
    transition: "color 0.15s ease",
    lineHeight: 1
});

export const MenuListItemText = styled(ListItemText)({
    margin: 0
});

export const MenuListItemSubText = styled(ListItemText)({
    margin: 0
});
