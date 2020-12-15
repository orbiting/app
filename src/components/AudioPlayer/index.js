import React, { useEffect, useRef } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Easing,
} from 'react-native'
import TrackPlayer, {
  useTrackPlayerProgress,
  usePlaybackState,
} from 'react-native-track-player'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Logo from '../../assets/images/playlist-logo.png'
import {
  FRONTEND_BASE_URL,
  AUDIO_PLAYER_HEIGHT,
  AUDIO_PLAYER_PROGRESS_HEIGHT,
  ANIMATION_DURATION,
  AUDIO_PLAYER_PADDING,
  AUDIO_PLAYER_MAX_WIDTH,
} from '../../constants'
import { useGlobalState } from '../../GlobalState'
import ProgressBar from './ProgressBar'
import { useColorContext } from '../../utils/colors'

const parseSeconds = (value) => {
  if (value === null || value === undefined) return ''
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value - minutes * 60)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

const AudioPlayer = () => {
  const insets = useSafeAreaInsets()
  const progress = useTrackPlayerProgress()
  const playbackState = usePlaybackState()
  const {
    persistedState,
    setPersistedState,
    setGlobalState,
    dispatch,
  } = useGlobalState()
  const { audio } = persistedState
  const slideAnim = useRef(new Animated.Value(0)).current
  const colorScheme = useColorContext()

  // Initializes the player
  useEffect(() => {
    setup()
  }, [])

  async function setup() {
    await TrackPlayer.setupPlayer({})
    await TrackPlayer.updateOptions({
      stopWithApp: true,
      jumpInterval: 15,
      capabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_STOP,
        TrackPlayer.CAPABILITY_JUMP_FORWARD,
        TrackPlayer.CAPABILITY_JUMP_BACKWARD,
      ],
    })
  }

  // Handles changes in the audio persisted state, sliding the
  // player in when there is an audio object vs sliding it out
  // once the audio object is wiped from persistedState
  // also triggers playback when a new audio object is set to persistedState,
  // which happens via message API.
  useEffect(() => {
    const slideIn = () => {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start()
      // dispatch to webview
      dispatch({
        type: 'postMessage',
        content: {
          type: 'onAudioPlayerVisibilityChange',
          isVisible: true,
        },
      })
    }
    const slideOut = () => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start()
      // dispatch to webview
      dispatch({
        type: 'postMessage',
        content: {
          type: 'onAudioPlayerVisibilityChange',
          isVisible: false,
        },
      })
    }
    if (!!audio) {
      slideIn()
      togglePlayback()
    } else {
      slideOut()
      togglePlayback()
    }
  }, [audio, slideAnim, togglePlayback, setPersistedState])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const togglePlayback = async () => {
    if (audio == null) {
      await TrackPlayer.pause()
      return
    }
    const currentTrack = await TrackPlayer.getCurrentTrack()
    if (currentTrack == null) {
      await TrackPlayer.reset()
      await TrackPlayer.add({
        id: audio.mediaId,
        url: audio.url,
        title: audio.title,
        artist: 'Republik',
        artwork: Logo,
      })
      await TrackPlayer.play()
    } else {
      if (playbackState === TrackPlayer.STATE_PAUSED) {
        await TrackPlayer.play()
      } else {
        await TrackPlayer.pause()
      }
    }
  }

  const onTitlePress = () => {
    if (audio && audio.sourcePath) {
      setGlobalState({
        pendingUrl: `${FRONTEND_BASE_URL}${audio.sourcePath}`,
      })
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: AUDIO_PLAYER_HEIGHT + Math.max(insets.bottom, 16),
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  AUDIO_PLAYER_HEIGHT + Math.max(insets.bottom, 16),
                  0,
                ],
              }),
            },
          ],
        },
      ]}>
      <View style={[styles.player, { backgroundColor: colorScheme.overlay }]}>
        <View style={styles.controls}>
          <Icon
            name={
              playbackState == TrackPlayer.STATE_PAUSED ? 'play-arrow' : 'pause'
            }
            size={35}
            color={colorScheme.text}
            onPress={() => togglePlayback()}
          />
          <Icon
            name="fast-rewind"
            size={25}
            color={colorScheme.text}
            onPress={() => {}}
          />
          <View style={styles.content}>
            <TouchableOpacity onPress={onTitlePress}>
              <Text
                numberOfLines={1}
                style={[styles.title, { color: colorScheme.text }]}>
                {audio && audio.title}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.time, { color: colorScheme.text }]}>
              {parseSeconds(progress.position)} /{' '}
              {parseSeconds(progress.duration)}
            </Text>
          </View>
          <Icon
            name="close"
            size={35}
            color={colorScheme.text}
            onPress={() =>
              setPersistedState({
                audio: null,
              })
            }
          />
        </View>
        <ProgressBar
          audio={audio}
          upsertCurrentMediaProgress={() =>
            setPersistedState({
              mediaProgress: {
                mediaId: audio.mediaId,
                secs: progress.position,
              },
            })
          }
          enableProgress={true}
          position={progress.position}
          isPlaying={playbackState == TrackPlayer.STATE_PLAYING}
          duration={progress.duration}
          bufferedPosition={progress.bufferedPosition}
          onProgressPanReleased={async (newPosition) => {
            await TrackPlayer.seekTo(newPosition)
            await TrackPlayer.play()
          }}
        />
      </View>
      <SafeAreaView edges={['right', 'bottom', 'left']} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  player: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'column',
    marginHorizontal: AUDIO_PLAYER_PADDING,
    maxWidth: AUDIO_PLAYER_MAX_WIDTH,
    height: AUDIO_PLAYER_HEIGHT,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,

    elevation: 7,
  },
  controls: {
    width: '100%',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: AUDIO_PLAYER_PROGRESS_HEIGHT,
  },
  content: {
    flex: 1,
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontFamily: 'GT America',
  },
  time: {
    fontSize: 14,
    fontFamily: 'GT America',
    fontVariant: ['tabular-nums'],
  },
})

export default AudioPlayer
