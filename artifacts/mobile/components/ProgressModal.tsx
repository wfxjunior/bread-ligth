import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';

const GOLD = '#B8921A';

export interface ProgressStat {
  icon: keyof typeof Feather.glyphMap;
  value: string;
  labelPt: string;
  labelEn: string;
  descPt: string;
  descEn: string;
}

interface ProgressModalProps {
  visible: boolean;
  onClose: () => void;
  stats: ProgressStat[];
}

export default function ProgressModal({ visible, onClose, stats }: ProgressModalProps) {
  const colors = useColors();
  const { t, lang } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>{t('progress_modal_title')}</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {t('progress_modal_subtitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('a11y_close')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.topRule, { backgroundColor: GOLD }]} />

          <View style={styles.list}>
            {stats.map((stat, idx) => (
              <View
                key={stat.labelEn}
                style={[
                  styles.row,
                  idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                ]}
              >
                <View style={[styles.iconBadge, { backgroundColor: GOLD + '16' }]}>
                  <Feather name={stat.icon} size={16} color={GOLD} />
                </View>
                <View style={styles.rowText}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.rowValue, { color: colors.foreground }]}>{stat.value}</Text>
                    <Text style={[styles.rowLabel, { color: colors.foreground }]}>
                      {(lang === 'pt' ? stat.labelPt : stat.labelEn).replace('\n', ' ')}
                    </Text>
                  </View>
                  <Text style={[styles.rowDesc, { color: colors.mutedForeground }]}>
                    {lang === 'pt' ? stat.descPt : stat.descEn}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={[styles.footer, { color: colors.mutedForeground }]}>
            {t('progress_modal_footer')}
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lora_700Bold',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 3,
  },
  topRule: {
    height: 2,
    width: 36,
    borderRadius: 1,
    marginTop: 14,
    marginBottom: 4,
  },
  list: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  rowText: { flex: 1, gap: 3 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  rowValue: {
    fontSize: 20,
    fontFamily: 'Lora_700Bold',
    letterSpacing: -0.3,
  },
  rowLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  rowDesc: {
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  footer: {
    fontSize: 12,
    fontFamily: 'Lora_400Regular_Italic',
    textAlign: 'center',
    marginTop: 10,
  },
});
