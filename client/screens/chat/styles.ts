import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundRoot,
    },
    header: {
      paddingHorizontal: Spacing['2xl'],
      paddingTop: Spacing['3xl'],
      paddingBottom: Spacing.lg,
      backgroundColor: theme.primary,
    },
    headerTitle: {
      color: theme.buttonPrimaryText,
      marginBottom: Spacing.xs,
    },
    headerSubtitle: {
      color: theme.buttonPrimaryText,
      opacity: 0.8,
    },
    chatContainer: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
    },
    messagesList: {
      paddingVertical: Spacing.lg,
      paddingBottom: Spacing['2xl'],
    },
    messageWrapper: {
      marginBottom: Spacing.lg,
    },
    userMessageContainer: {
      alignItems: 'flex-end',
    },
    assistantMessageContainer: {
      alignItems: 'flex-start',
    },
    messageBubble: {
      maxWidth: '85%',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.xl,
    },
    userBubble: {
      backgroundColor: theme.primary,
      borderBottomRightRadius: BorderRadius.xs,
    },
    assistantBubble: {
      backgroundColor: theme.backgroundDefault,
      borderBottomLeftRadius: BorderRadius.xs,
      shadowColor: '#D1D9E6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    userMessageText: {
      color: theme.buttonPrimaryText,
    },
    assistantMessageText: {
      color: theme.textPrimary,
    },
    inputContainer: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      paddingBottom: Spacing['3xl'],
      backgroundColor: theme.backgroundRoot,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: theme.backgroundTertiary,
      borderRadius: BorderRadius['2xl'],
      paddingLeft: Spacing.lg,
      paddingRight: Spacing.sm,
      paddingVertical: Spacing.sm,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: theme.textPrimary,
      maxHeight: 120,
      paddingVertical: Spacing.sm,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.xl,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: Spacing.sm,
    },
    sendButtonDisabled: {
      backgroundColor: theme.textMuted,
      opacity: 0.5,
    },
    typingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.xl,
      shadowColor: '#D1D9E6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
      marginHorizontal: 2,
      opacity: 0.6,
    },
    typingText: {
      marginLeft: Spacing.sm,
      color: theme.textMuted,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing['3xl'],
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: BorderRadius['3xl'],
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    emptyTitle: {
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    emptySubtitle: {
      textAlign: 'center',
    },
    welcomeCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius['2xl'],
      padding: Spacing.xl,
      marginTop: Spacing['2xl'],
      shadowColor: '#D1D9E6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    suggestionTitle: {
      marginBottom: Spacing.lg,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
    },
    suggestionIcon: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.lg,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    suggestionText: {
      flex: 1,
      color: theme.textSecondary,
    },
    scrollContent: {
      flexGrow: 1,
    },
  });
};
