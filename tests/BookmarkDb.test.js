import { expect, test } from 'vitest'
import { readFileSync } from 'fs';
import { BookmarkDb } from '../src/BookmarkDb.js'

test('test BookmarkDb moz', () => {
  const data = readFileSync('./tests/data/bookmarks-moz.json')

  let db = new BookmarkDb()
  db.load(JSON.parse(data))
  expect(db.backend).toBe('MozBookmarks')
})

test('test BookmarkDb vivaldi', () => {
  const data = readFileSync('./tests/data/bookmarks-vivaldi.json')

  let db = new BookmarkDb()
  db.load(JSON.parse(data))
  expect(db.backend).toBe('WebKitBookmarks')
})

