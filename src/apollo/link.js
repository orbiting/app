import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { API_URL, API_WS_URL } from '../constants'

const hasSubscriptionOperation = ({ query }) => (
  query.definitions.some(
    ({ kind, operation }) =>
      kind === 'OperationDefinition' && operation === 'subscription'
  )
)

const httpLink = new HttpLink({ uri: API_URL })

const wsLink = new WebSocketLink({
  uri: API_WS_URL,
  options: {
    reconnect: true,
    timeout: 50000
  }
})

export const cache = new InMemoryCache()

export const link = ApolloLink.split(
  hasSubscriptionOperation,
  wsLink,
  httpLink
)
