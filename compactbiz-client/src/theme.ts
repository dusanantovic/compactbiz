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
        },
        MuiCollapse:{
            styleOverrides: {
                root: {
                    transition: "none"
                }
            }
        },
        MuiTextField: {
            defaultProps: {
                variant: "outlined" as const,
                fullWidth: true,
                margin: "none" as const
            }
        },
        MuiFormControl: {
            defaultProps: {
                variant: "outlined" as const,
                fullWidth: true,
                margin: "none" as const
            }
        },
        MuiSelect: {
            defaultProps: {
                variant: "outlined" as const
            }
        },
        MuiInputBase: {
            styleOverrides: {
                input: {
                    "&[type=number]": {
                        padding: "16.5px 14px"
                    }
                }
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: "#ffffff",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#001f40"
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#001f40",
                        borderWidth: 2
                    },
                    "&.Mui-disabled": {
                        backgroundColor: "#f1f5f9"
                    }
                },
                notchedOutline: {
                    borderColor: "rgba(0,0,0,0.18)"
                }
            }
        },
        MuiFilledInput: {
            styleOverrides: {
                root: {
                    borderRadius: "8px 8px 0 0",
                    backgroundColor: "#f8fafc",
                    "&:hover": {
                        backgroundColor: "#f1f5f9"
                    },
                    "&.Mui-focused": {
                        backgroundColor: "#f1f5f9"
                    }
                }
            }
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    color: "#64748b",
                    "&.Mui-focused": {
                        color: "#001f40"
                    }
                }
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    "&.Mui-focused": {
                        color: "#001f40"
                    }
                }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                root: {
                    width: "100%"
                },
                paper: {
                    borderRadius: 8,
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)"
                }
            }
        },
        // React-admin component defaults
        RaTextInput: {
            defaultProps: {
                fullWidth: true,
                variant: "outlined"
            }
        } as any,
        RaSelectInput: {
            defaultProps: {
                fullWidth: true,
                variant: "outlined"
            },
            styleOverrides: {
                root: {
                    marginTop: "0 !important",
                    marginBottom: "0 !important"
                }
            }
        } as any,
        RaNumberInput: {
            defaultProps: {
                fullWidth: true,
                variant: "outlined",
                size: "medium"
            }
        } as any,
        RaAutocompleteInput: {
            defaultProps: {
                fullWidth: true,
                variant: "outlined"
            }
        } as any
    }
});

muiTheme = responsiveFontSizes(muiTheme);

export const theme = muiTheme;
