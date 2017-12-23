// @flow
import React, { Component } from 'react'
import styled from './experiment/styled'
import { ThemeProvider } from 'emotion-theming'
import createBigComponent from './createBigComponent'
import './App.css'

const BigComponent = createBigComponent(styled)

class RenderBlocker extends React.Component<*> {
  shouldComponentUpdate() {
    return false
  }
  render() {
    return <ChildComponent />
  }
}

const ChildComponent = () => (
  <div>
    <BigComponent count={100} />
    <BigComponent count={100} />
    <BigComponent count={100} />
    <BigComponent count={100} />
    <BigComponent count={100} />
    <BigComponent count={100} />
    <BigComponent count={100} />
    <BigComponent count={100} />
    <BigComponent count={100} />
    <BigComponent count={100} />
    <BigComponent count={100} />
    <BigComponent count={100} />
  </div>
)

class App extends Component<*, *> {
  state = { theme: { background: 'green' } }
  render() {
    return (
      <div>
        <button
          onClick={() => {
            let start = performance.now()
            this.setState({
              theme: {
                background:
                  this.state.theme.background === 'green' ? 'yellow' : 'green'
              }
            })
            setTimeout(() => {
              let end = performance.now()
              console.log(end - start)
            }, 0)
          }}
        >
          Change Theme
        </button>
        <ThemeProvider uid="Unique id" theme={this.state.theme}>
          <div>
            <RenderBlocker />
          </div>
        </ThemeProvider>
      </div>
    )
  }
}

export default App
