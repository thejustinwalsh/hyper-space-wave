import {useCallback, useMemo} from 'react';
import {StatusBar} from 'expo-status-bar';
import {DOMProps} from 'expo/dom';
import {Dimensions, StyleSheet, View} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import AppDOMComponent from './components/AppDomComponent';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export function Dom() {
  const insets = useSafeAreaInsets();
  const dom = useMemo(
    () => ({
      ...domProps,
      contentInset: {
        top: -insets.top,
      },
    }),
    [insets],
  );
  const {width, height} = useMemo(() => Dimensions.get('screen'), []);

  const onReady = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  return <AppDOMComponent width={width} height={height} dom={dom} onReady={onReady} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.flex}>
        <StatusBar translucent />
        <Dom />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

const domProps: DOMProps = {
  automaticallyAdjustContentInsets: false,
  allowsInlineMediaPlayback: true,
  scalesPageToFit: false,
  scrollEnabled: false,
  showsHorizontalScrollIndicator: false,
  showsVerticalScrollIndicator: false,
};
