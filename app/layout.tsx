import "./globals.css";
import type { Metadata, Viewport } from "next";
import PokeballCursor from "@/components/PokeballCursor";

export const metadata: Metadata = {
  title: "Pokémon Trivia Arena",
  description:
    "A two-player Pokémon trivia battle. Six categories, escalating difficulty, " +
    "60-second timer, real Pokémon cries, and chiptune battle music."
};

export const viewport: Viewport = {
  themeColor: "#ee1515",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover"
};

const FLOATERS = [
  { src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",  s: { left: "4%",  top: "8%",  animationDelay: "-2s",  width: 150, height: 150 } },
  { src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",   s: { left: "78%", top: "12%", animationDelay: "-5s",  width: 140, height: 140 } },
  { src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",                     s: { left: "12%", top: "68%", animationDelay: "-8s",  width: 90,  height: 90 }, ball: true },
  { src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",   s: { left: "72%", top: "72%", animationDelay: "-11s", width: 140, height: 140 } },
  { src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png",                    s: { left: "50%", top: "86%", animationDelay: "-3s",  width: 90,  height: 90 }, ball: true },
  { src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",   s: { left: "48%", top: "4%",  animationDelay: "-7s",  width: 120, height: 120 } }
];

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-floaters" aria-hidden="true">
          {FLOATERS.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={f.src}
              alt=""
              className={`bg-floater${f.ball ? " ball" : ""}`}
              style={f.s}
            />
          ))}
        </div>
        <main className="shell">{children}</main>
        <PokeballCursor />
      </body>
    </html>
  );
}
