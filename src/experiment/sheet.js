// @flow
/*

high performance StyleSheet for css-in-js systems

- uses multiple style tags behind the scenes for millions of rules
- uses `insertRule` for appending in production for *much* faster performance
- 'polyfills' on server side

// usage

import StyleSheet from 'glamor/lib/sheet'
let styleSheet = new StyleSheet()

styleSheet.inject()
- 'injects' the stylesheet into the page (or into memory if on server)

styleSheet.insert('#box { border: 1px solid red; }')
- appends a css rule into the stylesheet

styleSheet.flush()
- empties the stylesheet of all its contents

*/

// $FlowFixMe
function sheetForTag(tag: HTMLStyleElement): CSSStyleSheet {
  if (tag.sheet) {
    // $FlowFixMe
    return tag.sheet
  }

  // this weirdness brought to you by firefox
  for (let i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].ownerNode === tag) {
      // $FlowFixMe
      return document.styleSheets[i]
    }
  }
}

function makeStyleTag(): HTMLStyleElement {
  let tag = document.createElement('style')
  tag.type = 'text/css'
  tag.setAttribute('data-emotion', '')
  tag.appendChild(document.createTextNode(''))
  // $FlowFixMe
  document.head.appendChild(tag)
  return tag
}

export default class StyleSheet {
  injected: boolean
  ctr: number
  sheet: string[]
  tags: HTMLStyleElement[]
  nonce: string | void
  tagMap: { [string]: Array<Array<number>> }
  constructor() {
    this.tags = []
    this.ctr = 0
    this.tagMap = {}
  }
  inject() {
    if (this.injected) {
      throw new Error('already injected!')
    }
    this.tags[0] = makeStyleTag()
    this.tagMap = {}
    this.injected = true
  }
  replace(index: number, rule: string) {
    try {
      let idkAnymore = Math.floor(index / 65000)
      let realIndex = index - idkAnymore * 65000
      const tag = this.tags[idkAnymore]
      const sheet = sheetForTag(tag)
      sheet.deleteRule(realIndex)
      sheet.insertRule(rule, realIndex)
    } catch (e) {
      if (process.env.NODE !== 'production') {
        console.warn('whoops, problem replacing rule', rule)
      }
    }
  }
  insert(rule: string, hash: string) {
    const tag = this.tags[this.tags.length - 1]
    const sheet = sheetForTag(tag)

    try {
      sheet.insertRule(rule, sheet.cssRules.length)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('illegal rule', rule)
      }
    }

    this.ctr++
    if (this.ctr % 65000 === 0) {
      this.tags.push(makeStyleTag())
    }
    return this.ctr - 1
  }
  flush() {
    // $FlowFixMe
    this.tags.forEach(tag => tag.parentNode.removeChild(tag))
    this.tags = []
    this.tagMap = {}
    this.ctr = 0
    // todo - look for remnants in document.styleSheets
    this.injected = false
  }
}
