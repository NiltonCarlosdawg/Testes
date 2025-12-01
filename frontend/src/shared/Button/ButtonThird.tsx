import React from 'react'
import { Button, type ButtonProps } from './Button'

const ButtonThird:  React.FC<ButtonProps> = (props: ButtonProps) => {
  return <Button  {...props} />
}

export default ButtonThird
