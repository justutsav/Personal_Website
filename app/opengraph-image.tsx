import { ImageResponse } from "next/og";

export const alt = "Utsav (justutsav) — Independent Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Matches the site's theme (app/theme.css): warm near-black paper,
 * bone-white ink, fluorescent coral-orange accent. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0e0d0b",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#ff5a24",
              fontSize: 28,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            justutsav
          </div>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              background: "#ff5a24",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#f2ede2",
              fontSize: 120,
              fontWeight: 800,
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            Utsav
          </div>
          <div
            style={{
              color: "#a49a88",
              fontSize: 34,
              marginTop: 28,
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            Independent developer — web apps, dashboards, mobile apps &
            automation, in production for real businesses.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(242,237,226,0.18)",
            paddingTop: 28,
          }}
        >
          <div style={{ color: "#a49a88", fontSize: 24 }}>justutsav.com</div>
          <div style={{ color: "#5b8cff", fontSize: 24 }}>
            ₹75L+ managed · 50+ daily users · 3 businesses
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
