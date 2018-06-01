/* eslint-disable no-undef */
// Injected code to spy on browser's navigation history
// Native WebView onNavigationStateChange does not recognize SPA page transitions,
// so we inject code that enables to spy on changes, sending messages.
export const listenHistoryImpl = function () {
  var pushState = window.history.pushState
  var replaceState = window.history.replaceState
  var back = window.history.back

  function updateNavState (url) {
    let hash = location.hash !== '' ? '?' + location.hash : ''
    let prefix = location.protocol + '//' + location.host

    window.postMessage(JSON.stringify({
      type: 'navigation',
      url: url ? (prefix + url) : (prefix + location.pathname + hash)
    }))
  };

  window.history.pushState = function () {
    updateNavState(arguments[2])
    return pushState.apply(window.history, arguments)
  }

  window.history.replaceState = function () {
    updateNavState(arguments[2])
    return replaceState.apply(window.history, arguments)
  }

  window.history.back = function () {
    updateNavState()
    return back.apply(window.history)
  }

  window.onload = function () {
    updateNavState()
  }

  window.onpopstate = function () {
    updateNavState()
  }

  window.onhashchange = function () {
    updateNavState()
  }
}

// Implementation IIFE ready to inject
export const listenHistory = `(${listenHistoryImpl.toString()})()`