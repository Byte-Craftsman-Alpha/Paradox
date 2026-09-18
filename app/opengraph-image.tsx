import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Team Paradox — Student Tech Studio in Gorakhpur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#191A18",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px",
          color: "#FCFBF7",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "18px",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "#8E918B",
          }}
        >
          <div style={{ width: "12px", height: "12px", background: "#FCFBF7" }} />
          TEAM PARADOX · GORAKHPUR, UTTAR PRADESH, INDIA
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "60px",
              fontWeight: "600",
              letterSpacing: "-0.02em",
              lineHeight: "1.05",
            }}
          >
            Contradiction, engineered.
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#B8B9B5",
              maxWidth: "920px",
              lineHeight: "1.4",
            }}
          >
            Five students building real systems in product, web, mobile, AI and security. Evidence over adjectives.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #2E302D",
            paddingTop: "28px",
            fontSize: "16px",
            color: "#8E918B",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
          }}
        >
          <div>Theft Alert · EduPortal · ARIA · Perkify · Career Boost · Local Way</div>
          <div>www.teamparadox.in</div>
        </div>
      </div>
    ),
    { ...size }
  );
}

