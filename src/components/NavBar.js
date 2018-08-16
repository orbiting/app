import React from 'react'
import { TouchableOpacity, StyleSheet, Text, Animated } from 'react-native'
import { parseURL } from '../utils/url'
import { HOME_URL, HOME_PATH, FEED_URL, FEED_PATH, FORMATS_URL, FORMATS_PATH } from '../constants'

const styles = StyleSheet.create({
  container: {
    left: 0,
    zIndex: 300,
    width: '100%',
    position: 'absolute',
    borderBottomWidth: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF'
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 15,
    color: '#B7C1BD',
    fontFamily: 'GT America'
  },
  active: {
    color: '#000'
  }
})

const DURATION = 300
const BORDER_HEIGHT = 3
const NAV_BAR_HEIGHT = 36

class NavBar extends React.Component {
  static HEIGHT = NAV_BAR_HEIGHT

  constructor (props) {
    super(props)

    this.animating = false
    this.top = new Animated.Value(props.active ? 0 : -NAV_BAR_HEIGHT)
  }

  componentWillReceiveProps (newProps) {
    if (!this.animating) {
      this.animating = true

      const animation = newProps.visible
        ? Animated.timing(this.top, { toValue: 0, duration: DURATION })
        : Animated.timing(this.top, { toValue: -NAV_BAR_HEIGHT, duration: DURATION })

      animation.start(() => { this.animating = false })
    }
  }

  render () {
    const { currentUrl, visible, setUrl, borderColor, style, pointerEvents } = this.props

    const url = parseURL(currentUrl)

    const pathActive = url.path === HOME_PATH
    const feedActive = url.path === FEED_PATH
    const formatsActive = url.path === FORMATS_PATH
    const noLinksActive = (!pathActive && !feedActive && !formatsActive)
    const height = borderColor ? NAV_BAR_HEIGHT + BORDER_HEIGHT : NAV_BAR_HEIGHT
    const borderBottomWidth = borderColor ? BORDER_HEIGHT : 1
    const borderBottomColor = borderColor || '#DADDDC'

    return (
      <Animated.View
        pointerEvents={pointerEvents || (visible ? 'auto' : 'none')}
        style={[style, styles.container, { height, borderBottomColor, borderBottomWidth }, { top: this.top }]}
      >
        <TouchableOpacity
          style={styles.item}
          onPress={() => setUrl({ variables: { url: HOME_URL } })}
        >
          <Text style={[styles.text, (noLinksActive || pathActive) && styles.active]}>
            Magazin
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() => setUrl({ variables: { url: FEED_URL } })}
        >
          <Text style={[styles.text, (noLinksActive || feedActive) && styles.active]}>
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() => setUrl({ variables: { url: FORMATS_URL } })}
        >
          <Text style={[styles.text, (noLinksActive || formatsActive) && styles.active]}>
            Rubriken
          </Text>
        </TouchableOpacity>
      </Animated.View>
    )
  }
}

export default NavBar
