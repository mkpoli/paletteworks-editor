import { formatFilename } from "./file"

beforeAll(() => {
  jest.useFakeTimers('modern')
  jest.setSystemTime(new Date('2020-01-01').getTime())
})

it('should format file name correctly', () => {
  const formatData = {
    project: 'project',
    title: 'title',
    artist: 'artist',
    author: 'author',
  }
  expect(formatFilename('{project}_{date}.sus', formatData)).toBe('project_2020-01-01.sus')
  expect(formatFilename('{title}_{datetime}.sus', formatData)).toBe('title_2020-01-01T00-00-00.000Z.sus')
  expect(formatFilename('{artist}-{title}.txt', formatData)).toBe('artist-title.txt')
  expect(formatFilename('Untitled.txt', formatData)).toBe('Untitled.txt')
})

afterAll(() => {
  // Unlock Time
  jest.useRealTimers()
})
