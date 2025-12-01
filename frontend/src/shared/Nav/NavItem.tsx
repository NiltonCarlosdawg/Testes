import { FC } from 'react'
import { Button, type ButtonProps } from '../Button/Button'

type Props = ButtonProps & {
  isActive?: boolean
}

const NavItem: FC<Props> = ({ isActive = false,  ...props }) => {
  return (
    <li className="relative">
      {/* @ts-ignore */}
      <Button
        {...props}
        className="whitespace-nowrap"
        plain={!isActive || undefined}
        size="smaller"
      />
    </li>
  )
}

export default NavItem
