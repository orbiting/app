import React, { useContext, useEffect, useState } from 'react'
import { Appearance } from 'react-native'
import { useGlobalState } from '../GlobalState'

const colors = {
  light: {
    default: '#FFFFFF',
    logo: '#000000',
    overlay: '#FFFFFF',
    text: '#282828',
    textSoft: '#7D7D7D',
    primary: '#00AA00',
    progress: '#DADDDC',
    progressBuffer: '#7D7D7D',
    fullScreenStatusBar: '#000000',
  },
  dark: {
    default: '#191919',
    logo: '#FFFFFF',
    overlay: '#1F1F1F',
    text: '#F0F0F0',
    textSoft: '#A9A9A9',
    primary: '#00AA00',
    progress: '#292929',
    progressBuffer: '#4C4D4C',
    fullScreenStatusBar: '#000000',
  },
}

const ColorContext = React.createContext({
  colors: colors.light,
  colorSchemeKey: 'light',
})

export const ColorContextProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState(() =>
    Appearance.getColorScheme(),
  )

  useEffect(() => {
    const onChange = (preferences) => {
      setColorScheme(preferences.colorScheme)
    }
    Appearance.addChangeListener(onChange)
    return () => {
      Appearance.removeChangeListener(onChange)
    }
  }, [])

  const { globalState, persistedState } = useGlobalState()
  const { appState } = globalState
  useEffect(() => {
    if (appState === 'active') {
      setColorScheme(Appearance.getColorScheme())
    }
  }, [appState])

  const { userSetColorScheme } = persistedState
  const colorSchemeKey =
    !userSetColorScheme || userSetColorScheme === 'auto'
      ? colorScheme || 'light'
      : userSetColorScheme

  return (
    <ColorContext.Provider
      value={{
        colors: colorSchemeKey === 'dark' ? colors.dark : colors.light,
        colorSchemeKey,
      }}>
      {children}
    </ColorContext.Provider>
  )
}

export const useColorContext = () => {
  const colorContext = useContext(ColorContext)
  return colorContext
}
