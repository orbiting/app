import React, { Fragment } from 'React';
import { View, Image, StyleSheet } from 'react-native';
import WebView from 'react-native-wkwebview-reborn';
import Spinner from 'react-native-spinkit';
import { listenHistory } from '../utils/webHistory';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 0,
    left: 0,
    zIndex: 100,
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  spinnerContainer: {
    position: 'relative',
  },
  loadingLogo: {
    width: 90,
    height: 90,
    top: 20,
    left: 20,
    position: 'absolute'
  }
});

const LoadingState = () => (
  <View style={styles.container}>
    <View styles={styles.spinnerContainer}>
      <Spinner isVisible size={130} type="Arc" color="#DDDDDD" />
      <Image
        style={styles.loadingLogo}
        source={require('../assets/images/icon.png')}
      />
    </View>
  </View>
);

class CustomWebView extends React.Component {
  // Native onNavigationStateChange method shim.
  // We call onNavigationStateChange either when the native calls, or onMessage
  onNavigationStateChange = ({ url }) => {
    const {
      source,
      webViewWillTransition,
      onNavigationStateChange,
    } = this.props;

    if (source.uri !== url && onNavigationStateChange) {
      if(webViewWillTransition(source.uri, url)) {
        onNavigationStateChange({ url });
      } else {
        // Native WebView does not have a way of preventing a page to load
        // so we go back into the webview's history that has the same effect.
        this.webview.goBack();
      }
    }
  }

  render() {
    const { loading, onNavigationStateChange, ...props } = this.props;

    return (
      <Fragment>
        { loading && <LoadingState /> }
        <WebView
          {...this.props}
          onMessage={e => {
            this.onNavigationStateChange(JSON.parse(e.nativeEvent.data))
          }}
          onNavigationStateChange={this.onNavigationStateChange}
          automaticallyAdjustContentInsets={false}
          ref={node => { this.webview = node; }}
          injectedJavaScript={listenHistory}
          allowsBackForwardNavigationGestures
          startInLoadingState
          javaScriptEnabled
          scalesPageToFit
        />
      </Fragment>
    )
  }
};

export default CustomWebView;
