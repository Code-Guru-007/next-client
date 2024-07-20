const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

function getPriority(path, defaultValue) {
  switch (path) {
    case "/":
      return 1;
    default:
      return defaultValue;
  }
}

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  exclude: ["/404", "/500"],
  alternateRefs: [
    {
      href: `${siteUrl}/zh-TW`,
      hreflang: "zh-TW",
    },
    {
      href: `${siteUrl}/en-US`,
      hreflang: "en-US",
    },
  ],
  transform: async (config, path) => {
    let loc = path;
    if (loc.includes("/zh-TW")) {
      return null;
    }
    if (loc.includes("/en-US")) {
      loc = loc.replace("/en-US", "");
    }
    return {
      loc,
      changefreq: config.changefreq,
      priority: getPriority(path, config.priority),
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
