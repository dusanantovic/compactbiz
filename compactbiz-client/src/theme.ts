import { createTheme, responsiveFontSizes } from "@mui/material";

let muiTheme = createTheme({
    palette: {
        primary: {
            main: "#001f40",
            light: "#01254d",
            dark: "#011a36",
            contrastText: "#ffffff"
        },
        secondary: {
            main: "#a2e3cc",
            light: "#b8ead6",
            dark: "#7dcfb0",
            contrastText: "#001f40"
        },
        background: {
            default: "#ECF0F5",
            paper: "#ffffff"
        },
        text: {
            primary: "#1e293b",
            secondary: "#e2e8f0"
        },
        divider: "rgba(0,0,0,0.07)"
    },
    spacing: (value: number) => value * 8,
    shape: {
        borderRadius: 8
    },
    components: {
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: "none !important"
                } as any
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 8
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)"
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    borderRadius: 12
                },
                elevation1: {
                    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)"
                }
            }
        },
        MuiCssBaseline: {
            styleOverrides: {
                [`& .tabbed-form .MuiCardContent-root`]: {
                    height: `calc(100vh - 200px)`,
                    overflowY: "auto"
                }
            }
        },
        MuiTableRow: {
            styleOverrides: {
                head: {
                    height: "56px",
                    "& span:first-child": {
                        fontWeight: "bold !important",
                        fontSize: "15px"
                    }
                },
                root: {
                    height: "40px"
                }
            }
        }
    }
});

muiTheme = responsiveFontSizes(muiTheme);

export const theme = muiTheme;
