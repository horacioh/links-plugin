import 'tippy.js/dist/tippy.css'
import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { Slate, withReact } from 'slate-react'
import {
  EditablePlugins,
  pipe,
  ParagraphPlugin,
  DEFAULTS_PARAGRAPH,
  withInlineVoid,
  withSelectOnBackspace,
  BoldPlugin,
  BalloonToolbar,
  MARK_BOLD,
  MARK_ITALIC,
  DEFAULTS_BOLD,
  ItalicPlugin,
  DEFAULTS_ITALIC,
  setDefaults,
} from '@udecode/slate-plugins'
import { BlockPlugin } from './block-plugin'
import { BlockListPlugin } from './blocklist-plugin'
import { LinkPlugin, withLinks, ToolbarLink } from './link-plugin'
import { ImagePlugin } from './image-plugin'
import { Paragraph } from './paragraph-plugin'
import { Bold, Italic } from 'react-feather'
import { LinkMenu } from './link-menu'
import { useMenuState } from 'reakit/Menu'
import { ToolbarMark } from './toolbar-mark'
import { TransclusionPlugin, withTransclusions } from './transclusion-plugin'

const options = {
  p: {
    ...DEFAULTS_PARAGRAPH,
    component: Paragraph,
  },
  block: {
    type: 'block',
    rootProps: {
      style: {
        position: 'relative',
      },
    },
  },
  block_list: {
    type: 'block_list',
    rootProps: {},
  },
  link: {
    type: 'a',
    rootProps: {
      as: 'a',
      className: 'mintter-link underline font-light',
    },
  },
  img: {
    type: 'img',
    rootProps: {
      className: 'mintter-img',
    },
  },
  transclusion: {
    type: 'transclusion',
    rootProps: {
      as: 'span',
      className: 'mintter-transclusion',
    },
  },
  ...DEFAULTS_BOLD,
  ...DEFAULTS_ITALIC,
}
const plugins = [
  ParagraphPlugin(options),
  BlockPlugin(options),
  BlockListPlugin(options),
  LinkPlugin(options),
  ImagePlugin(options),
  BoldPlugin(options),
  ItalicPlugin(options),
  TransclusionPlugin(options),
]

const initialValue = [
  {
    type: 'block_list',
    listStyle: 'none',
    children: [
      {
        type: 'block',
        style: 'default',
        id: 'a',
        children: [
          {
            type: 'p',
            children: [
              {
                text: 'normal text ',
              },
              {
                type: 'transclusion',
                id: 'doc1/a2',
                text: 'content of a transclusion. is not editable!',
              },
              {
                text: ' and more normal text.',
              },
            ],
          },
        ],
      },
    ],
  },
]

function useEditor(plugins, options) {
  const withPlugins = [
    withReact,
    withHistory,
    withInlineVoid({ plugins }),
    withSelectOnBackspace({ allow: [options.img.type] }),
    withLinks(options),
    withTransclusions(options),
  ] as const

  return useMemo(() => pipe(createEditor(), ...withPlugins), [])
}

const App = () => {
  const [value, setValue] = useState<any>(initialValue)
  const linkMenu = useMenuState({ loop: true, wrap: true })
  const customOptions = setDefaults(
    {
      link: {
        menu: linkMenu,
      },
    },
    options
  )
  const editor = useEditor(plugins, customOptions)

  return (
    <>
      <div className="px-8">
        <h1 className="text-3xl font-bold">Link editor example</h1>
        <p className="font-bold">things you can try:</p>
        <p> - select any part of the content and add a link</p>
        <p> - paste a URL and press enter to create a link</p>
        <button
          onClick={() => {
            linkMenu.toggle()
          }}
        >
          toggle link menu
        </button>
      </div>
      <div className="mt-20">
        <Slate
          editor={editor}
          value={value}
          onChange={(newValue) => {
            setValue(newValue)
          }}
        >
          <EditablePlugins
            style={{
              border: '1px solid #ccc',
              padding: '1em',
              fontFamily:
                '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
            }}
            plugins={plugins}
            placeholder="Enter some plain text..."
          />
          <BalloonToolbar
            arrow
            styles={{
              root: {
                minHeight: 24,
                marginTop: '-8px',
                paddingTop: 4,
                paddingBottom: 4,
              },
            }}
          >
            <ToolbarMark type={MARK_BOLD}>
              <Bold />
            </ToolbarMark>
            <ToolbarMark type={MARK_ITALIC}>
              <Italic />
            </ToolbarMark>
            {/* separator */}
            <div
              style={{
                width: 1,
                height: 20,
                backgroundColor: 'white',
                opacity: '0.7',
                margin: '0 8px',
              }}
            />
            <ToolbarLink {...options} />
            {/* <div
              style={{
                width: 1,
                height: 24,
                backgroundColor: 'white',
                opacity: '0.5',
                margin: '0 4px',
              }}
            /> */}
            {/* separator */}
          </BalloonToolbar>
          <LinkMenu menu={linkMenu} />
        </Slate>
        <code>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </code>
      </div>
    </>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
