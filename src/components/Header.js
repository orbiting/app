import React, { Fragment } from 'react'
import { compose } from 'react-apollo'
import { View, Text, Image, TouchableOpacity, Share, StyleSheet } from 'react-native'
import Popover from './Popover'
import Icon from './Icon'
import { parseURL } from '../utils/url'
import { FRONTEND_BASE_URL, HOME_URL, FEED_URL, SEARCH_PATH, SEARCH_URL } from '../constants'
import {
  me,
  setUrl,
  setAudio,
  withCount,
  toggleMenu,
  withMenuState,
  withCurrentUrl,
  withCurrentArticle,
  toggleSecondaryMenu
} from '../apollo'

const styles = StyleSheet.create({
  container: {
    zIndex: 150,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: '#FFF',
    justifyContent: 'space-between'
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttons: {
    width: 75,
    alignItems: 'center',
    flexDirection: 'row'
  },
  buttonsLeft: {
    justifyContent: 'flex-start'
  },
  buttonsRight: {
    justifyContent: 'flex-end'
  },
  logo: {
    width: 150,
    height: 25
  },
  icons: {
    flex: 1,
    marginLeft: 15,
    flexDirection: 'row'
  },
  series: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  seriesName: {
    fontSize: 15,
    marginRight: 5
  },
  discussion: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  discussionCount: {
    color: '#3cad01',
    fontWeight: 'bold',
    fontSize: 15
  }
})

const MainHeader = ({ me, toggleMenu, setUrl, currentUrl }) => {
  const currentPath = parseURL(currentUrl).path
  const inSearchPath = currentPath === SEARCH_PATH
  const searchIcon = inSearchPath ? 'searchActive' : 'search'

  const onLogoClick = () => me && setUrl({ variables: {
    url: currentPath === '/' ? FEED_URL : HOME_URL }
  })
  const onSearchClick = () => me && !inSearchPath &&
    setUrl({ variables: { url: SEARCH_URL } })

  return (
    <View style={styles.container}>
      <View style={[styles.buttons, styles.buttonsLeft]}>
        <Icon
          side="left"
          type="profile"
          onPress={toggleMenu}
        />
        <Icon
          type="lock"
        />
      </View>
      <TouchableOpacity onPress={onLogoClick} style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo-title.png')}
          style={styles.logo}
        />
      </TouchableOpacity>
      <View style={[styles.buttons, styles.buttonsRight]}>
        {me && (
          <Icon
            type={searchIcon}
            onPress={onSearchClick}
          />
        )}
        <Icon
          side="right"
          type="hamburger"
          onPress={toggleMenu}
        />
      </View>
    </View>
  )
}

const onShareClick = (article) => {
  const url = `${FRONTEND_BASE_URL}${article.path}`

  Share.share({
    url,
    message: url,
    title: article.title,
    subject: article.title,
    dialogTitle: article.title
  })
}

const SeriesHeader = ({
  count,
  active,
  setUrl,
  article,
  setAudio,
  menuOpened,
  toggleMenu,
  toggleSecondaryMenu,
  onPDFClick
}) => {
  const name = article && article.series
  const audio = article && article.audioSource
  const discussionPath = article && article.discussionPath
  const pdf = article && article.template === 'article'
  const icon = menuOpened ? 'chevronUp' : 'chevronDown'

  return (
    <Popover active={active} style={styles.container}>
      <View style={styles.icons}>
        {name && (
          <TouchableOpacity style={styles.series} onPress={() => toggleSecondaryMenu()}>
            <Fragment>
              <Text style={styles.seriesName}>{name}</Text>
              <Icon type={icon} />
            </Fragment>
          </TouchableOpacity>
        )}
        <Icon
          size={30}
          side="right"
          type="share"
          onPress={() => onShareClick(article)}
          style={{ marginRight: 5 }}
        />
        { pdf && (
          <Icon
            size={30}
            side="right"
            type="pdf"
            onPress={onPDFClick}
            style={{ marginRight: 5 }}
          />
        )}
        { audio && (
          <Icon
            size={30}
            side="right"
            type="audio"
            style={{ marginRight: 5 }}
            onPress={() => setAudio({ variables: { audio } })}
          />
        )}
        { discussionPath && (
          <TouchableOpacity
            style={styles.discussion}
            onPress={() => {
              setUrl({
                variables: { url: `${FRONTEND_BASE_URL}${article.discussionPath}` }
              })
            }}
          >
            <Icon
              size={30}
              side="right"
              type="discussion"
              style={{ marginRight: 5 }}
            />
            {count && <Text style={styles.discussionCount}>{count}</Text>}
          </TouchableOpacity>
        )}
      </View>
      <Icon
        side="right"
        type="hamburger"
        onPress={toggleMenu}
        style={{ marginLeft: 5 }}
      />
    </Popover>
  )
}

const Header = ({
  me,
  article,
  setUrl,
  setAudio,
  currentUrl,
  toggleMenu,
  menuActive,
  secondaryMenuActive,
  secondaryMenuVisible,
  toggleSecondaryMenu,
  onPDFClick,
  count
}) => (
  <Fragment>
    <MainHeader
      me={me}
      setUrl={setUrl}
      currentUrl={currentUrl}
      toggleMenu={toggleMenu}
    />
    <SeriesHeader
      count={count}
      setUrl={setUrl}
      article={article}
      setAudio={setAudio}
      toggleMenu={toggleMenu}
      onPDFClick={onPDFClick}
      menuOpened={secondaryMenuActive}
      toggleSecondaryMenu={toggleSecondaryMenu}
      active={!menuActive && secondaryMenuVisible}
    />
  </Fragment>
)

export default compose(
  me,
  setUrl,
  setAudio,
  toggleMenu,
  withMenuState,
  withCurrentUrl,
  withCurrentArticle,
  toggleSecondaryMenu,
  withCount
)(Header)
