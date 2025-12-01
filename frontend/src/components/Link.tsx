import NextLink from 'next/link'
import React from 'react'

export const Link = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<typeof NextLink>>(
  ({ children, ...props }, ref) => {
    return (
      <NextLink ref={ref} {...props}>
        {children}
      </NextLink>
    )
  }
)

Link.displayName = 'Link'