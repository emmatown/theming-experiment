// @flow
import { contextTypes, channel } from 'emotion-theming'
import React from 'react'
import { Stylis } from 'emotion-utils'
import stylisRuleSheet from 'stylis-rule-sheet'
import StyleSheet from './sheet'

let whoCaresAboutDeterminism = 5000

const stylis = new Stylis()

const sheet = new StyleSheet()

export type Interpolation = any

export type Interpolations = Array<Interpolation>

let globalVariablesAreAnnoyingHash
let globalVariablesAreAnnoyingIdkWhatThisIs

function insertRule(rule: string) {
  globalVariablesAreAnnoyingIdkWhatThisIs.push(
    sheet.insert(rule, globalVariablesAreAnnoyingHash)
  )
}

function returnThingPlugin(context) {
  if (context === -1) {
    globalVariablesAreAnnoyingIdkWhatThisIs = []
  }
  if (context === -2) {
    return globalVariablesAreAnnoyingIdkWhatThisIs
  }
}

const insertionPlugin = stylisRuleSheet(insertRule)
stylis.use(insertionPlugin)(returnThingPlugin)

sheet.inject()

const createStyled = (tag: *, options: { target: string }): * => {
  if (process.env.NODE_ENV !== 'production') {
    if (tag === undefined) {
      throw new Error(
        'You are trying to create a styled element with an undefined component.\nYou may have forgotten to import it.'
      )
    }
  }

  return function() {
    let args = arguments
    let styles = []
    if (args[0] == null || args[0].raw === undefined) {
      styles.push.apply(styles, args)
    } else {
      styles.push(args[0][0])
      let len = args.length
      let i = 1
      for (; i < len; i++) {
        styles.push(args[i], args[0][i])
      }
    }

    class Styled extends React.Component<*, { theme: Object }> {
      unsubscribe: ?number
      theme: Object
      mehDeterminism = (whoCaresAboutDeterminism++).toString(36)
      componentWillUnmount() {
        if (this.unsubscribe !== undefined) {
          this.context[channel].unsubscribe()
        }
      }
      constructor() {
        super()
        this.css(styles)
      }
      componentDidUpdate() {
        this.update(this.theme)
      }
      handleInterpolation(
        interpolation: Interpolation,
        newProps?: Object
      ): string {
        if (interpolation == null) {
          return ''
        }

        switch (typeof interpolation) {
          case 'boolean':
            return ''
          case 'function':
            return this.handleInterpolation(
              interpolation(newProps, this.context),
              newProps
            )
        }
        return interpolation
      }
      prevStyles: string
      update(theme) {
        this.theme = theme
        const newProps = { ...this.props, theme }
        let newStyles = ''
        styles.forEach(interp => {
          newStyles += this.handleInterpolation(interp, newProps)
        })
        if (newStyles === this.prevStyles) {
          return
        }
        this.prevStyles = newStyles

        stylis(`.css-${this.mehDeterminism}`, newStyles)
      }
      css(interpolations: Interpolations) {
        this.unsubscribe = this.context[channel].subscribe(this.update)
      }
      render() {
        let className = `css-${this.mehDeterminism}`

        if (this.props.className) {
          className += ` ${this.props.className}`
        }

        return React.createElement(tag, {
          ...this.props,
          className,
          ref: this.props.innerRef
        })
      }
    }

    Styled.contextTypes = contextTypes

    return Styled
  }
}
export default createStyled
