import { FC } from 'react'
import { NoSymbolIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface Props {
  status?: string
  className?: string
}

const ProductStatus: FC<Props> = ({
  status = 'New in',
  className = 'absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300',
}) => {
  const renderStatus = () => {
    if (!status) {
      return null
    }
    const classes = `nc-shadow-lg rounded-full flex items-center justify-center ${className}`
    if (status === 'New in') {
      return (
        <div className={classes}>
          <SparklesIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === 'Sold Out') {
      return (
        <div className={classes}>
          <NoSymbolIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    return null
  }

  return renderStatus()
}

export default ProductStatus