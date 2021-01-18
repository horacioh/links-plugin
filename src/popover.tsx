import React from 'react'
import Tippy, { TippyProps } from '@tippyjs/react'
import {
  Popover as BasePopover,
  PopoverDisclosure,
  PopoverStateReturn,
} from 'reakit/Popover'

export function Popover({
  popover: defaultPopover,
  disclosure,
  onHide,
  tooltip,
  children,
  ...props
}: {
  popover: PopoverStateReturn
  disclosure: any
  onHide: () => void
  tooltip?: TippyProps
  children: any
}) {
  const popover: PopoverStateReturn = React.useMemo(
    () => ({
      ...defaultPopover,
      hide: () => {
        onHide()
        defaultPopover.hide()
      },
    }),
    [defaultPopover, onHide]
  )

  return (
    <>
      <PopoverDisclosure
        {...popover}
        ref={disclosure.ref}
        {...disclosure.props}
      >
        {(disclosureProps) => {
          let button = React.cloneElement(disclosure, disclosureProps)
          return tooltip ? <Tippy {...tooltip}>{button}</Tippy> : button
        }}
      </PopoverDisclosure>
      <BasePopover {...popover} hideOnEsc hideOnClickOutside {...props}>
        {/* <PopoverArrow {...popover} /> */}
        {children}
      </BasePopover>
    </>
  )
}
