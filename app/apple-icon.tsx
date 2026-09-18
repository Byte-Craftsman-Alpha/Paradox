import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#191A18",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FCFBF7",
          fontSize: "80px",
          fontWeight: "700",
          fontFamily: "monospace",
        }}
      >
        TP
      </div>
    ),
    { ...size }
  );
}

