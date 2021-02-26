import React from 'react'
import {
  getRenderElement,
  isNodeTypeIn,
  setDefaults,
  SlatePlugin,
} from '@udecode/slate-plugins'
import { ReactEditor, useFocused, useSelected, useSlate } from 'slate-react'
import { Editor, Node, Transforms } from 'slate'
import * as faker from 'faker'

export function TransclusionElement({
  attributes,
  htmlAttributes,
  as: Component = 'span',
  className,
  element,
  children,
  ...props
}) {
  const editor = useSlate()
  const selected = useSelected()
  const focused = useFocused()
  const [content, setContent] = React.useState<string>('...')
  const ref = React.useRef<HTMLSpanElement>(null)
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    setTimeout(() => {
      setContent(faker.lorem.sentence())
    }, 0)

    const path = ReactEditor.findPath(editor, element)
    const parent = Node.parent(editor, path)
  }, [])
  return (
    <>
      <Component
        {...attributes}
        data-quote-id={element.doc.id}
        className={`rounded inline p-px`}
        style={{
          backgroundColor:
            show || (focused && selected)
              ? 'rgba(255,187,16,0.15)'
              : 'transparent',
        }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <span
          contentEditable={false}
          className="text-2xl leading-none font-extrabold select-none mr-1"
        >
          [
        </span>
        <span
          ref={ref}
          contentEditable={false}
          {...htmlAttributes}
          className={`select-none leading-normal italic ${className}`}
        >
          {content}
        </span>
        <span
          contentEditable={false}
          className="text-2xl leading-none font-extrabold select-none ml-1"
        >
          ]
        </span>
        <div
          contentEditable={false}
          className={`absolute right-0 top-0 p-1 rounded`}
          style={{
            transform: 'translateX(100%)',
            backgroundColor:
              show || (focused && selected)
                ? 'rgba(255,187,16,0.15)'
                : 'transparent',
          }}
        >
          <p className="text-xs">{element.doc.title}</p>
          <p className="text-xs">{element.doc.author}</p>
        </div>
        {children}
      </Component>
    </>
  )
}

export function TransclusionLeaf({ children, leaf, ...props }) {
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
      return <TransclusionLeaf leaf={leaf}>{children}</TransclusionLeaf>
    }

    return children
  }
}

export function renderTransclusionElement(options?: any) {
  const { transclusion } = setDefaults(options, {})
  return getRenderElement({
    ...transclusion,
    component: TransclusionElement,
  })
}

export const onKeyDownTransclusion = (options?: any) => (
  e: any,
  editor: Editor
) => {
  const { transclusion } = setDefaults(options, {})

  if (e.key === 'Backspace') {
    if (editor.selection) {
      if (isNodeTypeIn(editor, transclusion.type)) {
        e.preventDefault()
        Transforms.removeNodes(editor, {
          match: (n) => n.type === transclusion.type,
        })
        return
      }
    }
  }
}

export function TransclusionPlugin(options?: any): SlatePlugin {
  const { transclusion } = setDefaults(options, {})
  return {
    renderElement: renderTransclusionElement(options),
    inlineTypes: [transclusion.type],
    voidTypes: [transclusion.type],
    onKeyDown: onKeyDownTransclusion(options),
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
