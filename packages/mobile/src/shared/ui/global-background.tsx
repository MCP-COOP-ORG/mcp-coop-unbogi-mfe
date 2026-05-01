import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

const BG_PATTERN = require('../../../assets/bg-pattern-3.png');

// ── Gradient colors (brand palette — not in generic tokens) ─────────────────────
const GRADIENT = {
  /** Top-left cyan */
  cyan: 'rgb(15, 231, 234)',
  /** Bottom-right yellow */
  yellow: 'rgb(221, 201, 19)',
  /** Center purple */
  purple: 'rgb(106, 44, 164)',
  /** Polka dot fill */
  polka: 'rgba(129, 24, 205, 0.2)',
} as const;

interface GlobalBackgroundProps {
  children?: React.ReactNode;
}

/**
 * Full-screen gradient + polka dots + cake pattern overlay.
 * Extracted from root `_layout.tsx`. Render once in the layout —
 * all screens see through via transparent backgrounds.
 */
function GlobalBackgroundComponent({ children }: GlobalBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* 1. SVG gradients & polka dots */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="grad1" cx="0%" cy="0%" r="130%" fx="0%" fy="0%">
            <Stop offset="0%" stopColor={GRADIENT.cyan} stopOpacity="0.91" />
            <Stop offset="100%" stopColor={GRADIENT.cyan} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad2" cx="100%" cy="100%" r="130%" fx="100%" fy="100%">
            <Stop offset="0%" stopColor={GRADIENT.yellow} stopOpacity="0.89" />
            <Stop offset="100%" stopColor={GRADIENT.yellow} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad3" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={GRADIENT.purple} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={GRADIENT.purple} stopOpacity="0" />
          </RadialGradient>

          <Pattern id="polka-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <Circle cx="12" cy="12" r="2" fill={GRADIENT.polka} />
          </Pattern>
        </Defs>

        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad3)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#polka-dots)" />
      </Svg>

      {/* 2. Cake pattern overlay */}
      <ImageBackground source={BG_PATTERN} style={StyleSheet.absoluteFill} imageStyle={styles.patternImage} />

      {children}
    </View>
  );
}

export const GlobalBackground = React.memo(GlobalBackgroundComponent);

const styles = StyleSheet.create({
  patternImage: {
    resizeMode: 'repeat',
    opacity: 0.9,
  },
});
