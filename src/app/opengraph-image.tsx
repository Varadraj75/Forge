import { ImageResponse } from "next/og";
import { SITE_CONFIG, SITE_URL } from "@/lib/constants";

export const runtime = "edge";
export const alt = `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0A0A0B",
          padding: "60px 80px",
          color: "#F5F6F4",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(95deg, #c7f23c 0%, #4fe6b0 46%, #1fc9f5 100%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#C7F23C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 900,
              color: "#0A0A0B",
            }}
          >
            F
          </div>
          <span style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.04em" }}>
            {SITE_CONFIG.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "20px",
              color: "#C7F23C",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Hackathon-Driven Talent Platform
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: "1000px",
            }}
          >
            {SITE_CONFIG.tagline}
          </div>
          <div style={{ fontSize: "24px", color: "#9A9AA2", maxWidth: "880px" }}>
            Post your hardest problem as a live challenge. Hire from the work, not the résumé.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #26262B",
            paddingTop: "24px",
            fontSize: "18px",
            color: "#6C6C72",
          }}
        >
          <span>{new URL(SITE_URL).host}</span>
          <span style={{ color: "#C7F23C" }}>IEEE IGDTUW Open Source Week 10.0</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
