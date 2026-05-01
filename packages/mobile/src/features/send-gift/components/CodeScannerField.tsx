import { Camera, Check, QrCode, ScanLine, X } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button, Input } from '@/shared/ui';
import { colors } from '@/theme';

interface CodeScannerFieldProps {
  value: string;
  hasScannedCode: boolean;
  onChangeText: (val: string) => void;
  onScanQr: () => void;
  onClearScanned: () => void;
  error?: string;
}

export function CodeScannerField({
  value,
  hasScannedCode,
  onChangeText,
  onScanQr,
  onClearScanned,
  error,
}: CodeScannerFieldProps) {
  return (
    <View>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Input
            leftIcon={<ScanLine color={colors.ink} size={24} strokeWidth={2.5} />}
            placeholder="Gift Code or URL"
            value={value}
            onChangeText={onChangeText}
            editable={!hasScannedCode}
            error={error}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View>
          {hasScannedCode ? (
            <Button layout="circle" variant="red" icon={X} onPress={onClearScanned} />
          ) : (
            <Button layout="circle" variant="orange" icon={Camera} onPress={onScanQr} />
          )}
        </View>
      </View>
      {hasScannedCode && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.qrPreview}>
          <QrCode color={colors.successGreen} size={20} strokeWidth={2.5} />
          <Text style={styles.qrPreviewText} numberOfLines={1}>
            {value}
          </Text>
          <Check color={colors.successGreen} size={16} strokeWidth={3} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  qrPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(122, 182, 72, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 182, 72, 0.3)',
  },
  qrPreviewText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textBrown,
  },
});
