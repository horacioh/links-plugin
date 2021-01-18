import React from 'react'
import get from 'lodash/get'
import isEqual from 'lodash.isequal'
import { Link as IconLink } from 'react-feather'
import {
  DEFAULTS_LINK,
  getAboveByType,
  getPreventDefaultHandler,
  getRangeBefore,
  getRangeFromBlockStart,
  getRenderElement,
  getSelectionText,
  getText,
  isCollapsed,
  isNodeTypeIn,
  isUrl as isUrlProtocol,
  LinkOptions,
  RangeBeforeOptions,
  setDefaults,
  SlatePlugin,
  unwrapNodesByType,
  upsertLinkAtSelection,
  wrapLink,
} from '@udecode/slate-plugins'
import { usePopoverState } from 'reakit/Popover'
import Tippy from '@tippyjs/react'
import { ReactEditor, useSlate } from 'slate-react'
import { Editor, Range, Transforms } from 'slate'
import { Popover } from './popover'
import { Button } from 'reakit/Button'

/**
 * This is needed so the popover with a form works.
 * this prevents the editor to unset the selection
 * when the popover with an input opens
 */
Transforms.deselect = () => {}

function Link({
  children,
  element,
  attributes,
  htmlAttributes,
  as: Component,
  className,
  ...props
}) {
  return (
    <Tippy
      content={<span className="text-xs">{element.url}</span>}
      placement="auto"
    >
      <Component
        className={`${className} cursor-pointer`}
        href={element.url}
        {...attributes}
        {...htmlAttributes}
        {...props}
      >
        {children}
      </Component>
    </Tippy>
  )
}

function renderLink(options?: any) {
  const { link } = setDefaults(options, {})
  return getRenderElement({
    ...link,
    component: Link,
  })
}

export function LinkPlugin(options?: any): SlatePlugin {
  const { link } = setDefaults(options, {})
  return {
    renderElement: renderLink(options),
    inlineTypes: [link.type],
  }
}

const upsertLink = (
  editor: Editor,
  url: string,
  {
    at,
    ...options
  }: {
    at: Range
  } & LinkOptions
) => {
  const { link } = setDefaults(options, DEFAULTS_LINK)

  unwrapNodesByType(editor, link.type, { at })

  const newSelection = editor.selection as Range

  wrapLink(editor, url, {
    link,
    at: {
      ...at,
      focus: newSelection.focus,
    },
  })
}

function upsertLinkIfValid(
  editor: ReactEditor,
  { link, isUrl }: { link: any; isUrl: (text: string) => boolean }
) {
  const rangeFromBlockStart = getRangeFromBlockStart(editor)
  const textFromBlockStart = getText(editor, rangeFromBlockStart)
  console.log({ rangeFromBlockStart, textFromBlockStart })
  if (rangeFromBlockStart && isUrl(textFromBlockStart)) {
    upsertLink(editor, textFromBlockStart, {
      at: rangeFromBlockStart,
      link,
    })
    return true
  }
}

export const withLinks = (options) => <T extends ReactEditor>(editor: T) => {
  const { link, isUrl } = setDefaults(options, {
    ...DEFAULTS_LINK,
    isUrl: isUrlProtocol,
  })

  const { insertText, insertData } = editor

  const DEFAULT_RANGE_BEFORE_OPTIONS: RangeBeforeOptions = {
    matchString: ' ',
    skipInvalid: true,
    afterMatch: true,
    multiPaths: true,
  }

  const rangeOptions: RangeBeforeOptions = {
    ...DEFAULT_RANGE_BEFORE_OPTIONS,
    ...get(options, 'rangeBeforeOptions', {}),
  }

  editor.insertText = (text) => {
    if (isUrl(text)) {
      console.log('link inserted => ', text)
    }
    if (text === ' ' && isCollapsed(editor.selection)) {
      const selection = editor.selection as Range

      if (upsertLinkIfValid(editor, { link, isUrl })) {
        return insertText(text)
      }

      const beforeWordRange = getRangeBefore(editor, selection, rangeOptions)
      console.log({ beforeWordRange })
      if (beforeWordRange) {
        const beforeWordText = getText(editor, beforeWordRange)
        console.log({ beforeWordText })
        if (isUrl(beforeWordText)) {
          upsertLink(editor, beforeWordText, {
            at: beforeWordRange,
            link,
          })
        }
      }
    }
    insertText(text)
  }

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain')

    if (text) {
      if (isNodeTypeIn(editor, link.type)) {
        return insertText(text)
      }

      if (text.includes('mintter://')) {
        console.log('this is a mintter link => ', text, editor.selection)
        link.menu.show()
        console.log('window selection', window.getSelection())
        return upsertLinkAtSelection(editor, text, {
          link,
        })
      }

      if (isUrl(text)) {
        console.log('link inserted at => ', editor.selection)
        return upsertLinkAtSelection(editor, text, {
          link,
        })
      }
    }

    insertData(data)
  }

  return editor
}

