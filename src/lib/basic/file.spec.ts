import { formatFilename } from './file'

describe('formatFilename', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2020-01-01').getTime())
  })

  const formatData = {
    project: 'project',
    title: 'title',
    artist: 'artist',
    author: 'author',
  }

  it('should replace {keyword} with real data', () => {
    expect(formatFilename('{artist}-{title}.txt', formatData)).toBe(
      'artist-title.txt'
    )
  })

  it('should replace {date} with real date', () => {
    expect(formatFilename('{project}_{date}.sus', formatData)).toBe(
      'project_2020-01-01.sus'
    )
  })

  it('should replace {datetime} with filename-safe time', () => {
    expect(formatFilename('{title}_{datetime}.sus', formatData)).toBe(
      'title_2020-01-01T00-00-00.000Z.sus'
    )
  })

  it('should keep unknown {keyword} as is', () => {
    expect(formatFilename('{unknown}.txt', formatData)).toBe('{unknown}.txt')
  })

  it('should keep other strings intact', () => {
    expect(formatFilename('Untitled.txt', formatData)).toBe('Untitled.txt')
  })

  afterAll(() => {
    jest.useRealTimers()
  })
})
