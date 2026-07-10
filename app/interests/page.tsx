import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { InterestsWorld } from "@/components/interests/InterestsWorld";
import { getMonkeytypeStats } from "@/lib/activity";

export const metadata: Metadata = {
  title: "Interests — Utsav",
  description:
    "The interests wing: a small real-time 3D world of the obsessions off the clock — typing sprints, music, edits, and worlds worth getting lost in. Desktop only.",
};

/**
 * The exploration wing — a desktop-only physics playground where each
 * obsession is a glowing station (see components/interests/). Mobile and
 * weak-GPU visitors get a gate with the live typing stats instead.
 */
export default async function Interests() {
  const monkeytype = await getMonkeytypeStats();

  return (
    <>
      <Nav />
      <main>
        <InterestsWorld monkeytype={monkeytype} />
      </main>
    </>
  );
}