export function useLastEditorSelection(
  editor,
  nullable = false
): [Range, (r: Range) => void] {
  const [selection, updateSelection] = React.useState<Range>(editor.selection)

  const setSelection = React.useCallback(
    (newSelection?: Range) => {
      if (nullable !== true && !newSelection) return
      if (isEqual(selection, newSelection)) return
      updateSelection(newSelection as Range)
    },
    [updateSelection, nullable, selection]
  )

  React.useEffect(() => {
    setSelection(editor.selection)
  }, [editor.selection])

  return [selection, setSelection]
}

export function ToolbarLink({ link: linkOptions }) {
  const options = setDefaults({ link: linkOptions }, DEFAULTS_LINK)
  const editor = useSlate()
  const popover = usePopoverState()
  const [selection] = useLastEditorSelection(editor)
  const [link, setLink] = React.useState<string>('')
  const [anchor, setAnchor] = React.useState<string>(() =>
    getSelectionText(editor)
  )
  const isLink = isNodeTypeIn(editor, options.link.type)

  function handleSubmit(event) {
    event.preventDefault()
    if (link) {
      // convert to link
      Editor.withoutNormalizing(editor, () => {
        upsertLinkAtSelection(editor, link, { wrap: false, ...options })
        Transforms.setNodes(editor, { text: anchor }, { at: selection })
      })
    }

    popover.hide()
    setLink('')
  }

  function handleRemove() {
    const linkNode = getAboveByType(editor, options.link.type)
    if (linkNode) {
      console.log('linkNode exists ', linkNode[0])
      unwrapNodesByType(editor, options.link.type, { at: linkNode[1] })
    } else {
      console.log('linkNode DOES NOT exists ', linkNode)
    }
    popover.hide()
  }

  React.useEffect(() => {
    const linkNode = getAboveByType(editor, options.link.type)
    let link = ''
    if (linkNode) {
      link = linkNode[0].url as string
    }
    setAnchor(getSelectionText(editor))
    setLink(link)
  }, [editor.selection])
  return (
    <Popover
      popover={popover}
      aria-label="Link Popover"
      onHide={() => {
        Transforms.select(editor, selection)
      }}
      tooltip={{
        content: isLink ? 'modify Link' : 'Add Link',
        arrow: true,
        offset: [0, 16],
        delay: 0,
        duration: [200, 0],
        hideOnClick: false,
      }}
      disclosure={
        <Button>
          <span className="p-1 w-6 h-6 flex items-center justify-center">
            <IconLink />
          </span>
        </Button>
      }
    >
      <div
        contentEditable={false}
        className="p-4 pt-2 rounded shadow-lg bg-white w-80 border border-gray-200"
      >
        <p className="font-bold text-black">Link Information</p>
        <form className="block" onSubmit={handleSubmit}>
          <div className="mt-2">
            <label className="block text-xs text-gray-500" htmlFor="address">
              Link Address
            </label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="block border border-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-transparent text-sm text-black px-2 py-1 rounded-sm w-full"
              id="address"
              type="url"
            />
          </div>
          <div className="mt-2">
            <label className="block text-xs text-gray-500" htmlFor="anchor">
              Link Anchor
            </label>
            <input
              disabled
              className="block border border-gray-200 text-sm text-black px-2 py-1 rounded-sm w-full"
              id="anchor"
              value={anchor}
              // onChange={(e) => setAnchor(e.target.value)}
              type="text"
            />
          </div>
          <div className="mt-2 w-full flex items-center justify-between">
            <button
              type="submit"
              className="text-purple-600 px-2 py-1 rounded text-sm focus:bg-gray-100"
            >
              Save
            </button>
            <button
              type="button"
              onClick={getPreventDefaultHandler(handleRemove)}
              disabled={!isLink}
              className={`text-red-600 px-2 py-1 text-sm focus:bg-gray-100 ${
                !isLink ? 'opacity-50' : 'opacity-100'
              }`}
            >
              remove link
            </button>
          </div>
        </form>
      </div>
    </Popover>
  )
}
