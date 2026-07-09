# Hero media pool

Drop videos/photos here. One is picked at random per browser session and
kept for that session; clicking the hero card shuffles to the next.

Expected names (edit the list in `components/HeroExperience.tsx` to match):

    01.mp4
    02.mp4
    03.jpg
    04.jpg

The existing `../cherry_blosson_3840_2160_24fps.mp4` is already in the pool.

Notes:
- Video: MP4 (H.264) or WebM, landscape ~16:9, short muted loops, keep small (~<8MB).
- Photo: JPG/PNG/WebP, landscape.
- Missing/broken sources auto-skip to the next entry, so incomplete slots are safe.

# Contact media

Also drop a single contact clip/photo one level up:

    ../contact.mp4   (preferred)
    ../contact.jpg   (fallback)

It renders on the right of the contact section and fades into the page on
its left edge. Portrait or landscape both fine.
