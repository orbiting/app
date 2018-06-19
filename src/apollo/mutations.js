import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const toggleMenu = graphql(gql`
  mutation ToggleMenu {
    toggleMenu @client
  }
`, { name: 'toggleMenu' })

const closeMenu = graphql(gql`
  mutation ToggleMenu {
    closeMenu @client
  }
`, { name: 'closeMenu' })

const login = graphql(gql`
  mutation Login($user: User) {
    login(user: $user) @client
  }
`, { name: 'login' })

const logout = graphql(gql`
  mutation Logout {
    logout @client
  }
`, { name: 'logout' })

const signOut = graphql(gql`
  mutation SignOut {
    signOut
  }
`, { name: 'signOut' })

const setUrl = graphql(gql`
  mutation setUrl($url: String!) {
    setUrl(url: $url) @client
  }
`, { name: 'setUrl' })

export { toggleMenu, closeMenu, login, logout, signOut, setUrl }
