import React from 'react'
import {
  getRenderElement,
  isNodeTypeIn,
  setDefaults,
  SlatePlugin,
} from '@udecode/slate-plugins'
import { ReactEditor, useSelected } from 'slate-react'

export function Transclusion({ children, leaf, ...props }) {
  const selected = useSelected()
  console.log('selected', selected)
  return (
    <span className={`bg-gray-200 p-1 rounded`}>
      <span contentEditable={false} style={{ userSelect: 'none' }}>
        {children}
      </span>
    </span>
  )
}

export function renderLeafTransclusion(options?: any) {
  return ({ children, leaf }) => {
    if (leaf.type === 'transclusion') {
      return <Transclusion leaf={leaf}>{children}</Transclusion>
    }

    return children
  }
}

export function renderTransclusionElement(options?: any) {
  const { transclusion } = setDefaults(options, {})
  return getRenderElement({
    ...transclusion,
    component: Transclusion,
  })
}

export function TransclusionPlugin(options?: any): SlatePlugin {
  const { transclusion } = setDefaults(options, {})
  return {
    renderLeaf: renderLeafTransclusion(options),
    inlineTypes: [transclusion.type],
    voidTypes: [transclusion.type],
  }
}

export const withTransclusions = (options) => <T extends ReactEditor>(
  editor: T
) => {
  const { transclusion } = setDefaults(options, {})
  const e = editor as T & ReactEditor

  const { insertText } = e

  e.insertText = (text: string) => {
    if (e.selection) {
      if (isNodeTypeIn(e, transclusion.type)) {
        console.log('dentro de transclusion!')
        return
      }
    }

    insertText(text)
  }

  return e
}
