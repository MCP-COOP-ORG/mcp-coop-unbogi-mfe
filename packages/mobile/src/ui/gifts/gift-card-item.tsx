import Clipboard from '@react-native-clipboard/clipboard';
import type { GiftRecord } from '@unbogi/shared';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { FlipFlap } from './flip-flap';
import { LockOverlay } from './lock-overlay';
import { ScratchCanvas } from './scratch-canvas';
import type { GiftScreenStrategy } from './strategies';

const BG_COLOR = '#FAF6EE';
const BORDER_COLOR = '#000000';
const TEXT_DARK = '#1A1A1A';

interface GiftCardItemProps {
  gift: GiftRecord;
  strategy: GiftScreenStrategy;
  isUnlocked: boolean;
  isScratched: boolean;
  onScratched: (id: string) => void;
  resolveHoliday: (id: string) => string;
}

export function GiftCardItem({
  gift,
  strategy,
  isUnlocked,
  isScratched,
  onScratched,
  resolveHoliday,
}: GiftCardItemProps) {
  const [isFlippedManually, setIsFlippedManually] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    Clipboard.setString(gift.scratchCode.value ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSurprises = strategy.name === 'surprises';
  const isLocked = isSurprises && !isUnlocked;

  const fullyRevealed = strategy.name === 'collection' || (isUnlocked && isScratched);
  const showBack = fullyRevealed && isFlippedManually;

  const formattedDate = new Date(gift.unpackDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const front = (
    <View style={styles.cardFront}>
      <View style={styles.imageContainer}>
        {gift.imageUrl ? (
          <Image source={{ uri: gift.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder} />
        )}

        {isSurprises && !isScratched && (
          <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', zIndex: 10 }]}>
            <ScratchCanvas
              isRevealed={isScratched}
              onReveal={() => onScratched(gift.id)}
              imageUrl={gift.imageUrl}
              isLocked={isLocked}
            />
          </View>
        )}
      </View>

      <View style={styles.bottomLabelContainer}>
        <Text style={styles.bottomLabelText}>
          {gift.senderName && `from ${gift.senderName}`}
          {gift.senderName && formattedDate && ' • '}
          {formattedDate}
        </Text>
      </View>

      {isLocked && (
        <View style={StyleSheet.absoluteFill}>
          <LockOverlay unpackDate={gift.unpackDate} senderName={gift.senderName} />
        </View>
      )}
    </View>
  );

  const back = (
    <View style={styles.cardBack}>
      <View style={styles.cardBackInner}>
        <View style={styles.holidayHeading}>
          <Text style={styles.holidayText}>{resolveHoliday(gift.holidayId)}</Text>
        </View>

        <View style={styles.greetingBubble}>
          <Text style={styles.greetingText}>{gift.greeting || "You've got a gift!"}</Text>
          <View style={styles.authorContainer}>
            <Text style={styles.senderText}>{gift.senderName}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.codeSection}>
          <View style={styles.codeLabelContainer}>
            <Text style={styles.codeLabelText}>ACTIVATION CODE</Text>
          </View>

          {gift.scratchCode.format === 'qr-code' ? (
            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={gift.scratchCode.value ?? 'NO CODE'}
                  size={152}
                  backgroundColor="#ffffff"
                  color="#1A1A1A"
                />
              </View>
              <Text style={styles.scanText}>SCAN TO ACTIVATE</Text>
            </View>
          ) : (
            <View style={styles.copyContainer}>
              <Pressable
                style={({ pressed }) => [styles.codeButton, pressed && { transform: [{ scale: 0.95 }] }]}
                onPress={handleCopy}
              >
                <Text style={[styles.codeButtonText, copied && styles.copiedText]}>
                  {copied ? 'COPIED!' : gift.scratchCode.value || 'NO CODE'}
                </Text>
              </Pressable>
              <Text style={styles.tapToCopyText}>TAP TO COPY</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Pressable
      style={styles.container}
      onPress={() => fullyRevealed && setIsFlippedManually(!isFlippedManually)}
      disabled={!fullyRevealed}
    >
      <FlipFlap front={front} back={back} isFlipped={showBack} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardFront: {
    width: '100%',
    height: '100%',
    backgroundColor: BG_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    position: 'relative',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  bottomLabelContainer: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLabelText: {
    fontSize: 10,
    color: '#52525b',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  cardBack: {
    width: '100%',
    height: '100%',
    backgroundColor: BG_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
  },
  cardBackInner: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  holidayHeading: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 10,
  },
  holidayText: {
    color: TEXT_DARK,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  greetingBubble: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 4,
  },
  greetingText: {
    fontSize: 15,
    color: 'rgba(26, 26, 26, 0.8)',
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 24,
    textAlign: 'left',
  },
  authorContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  senderText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(26, 26, 26, 0.75)',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  dateText: {
    fontSize: 11,
    color: 'rgba(26, 26, 26, 0.45)',
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'right',
  },
  codeSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 32,
  },
  codeLabelContainer: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  codeLabelText: {
    fontSize: 10,
    color: 'rgba(26, 26, 26, 0.6)',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  // QR code
  qrContainer: {
    alignItems: 'center',
    gap: 12,
  },
  qrWrapper: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  scanText: {
    fontSize: 11,
    color: 'rgba(26, 26, 26, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  // Copy code
  copyContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  codeButton: {
    backgroundColor: TEXT_DARK,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    width: '100%',
    alignItems: 'center',
  },
  codeButtonText: {
    color: BG_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: 'Courier',
  },
  copiedText: {
    color: '#7AB648',
  },
  tapToCopyText: {
    fontSize: 10,
    color: 'rgba(26, 26, 26, 0.4)',
    letterSpacing: 1.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
