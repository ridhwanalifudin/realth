import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
          borderRadius: 112,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 220,
              fontWeight: 900,
              color: "white",
              fontFamily: "sans-serif",
              lineHeight: 1,
              letterSpacing: -10,
            }}
          >
            R
          </span>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "rgba(255,255,255,0.8)",
              fontFamily: "sans-serif",
              letterSpacing: 6,
            }}
          >
            EALTH
          </span>
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
