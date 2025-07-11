/// <reference types="vite/client" />
import "@mui/material/styles";
import "@mui/material/Typography";

declare module "@mui/material/styles" {
    interface TypographyVariants {
        label: React.CSSProperties;
    }

    // allow configuration using `createTheme`
    interface TypographyVariantsOptions {
        label?: React.CSSProperties;
    }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
    interface TypographyPropsVariantOverrides {
        label: true;
    }
}
