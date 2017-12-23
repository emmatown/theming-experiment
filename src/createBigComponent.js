// @flow
import React from 'react'
import typeof CreateStyled from 'react-emotion'

const createBigComponent = (styled: CreateStyled) => {
  const SomeComponent = styled('div')`
    color: hotpink;
    background-color: ${props => props.theme.background};
  `
  const BigComponent = ({ count }: { count: number }) => {
    if (count === 0) return null
    return (
      <SomeComponent>
        some text {count}.
        <BigComponent count={count - 1} />
      </SomeComponent>
    )
  }
  return BigComponent
}

export default createBigComponent
