import { existsSync, statSync, createReadStream } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { api } from "~/trpc/server";
import mime from "mime";
import path from "path";

interface TrackData {
  path: string;
}
function sanitizePath(path: string): string {
  return path.replace(/\/\.\.\//g, "/");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("id");
  if (!trackId) {
    return new NextResponse("Not Found", {
      status: 404,
    });
  }
  const track_data: TrackData | null = await api.library.getTrack(
    parseInt(trackId),
  );
  if (!track_data) {
    return new NextResponse("Not Found", {
      status: 404,
    });
  }
  if (!existsSync(track_data.path)) {
    return new NextResponse("Referenced file does not exist", {
      status: 500,
    });
  }
  const stat = statSync(track_data.path);
  const totalSize = stat.size;
  const headers: Record<string, string> = {
    "Content-Length": totalSize.toString(),
  };

  if (request.headers.get("range")) {
    const parts = request.headers
      .get("range")!
      .replace(/bytes=/, "")
      .split("-");
    const start = parseInt(parts[0] as string);
    const end = parts[1] ? parseInt(parts[1]) : totalSize - 1;
    const chunkSize = end - start + 1;

    headers["Content-Range"] = `bytes ${start}-${end}/${totalSize}`;
    headers["Accept-Ranges"] = "bytes";
    headers["Content-Length"] = chunkSize.toString();

    const stream = createReadStream(track_data.path, { start, end });
    // @ts-ignore
    return new NextResponse(stream, {
      headers,
      status: 206,
    });
  } else {
    const contentType =
      mime.getType(track_data.path) || "application/octet-stream";
    headers["Content-Type"] = contentType;

    const stream = createReadStream(track_data.path);

    // @ts-ignore
    return new NextResponse(stream, {
      headers,
      status: 200,
    });
  }
}
