export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} · Sahai Setu` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · Sahai Setu` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
