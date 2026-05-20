import { expect, test } from 'vitest'
import { readFileSync } from 'fs';
import { MozBookmarks } from '../src/MozBookmarks.js'

const data = readFileSync('./tests/data/bookmarks-moz.json')
const json = JSON.parse(data)
const db = new MozBookmarks(json)

test('test bookmarks.select []', () => {
  const { folders, bookmarks, path } = db.select([])
  expect(folders.length).toBe(3)
  expect(bookmarks.length).toBe(0)
  expect(path.length).toBe(0)
})

test('test bookmarks.select [0]', () => {
  const { folders, bookmarks, path } = db.select([0])
  expect(folders.length).toBe(0)
  expect(bookmarks.length).toBe(1)
  expect(path.length).toBe(1)
  expect(path[0]).toBe('menu')

  const { title, uri } = bookmarks[0]
  expect(title).toBe('wo80/bookmarks-viewer')
  expect(uri).toBe('https://github.com/wo80/bookmarks-viewer')
})

test('test bookmarks.select [1, 0, 0]', () => {
  const { folders, bookmarks, path } = db.select([1, 0, 0])
  expect(folders.length).toBe(0)
  expect(bookmarks.length).toBe(4)
  expect(path.length).toBe(3)
  expect(path).toStrictEqual(['toolbar', 'WebDev', 'MDN'])

  const { title, uri } = bookmarks[0]
  expect(title).toBe('Learn web development')
  expect(uri).toBe('https://developer.mozilla.org/en-US/docs/Learn_web_development')
})

test('test bookmarks.search "javascript"', () => {
  const { count, folders } = db.search('javascript')
  expect(count).toBe(3)
  expect(folders.length).toBe(2)
  expect(folders[0].items.length).toBe(2)
  expect(folders[0].path).toStrictEqual(['toolbar', 'WebDev', 'JavaScript'])
  expect(folders[1].items.length).toBe(1)
  expect(folders[1].path).toStrictEqual(['toolbar', 'WebDev', 'MDN'])

  const { title, uri } = folders[0].items[0]
  expect(title).toBe('The Modern JavaScript Tutorial')
  expect(uri).toBe('https://javascript.info/')
})
