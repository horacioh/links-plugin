import { getParent } from '@udecode/slate-plugins'
import React from 'react'
import { ReactEditor, useEditor } from 'slate-react'

export function Paragraph({
  children,
  element,
  attributes,
  htmlAttributes,
  as: Component,
  ...props
}) {
  const editor = useEditor()
  const path = ReactEditor.findPath(editor, element)
  const parent: any = getParent(editor, path)
  let style: any = {
    position: 'relative',
    width: '100%',
    maxWidth: 640,
  }
  if (parent[0].style === 'heading') {
    console.log('ES HEADING!', path)
    style = {
      fontWeight: '800',
      fontSize: '1.5em',
    }
  }
  return (
    <Component {...attributes} style={style} {...htmlAttributes} {...props}>
      {children}
    </Component>
  )
}
