import { getUploadCounts, isFileDrag, isTerminalUploadStatus } from './asset-upload-session.utils'

describe('asset upload session utils', () => {
  it('detects file drags', () => {
    expect(isFileDrag(['text/plain', 'Files'])).toBe(true)
    expect(isFileDrag(['text/plain'])).toBe(false)
    expect(isFileDrag(null)).toBe(false)
  })

  it('identifies terminal statuses', () => {
    expect(isTerminalUploadStatus('complete')).toBe(true)
    expect(isTerminalUploadStatus('error')).toBe(true)
    expect(isTerminalUploadStatus('uploading')).toBe(false)
  })

  it('counts upload states', () => {
    expect(
      getUploadCounts([
        { status: 'queued', progress: 0, type: 'image' },
        { status: 'uploading', progress: 10, type: 'audio' },
        { status: 'complete', progress: 100, type: 'video' },
        { status: 'error', progress: 0, type: 'image' },
      ]),
    ).toEqual({
      total: 4,
      active: 1,
      queued: 1,
      complete: 1,
      error: 1,
    })
  })
})
