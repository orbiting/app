import React, { Component } from 'react'
import { Linking } from 'react-native'
import { withApollo } from 'react-apollo'
import { compose } from 'recompose'
import { parseURL } from '../utils/url'
import { FRONTEND_BASE_URL } from '../constants'

const deepLinkingWrapper = WrappedComponent => (
  class extends Component {
    componentDidMount () {
      // This handles the case where the app is closed and is launched via Universal Linking.
      Linking.getInitialURL().then((url) => {
        if (url) this.handleOpenURL({ url })
      })

      Linking.addEventListener('url', this.handleOpenURL)
    }

    componentWillUnmount () {
      Linking.removeEventListener('url', this.handleOpenURL)
    }

    handleOpenURL = (event) => {
      const { path, params } = parseURL(event.url)

      // When deep/universal link opened, we edit
      //   the global url state to show correct page
      setTimeout(() => {
        this.props.client.writeData({ data: {
          url: `${FRONTEND_BASE_URL}${path}?${params.toString()}`
        } })
      }, 100)
    }

    render () {
      return (
        <WrappedComponent {...this.props} />
      )
    }
  }
)

export default compose(withApollo, deepLinkingWrapper)
