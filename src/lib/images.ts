import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * public/images/ に置いた写真を探す (拡張子は jpg / jpeg / png / webp)。
 * 無ければ null を返し、呼び出し側は写真なしのデザインにする。
 */
export function findImage(name: string): string | null {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const file = `${name}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", "images", file))) return `/images/${file}`;
  }
  return null;
}
