import React, { Component } from 'react'
import { Platform } from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'
import { OTA_BASE_URL } from '../constants'

const cookiesWrapper = WrappedComponent => (
  class extends Component {
    componentDidMount () {
      if (!OTA_BASE_URL) {
        console.warn('ota-simple missing baseUrl. cannot update.')
        return
      }
      console.log(`ota-simple downloadUpdate baseUrl: ${OTA_BASE_URL}`)
      RNFetchBlob
        .config({
          path: `${RNFetchBlob.fs.dirs.DocumentDir}/latest.jsbundle`
        })
        .fetch('GET', `${OTA_BASE_URL}/${Platform.OS}.jsbundle`, {})
        .then((res) => {
          console.log('ota-simple: downloaded new bundle to: ', res.path())
        })
        .catch((err) => {
          console.log(err)
        })
    }

    render () {
      return (
        <WrappedComponent {...this.props} />
      )
    }
  }
)

export default cookiesWrapper
