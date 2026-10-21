/** Motion tokens (ecc motion-foundations style): every animation imports from here. */
export const motionTokens = {
  duration: { fast: 0.15, normal: 0.3, slow: 0.6, story: 1.2 },
  easing: { smooth: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  distance: { sm: 8, md: 16, lg: 32, xl: 48 },
  scale: { press: 0.97, pop: 1.02, subtle: 0.95 },
  stagger: 0.08,
} as const;

export const springs = {
  gentle: { type: "spring", stiffness: 260, damping: 30 },
  snappy: { type: "spring", stiffness: 500, damping: 34 },
  counter: { type: "spring", stiffness: 90, damping: 20 },
} as const;

export const reveal = {
  initial: { opacity: 0, y: motionTokens.distance.lg },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth },
} as const;
