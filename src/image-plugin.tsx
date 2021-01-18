import React from 'react'
import {
  getRenderElement,
  setDefaults,
  SlatePlugin,
} from '@udecode/slate-plugins'
import { useFocused, useSelected } from 'slate-react'

function Image({ children, attributes, htmlAttributes, element, ...props }) {
  const focused = useFocused()
  const selected = useSelected()
  return (
    <div
      {...attributes}
      {...props}
      style={{
        boxShadow: focused && selected ? '0 0 0 3px #B4D5FF' : 'none',
        position: 'relative',
        width: '100%',
        maxWidth: 768,
        marginTop: 16,
        marginBottom: 16,
      }}
    >
      <div contentEditable={false}>
        <img
          {...htmlAttributes}
          src={element.url}
          alt={element.alt_text}
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </div>
      {children}
    </div>
  )
}

function renderImage(options?: any) {
  const { img } = setDefaults(options, {})
  return getRenderElement({
    ...img,
    component: Image,
  })
}

export function ImagePlugin(options?: any): SlatePlugin {
  const { img } = setDefaults(options, {})
  return {
    renderElement: renderImage(options),
    voidTypes: [img.type],
    inlineTypes: [img.type],
  }
}
