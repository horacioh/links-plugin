import React from 'react'
import {
  getPreventDefaultHandler,
  isMarkActive,
  MARK_BOLD,
  MARK_ITALIC,
  toggleMark,
} from '@udecode/slate-plugins'
import { useSlate } from 'slate-react'
import { Button } from 'reakit/Button'
import Tippy, { TippyProps } from '@tippyjs/react'

export type ToolbarMarkProps = {
  className?: string
  children: any
  type: string
  clear?: string | string[]
  tooltip?: TippyProps
}

const tooltipContents = {
  [MARK_BOLD]: 'Bold (⌘B)',
  [MARK_ITALIC]: 'Italic (⌘I)',
}

export function ToolbarMark({
  type,
  clear = '',
  children,
  tooltip = {},
  ...props
}: ToolbarMarkProps) {
  const editor = useSlate()
  const active = isMarkActive(editor, type)
  return (
    <Tippy
      content={tooltipContents[type]}
      arrow
      offset={[0, 16]}
      delay={0}
      duration={[200, 0]}
      hideOnClick={false}
      {...tooltip}
    >
      <Button
        className={`p-1 w-6 h-6 flex items-center justify-center ${
          active ? 'text-white' : 'text-gray-500'
        }`}
        onMouseDown={getPreventDefaultHandler(toggleMark, editor, type, clear)}
      >
        {children}
      </Button>
    </Tippy>
  )
}
