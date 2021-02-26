import React from 'react'
import {
  getParent,
  getRenderElement,
  setDefaults,
  SlatePlugin,
} from '@udecode/slate-plugins'
import { ReactEditor, useEditor } from 'slate-react'

const styleMap = {
  ul: 'li',
  ol: 'li',
  none: 'div',
}

function Block({ children, element, attributes, htmlAttributes, ...props }) {
  const editor = useEditor()
  const path = ReactEditor.findPath(editor, element)
  const parent: any = getParent(editor, path)
  const Component = styleMap[parent[0].listStyle as any] || 'div'
  const [show, setShow] = React.useState(false)
  return (
    <Component
      style={{
        position: 'relative',
        backgroundColor: show ? '#f2f2f2' : 'transparent',
      }}
      {...attributes}
      {...props}
      data-block-id={element.id}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <div contentEditable={false}>
        <span
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            fontSize: 10,
            color: 'rebeccapurple',
            fontWeight: 700,
          }}
        >
          {element.id}
        </span>
      </div>
    </Component>
  )
}

function renderBlocks(options?: any) {
  const { block } = setDefaults(options, {})
  return getRenderElement({
    ...block,
    component: Block,
  })
}

export function BlockPlugin(options?: any): SlatePlugin {
  return {
    renderElement: renderBlocks(options),
  }
}
