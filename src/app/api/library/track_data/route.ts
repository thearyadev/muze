/* eslint-disable */

import { existsSync, statSync, createReadStream } from 'node:fs'
import { type NextRequest, NextResponse } from 'next/server'
import mime from 'mime'
import { getTrack } from '~/lib/actions/library'

interface TrackData {
  path: string
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const trackId = searchParams.get('id')
  if (!trackId) {
    return new NextResponse('Not Found', {
      status: 404,
    })
  }
  const { content: track_data } = await getTrack(trackId)
  if (!track_data) {
    return new NextResponse('Not Found', {
      status: 404,
    })
  }
  if (!existsSync(track_data.path)) {
    return new NextResponse('Referenced file does not exist', {
      status: 500,
    })
  }
  const stat = statSync(track_data.path)
  const totalSize = stat.size
  const headers: Record<string, string> = {
    'Content-Length': totalSize.toString(),
  }

  if (request.headers.get('range')) {
    // biome-ignore lint/style/noNonNullAssertion : dont care just error
    const parts = request.headers
      .get('range')!
      .replace(/bytes=/, '')
      .split('-')
    const start = Number.parseInt(parts[0] as string)
    const end = parts[1] ? Number.parseInt(parts[1]) : totalSize - 1
    const chunkSize = end - start + 1

    headers['Content-Range'] = `bytes ${start}-${end}/${totalSize}`
    headers['Accept-Ranges'] = 'bytes'
    headers['Content-Length'] = chunkSize.toString()

    const stream = createReadStream(track_data.path, { start, end })
    // @ts-ignore
    return new NextResponse(stream, {
      headers,
      status: 206,
    })
  }
  const contentType =
    mime.getType(track_data.path) || 'application/octet-stream'
  headers['Content-Type'] = contentType

  const stream = createReadStream(track_data.path)

  // @ts-ignore
  return new NextResponse(stream, {
    headers,
    status: 200,
  })
}
