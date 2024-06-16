/* eslint-disable */

import { existsSync, statSync, createReadStream } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { api } from "~/trpc/server";
import mime from "mime";
import path from "path";
import { env } from "~/env";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("id");
  const size = searchParams.get("size");
  if (!size) {
    return new NextResponse("Not Found", {
      status: 404,
    });
  }
  if (!trackId) {
    return new NextResponse("Not Found", {
      status: 404,
    });
  }
  const track_data = await api.library.getTrack(parseInt(trackId));
  if (!track_data) {
    return new NextResponse("Not Found", {
      status: 404,
    });
  }

  const coverPath = path.join(
    path.resolve(env.COVER_ART_PATH),
    track_data.mbid + `.${size}.jpg`,
  );
  console.log(coverPath)

  if (!existsSync(coverPath)) {
    return new NextResponse("Referenced file does not exist", {
      status: 500,
    });
  }
  const headers: Record<string, string> = {};

  const contentType =
    mime.getType(track_data.path) || "application/octet-stream";
  headers["Content-Type"] = contentType;

  const stream = createReadStream(coverPath);

  // @ts-ignore
  return new NextResponse(stream, {
    headers,
    status: 200,
  });
}
