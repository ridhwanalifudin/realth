import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
          borderRadius: 42,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "white",
              fontFamily: "sans-serif",
              lineHeight: 1,
              letterSpacing: -4,
            }}
          >
            R
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "rgba(255,255,255,0.8)",
              fontFamily: "sans-serif",
              letterSpacing: 2,
            }}
          >
            EALTH
          </span>
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
