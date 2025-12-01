'use client'

import { MinusSignIcon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState, useEffect } from 'react'

export interface NcInputNumberProps {
  className?: string
  defaultValue?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
  disabled?: boolean
}

const NcInputNumber: React.FC<NcInputNumberProps> = ({
  className = 'w-full',
  defaultValue = 1,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
}) => {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const handleClickDecrement = () => {
    if (value > min && !disabled) {
      const newValue = value - 1
      setValue(newValue)
      onChange?.(newValue)
    }
  }

  const handleClickIncrement = () => {
    if (value < max && !disabled) {
      const newValue = value + 1
      setValue(newValue)
      onChange?.(newValue)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value)
    
    if (isNaN(inputValue)) {
      setValue(min)
      onChange?.(min)
      return
    }

    if (inputValue < min) {
      setValue(min)
      onChange?.(min)
    } else if (inputValue > max) {
      setValue(max)
      onChange?.(max)
    } else {
      setValue(inputValue)
      onChange?.(inputValue)
    }
  }

  return (
    <div
      className={`nc-NcInputNumber flex items-center justify-between space-x-5 ${className}`}
      data-nc-id="NcInputNumber"
    >
      <div className="nc-NcInputNumber__content flex w-[104px] items-center justify-between sm:w-28">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400"
          type="button"
          onClick={handleClickDecrement}
          disabled={disabled || value <= min}
        >
          <HugeiconsIcon icon={MinusSignIcon} size={18} strokeWidth={2} />
        </button>
        <input
          className="w-12 border-0 bg-transparent p-0 text-center text-sm font-medium outline-none focus:ring-0 dark:bg-transparent"
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={handleInputChange}
          disabled={disabled}
        />
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 bg-white hover:border-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-neutral-400 dark:border-neutral-500 dark:bg-neutral-900 dark:hover:border-neutral-400"
          type="button"
          onClick={handleClickIncrement}
          disabled={disabled || value >= max}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export default NcInputNumber