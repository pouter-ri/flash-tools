import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPOGRAPHY, type Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  children: React.ReactNode;
  colors: Palette;
}

interface State {
  error: Error | null;
}

class ErrorBoundaryInner extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    try {
      console.error(error);
    } catch (e) {}
  }

  render() {
    if (this.state.error) {
      const s = styles(this.props.colors);
      return (
        <View style={s.root}>
          <Text style={s.title}>Something went wrong</Text>
          <Text style={s.body}>Please restart the app.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <ErrorBoundaryInner colors={colors}>{children}</ErrorBoundaryInner>;
}

const styles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    title: {
      ...TYPOGRAPHY.title,
      color: c.text,
    },
    body: {
      ...TYPOGRAPHY.body,
      color: c.textMuted,
      marginTop: 8,
    },
  });
