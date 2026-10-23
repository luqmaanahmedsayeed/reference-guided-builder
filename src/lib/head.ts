export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} · OPD Saathi` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · OPD Saathi` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
