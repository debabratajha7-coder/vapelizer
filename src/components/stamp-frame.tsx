import type { CSSProperties, ReactNode } from "react";

export type SceneKind = "disposable" | "salt" | "device" | "kit" | "hero";

const FRAME = { w: 1200, h: 760 };
const HOLE = { x: 70, y: 88, w: 470, h: 580 };

export function sceneKindFor(slug = "", name = ""): SceneKind {
  const value = `${slug} ${name}`.toLowerCase();
  if (/(salt|liquid|juice)/.test(value)) return "salt";
  if (/kit/.test(value)) return "kit";
  if (/(device|pod|coil|mod)/.test(value)) return "device";
  return "disposable";
}

const sceneFiles: Record<SceneKind, string> = {
  hero: "/scenes/hero.jpg",
  disposable: "/scenes/disposable.jpg",
  salt: "/scenes/salt.jpg",
  device: "/scenes/device.jpg",
  kit: "/scenes/device.jpg",
};

export function sceneFor(product: { images?: { url: string }[]; categorySlug?: string; name?: string }): string {
  const uploaded = product.images?.[0]?.url;
  if (uploaded) return uploaded;
  return sceneFiles[sceneKindFor(product.categorySlug, product.name)];
}

export function sceneFocus(name = ""): string {
  let n = 0;
  for (const char of name) n += char.charCodeAt(0);
  return `${18 + (n % 64)}% ${28 + (n % 36)}%`;
}

function stampPath(x: number, y: number, w: number, h: number, nx: number, ny: number) {
  const sx = w / nx;
  const sy = h / ny;
  const r = Math.min(sx, sy) * 0.42;
  const d: string[] = [];

  for (let i = 0; i < nx; i += 1) {
    const cx = x + sx * i + sx / 2;
    const x1 = cx - r;
    const x2 = cx + r;
    d.push(i === 0 ? `M ${x1} ${y}` : `L ${x1} ${y}`);
    d.push(`A ${r} ${r} 0 0 1 ${x2} ${y}`);
  }
  d.push(`L ${x + w} ${y}`);

  for (let i = 0; i < ny; i += 1) {
    const cy = y + sy * i + sy / 2;
    d.push(`L ${x + w} ${cy - r}`);
    d.push(`A ${r} ${r} 0 0 1 ${x + w} ${cy + r}`);
  }
  d.push(`L ${x + w} ${y + h}`);

  for (let i = nx - 1; i >= 0; i -= 1) {
    const cx = x + sx * i + sx / 2;
    d.push(`L ${cx + r} ${y + h}`);
    d.push(`A ${r} ${r} 0 0 1 ${cx - r} ${y + h}`);
  }
  d.push(`L ${x} ${y + h}`);

  for (let i = ny - 1; i >= 0; i -= 1) {
    const cy = y + sy * i + sy / 2;
    d.push(`L ${x} ${cy + r}`);
    d.push(`A ${r} ${r} 0 0 1 ${x} ${cy - r}`);
  }
  d.push("Z");
  return d.join(" ");
}

function maskUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const STAMP_MASK = maskUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><path fill="white" d="${stampPath(0, 0, 400, 280, 8, 6)}"/></svg>`,
);

const HOLE_MASK = maskUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FRAME.w} ${FRAME.h}"><path fill="white" fill-rule="evenodd" d="M0 0H${FRAME.w}V${FRAME.h}H0Z ${stampPath(HOLE.x, HOLE.y, HOLE.w, HOLE.h, 7, 6)}"/></svg>`,
);

function maskStyle(image: string): CSSProperties {
  return {
    WebkitMaskImage: image,
    maskImage: image,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
}

export function StampPhoto({
  src,
  focus = "center",
  className = "",
  alt = "",
}: {
  src: string;
  focus?: string;
  className?: string;
  alt?: string;
}) {
  return (
    <div className={`[filter:drop-shadow(0_16px_18px_rgba(48,36,22,0.16))] ${className}`}>
      <div
        role="img"
        aria-label={alt}
        className="aspect-[10/7] w-full bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${JSON.stringify(src)})`,
          backgroundPosition: focus,
          ...maskStyle(STAMP_MASK),
        }}
      />
    </div>
  );
}

export function PhotoWithHole({
  src,
  focus = "center",
  children,
  className = "",
}: {
  src: string;
  focus?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative aspect-[1200/760] w-full overflow-hidden bg-paper ${className}`}>
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${JSON.stringify(src)})`,
          backgroundPosition: focus,
          ...maskStyle(HOLE_MASK),
        }}
      />
      <div
        className="absolute z-10 flex flex-col justify-center overflow-hidden"
        style={{
          left: `${(HOLE.x / FRAME.w) * 100}%`,
          top: `${(HOLE.y / FRAME.h) * 100}%`,
          width: `${(HOLE.w / FRAME.w) * 100}%`,
          height: `${(HOLE.h / FRAME.h) * 100}%`,
          padding: "9% 11%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
