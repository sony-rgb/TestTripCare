import { Platform } from 'react-native';

// Falls back to system fonts if DM Sans hasn't loaded
const fontFamily = Platform.select({
  ios: 'DMSans-Regular',
  android: 'DMSans-Regular',
  default: 'System',
});

export const Fonts = {
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  semiBold: 'DMSans-SemiBold',
  bold: 'DMSans-Bold',
};

export const Typography = {
  // Logo / brand
  logo: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    letterSpacing: -0.5,
  },

  // Headers
  h1: { fontFamily: Fonts.bold, fontSize: 22 },
  h2: { fontFamily: Fonts.semiBold, fontSize: 18 },
  h3: { fontFamily: Fonts.semiBold, fontSize: 16 },
  h4: { fontFamily: Fonts.medium, fontSize: 15 },

  // Body
  bodyLg: { fontFamily: Fonts.regular, fontSize: 15 },
  body: { fontFamily: Fonts.regular, fontSize: 14 },
  bodySm: { fontFamily: Fonts.regular, fontSize: 13 },
  bodyXs: { fontFamily: Fonts.regular, fontSize: 12 },

  // Labels
  label: { fontFamily: Fonts.medium, fontSize: 13 },
  labelSm: { fontFamily: Fonts.medium, fontSize: 12 },
  caption: { fontFamily: Fonts.regular, fontSize: 11 },

  // Buttons
  btnLg: { fontFamily: Fonts.semiBold, fontSize: 16 },
  btn: { fontFamily: Fonts.semiBold, fontSize: 14 },
  btnSm: { fontFamily: Fonts.medium, fontSize: 13 },
};
