import React from 'react'
import {
  getRenderElement,
  setDefaults,
  SlatePlugin,
} from '@udecode/slate-plugins'

const styleMap = {
  ul: 'ul',
  ol: 'ol',
  none: 'div',
}

function BlockList({
  children,
  element,
  attributes,
  htmlAttributes,
  ...props
}) {
  let Component = styleMap[element.listStyle]
  return (
    <Component
      {...attributes}
      {...htmlAttributes}
      style={{ paddingLeft: 18 }}
      {...props}
    >
      {children}
    </Component>
  )
}

function renderBlockLists(options?: any) {
  const { block_list } = setDefaults(options, {})
  return getRenderElement({
    ...block_list,
    component: BlockList,
  })
}

export function BlockListPlugin(options?: any): SlatePlugin {
  return {
    renderElement: renderBlockLists(options) as any,
  }
}
