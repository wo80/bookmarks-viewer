import { expect, test } from 'vitest'
import { readFileSync } from 'fs';
import { WebKitBookmarks } from '../src/WebKitBookmarks.js'

const data = readFileSync('./tests/data/bookmarks-vivaldi.json')
const json = JSON.parse(data)
const db = new WebKitBookmarks(json)

test('test bookmarks.select []', () => {
  const { folders, bookmarks, path } = db.select([])
  expect(folders.length).toBe(2)
  expect(bookmarks.length).toBe(0)
  expect(path.length).toBe(0)
})

test('test bookmarks.select [0]', () => {
  const { folders, bookmarks, path } = db.select([0])
  expect(folders.length).toBe(3)
  expect(bookmarks.length).toBe(1)
  expect(path).toStrictEqual(['Lesezeichen'])

  const { title, uri } = bookmarks[0]
  expect(title).toBe('wo80/bookmarks-viewer')
  expect(uri).toBe('https://github.com/wo80/bookmarks-viewer')
})

test('test bookmarks.select [0, 1, 0]', () => {
  const { folders, bookmarks, path } = db.select([0, 1, 0])
  expect(folders.length).toBe(0)
  expect(bookmarks.length).toBe(4)
  expect(path.length).toBe(3)
  expect(path).toStrictEqual(['Lesezeichen', 'WebDev', 'MDN'])

  const { title, uri } = bookmarks[0]
  expect(title).toBe('Learn web development')
  expect(uri).toBe('https://developer.mozilla.org/en-US/docs/Learn_web_development')
})

test('test bookmarks.search "javascript"', () => {
  const { count, folders } = db.search('javascript')
  expect(count).toBe(3)
  expect(folders.length).toBe(2)
  expect(folders[0].items.length).toBe(2)
  expect(folders[0].path).toStrictEqual(['WebDev', 'JavaScript'])
  expect(folders[1].items.length).toBe(1)
  expect(folders[1].path).toStrictEqual(['WebDev', 'MDN'])

  const { title, uri } = folders[0].items[0]
  expect(title).toBe('The Modern JavaScript Tutorial')
  expect(uri).toBe('https://javascript.info/')
})
