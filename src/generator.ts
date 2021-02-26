import faker from 'faker'
import { nanoid } from 'nanoid'

export function buildBlock({ id = nanoid(8), children }: any = {}) {
  if (children === undefined) {
    children = [buildParagraph()]
  }
  return {
    type: 'block',
    id,
    children,
  }
}

export function buildParagraph({ children }: any = {}) {
  if (children === undefined) {
    children = [buildText()]
  }
  return {
    type: 'p',
    children,
  }
}

export function buildText({ text }: any = {}) {
  if (text === undefined) {
    text = faker.lorem.paragraph()
  }

  return {
    text,
  }
}

export function buildTransclusion({ id, doc }: any = {}) {
  if (doc === undefined) {
    doc = {
      id: `${nanoid(8)}`,
      title: faker.lorem.sentence(),
      author: faker.finance.bitcoinAddress(),
    }
  }

  if (id === undefined) {
    id = `${doc.id}/${nanoid(4)}`
  }

  return {
    type: 'transclusion',
    id,
    doc,
    children: [{ text: '' }],
  }
}
