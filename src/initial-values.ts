import {
  buildBlock,
  buildParagraph,
  buildText,
  buildTransclusion,
} from './generator'
export const blockWithOneTransclusion = () =>
  buildBlock({
    children: [buildParagraph({ children: [buildTransclusion()] })],
  })

export const blockWithInlineTransclusion = () =>
  buildBlock({
    children: [
      buildParagraph({
        children: [buildText(), buildTransclusion(), buildText()],
      }),
    ],
  })

export const allTypes = () => [
  buildBlock({children: [buildParagraph({children: [{text: 'paste the link here'}]})]})
]
