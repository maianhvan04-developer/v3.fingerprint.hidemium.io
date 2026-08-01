# Layout architecture

The page uses a single App Router route. A static full-width header precedes one centered `main` container. The page background is a dark canvas with two fixed radial purple glows.

Desktop content width is 1052px inside a 1100px main box. Information sections use `280px + 1fr`; diagnostic cards use `repeat(3, 1fr)`; CDI rows use `24px 62px 1fr auto`. Tablet changes information and WebRTC to one column and diagnostics to two. Mobile changes diagnostics to one column and CDI to a stacked two-column row.

Long hashes, UA strings, and JSON use wrapping/scroll containment so no section forces horizontal page overflow.

