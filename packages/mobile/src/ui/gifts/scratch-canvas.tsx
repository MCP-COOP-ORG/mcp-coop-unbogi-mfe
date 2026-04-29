import {
  Blur,
  Canvas,
  Group,
  Image,
  matchFont,
  Rect,
  type SkImage,
  Skia,
  Path as SkiaPath,
  Text as SkiaText,
  type SkPath,
  useImage,
} from '@shopify/react-native-skia';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

const BRUSH_SIZE = 50;
const CLEAR_THRESHOLD = 0.6;
const HOLD_DELAY_MS = 150;
const BLUR_RADIUS = 8;
const LOGO_SIZE = 160;
const BG_COLOR = '#FAF6EE';
const FROST_TINT = 'rgba(250, 246, 238, 0.3)';

const fontFamily = Platform.select({ ios: 'Helvetica Neue', default: 'sans-serif' });
const labelFont = matchFont({ fontFamily, fontSize: 20, fontWeight: 'bold' } as const);

/** Fetch remote image via RN's HTTP stack → convert to SkImage */
function useRemoteSkImage(url: string | undefined): SkImage | null {
  const [image, setImage] = useState<SkImage | null>(null);
  useEffect(() => {
    console.log('[ScratchCanvas] useRemoteSkImage called, url:', url ? url.substring(0, 80) + '...' : 'undefined');
    if (!url) return;
    let cancelled = false;
    console.log('[ScratchCanvas] Starting fetch...');
    fetch(url)
      .then((res) => {
        console.log('[ScratchCanvas] fetch response status:', res.status, 'ok:', res.ok);
        return res.arrayBuffer();
      })
      .then((buf) => {
        console.log('[ScratchCanvas] arrayBuffer received, size:', buf.byteLength);
        if (cancelled) return;
        const data = Skia.Data.fromBytes(new Uint8Array(buf));
        console.log('[ScratchCanvas] Skia.Data created:', !!data);
        const img = Skia.Image.MakeImageFromEncoded(data);
        console.log(
          '[ScratchCanvas] MakeImageFromEncoded result:',
          !!img,
          img ? `${img.width()}x${img.height()}` : 'null',
        );
        if (img) setImage(img);
      })
      .catch((err) => {
        console.error('[ScratchCanvas] fetch error:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return image;
}

interface ScratchCanvasProps {
  onReveal: () => void;
  isRevealed: boolean;
  imageUrl?: string;
  isLocked?: boolean;
}

export function ScratchCanvas({ onReveal, isRevealed, isLocked, imageUrl }: ScratchCanvasProps) {
  const [layout, setLayout] = useState({ width: 300, height: 400 });
  const { width, height } = layout;

  const logoImage = useImage(require('../../../assets/logo-7.png'));
  const postcardImage = useRemoteSkImage(imageUrl);
  const layerPaint = useMemo(() => Skia.Paint(), []);

  console.log(
    '[ScratchCanvas] render — imageUrl:',
    imageUrl ? 'YES' : 'NO',
    'postcardImage:',
    !!postcardImage,
    'logoImage:',
    !!logoImage,
    'layout:',
    width,
    'x',
    height,
  );

  const scratchPath = useSharedValue<SkPath>(Skia.Path.Make());
  const totalLength = useSharedValue(0);
  const lastPt = useSharedValue({ x: 0, y: 0 });
  const hasRevealed = useSharedValue(false);

  const fireReveal = useCallback(() => {
    if (!hasRevealed.value) {
      hasRevealed.value = true;
      onReveal();
    }
  }, [onReveal, hasRevealed]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(HOLD_DELAY_MS)
        .minDistance(0)
        .enabled(!isRevealed && !isLocked)
        .onStart((e) => {
          'worklet';
          if (hasRevealed.value) return;
          const p = scratchPath.value.copy();
          p.moveTo(e.x, e.y);
          p.addCircle(e.x, e.y, BRUSH_SIZE / 2);
          scratchPath.value = p;
          lastPt.value = { x: e.x, y: e.y };
        })
        .onUpdate((e) => {
          'worklet';
          if (hasRevealed.value) return;
          const p = scratchPath.value.copy();
          p.lineTo(e.x, e.y);
          scratchPath.value = p;

          const dx = e.x - lastPt.value.x;
          const dy = e.y - lastPt.value.y;
          totalLength.value += Math.sqrt(dx * dx + dy * dy);
          lastPt.value = { x: e.x, y: e.y };

          if ((BRUSH_SIZE * totalLength.value) / (width * height) >= CLEAR_THRESHOLD) {
            runOnJS(fireReveal)();
          }
        }),
    [width, height, isRevealed, isLocked, fireReveal, scratchPath, totalLength, lastPt, hasRevealed],
  );

  if (isRevealed) return null;

  const showContent = !isLocked;
  const labelText = 'READY TO SCRATCH';
  const labelW = labelFont.measureText(labelText).width;
  const groupH = LOGO_SIZE + 32;
  const groupTop = height / 2 - groupH / 2;

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          if (w > 0 && h > 0) setLayout({ width: w, height: h });
        }}
      >
        <Canvas style={{ flex: 1 }}>
          <Group layer={layerPaint}>
            {/* Blurred postcard or cream fallback */}
            {postcardImage ? (
              <>
                <Image image={postcardImage} x={0} y={0} width={width} height={height} fit="cover">
                  <Blur blur={BLUR_RADIUS} mode="clamp" />
                </Image>
                <Rect x={0} y={0} width={width} height={height} color={FROST_TINT} />
              </>
            ) : (
              <Rect x={0} y={0} width={width} height={height} color={BG_COLOR} />
            )}

            {/* Logo */}
            {showContent && logoImage && (
              <Image
                image={logoImage}
                x={width / 2 - LOGO_SIZE / 2}
                y={groupTop}
                width={LOGO_SIZE}
                height={LOGO_SIZE}
                fit="contain"
              />
            )}

            {/* Label */}
            {showContent && labelFont && (
              <SkiaText
                x={width / 2 - labelW / 2}
                y={groupTop + LOGO_SIZE + 24}
                text={labelText}
                font={labelFont}
                color="black"
              />
            )}

            {/* Scratch eraser — dstOut = same as TMA's destination-out */}
            <SkiaPath
              path={scratchPath}
              strokeWidth={BRUSH_SIZE}
              style="stroke"
              strokeJoin="round"
              strokeCap="round"
              color="white"
              blendMode="dstOut"
            />
          </Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
}
