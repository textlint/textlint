const users = [
    {
        caption: "JavaScript Primer",
        image: "https://78.media.tumblr.com/avatar_c63524fcb991_128.png",
        infoLink: "https://jsprimer.net",
        pinned: true
    },
    {
        caption: "jp.vuejs.org",
        image: "https://avatars3.githubusercontent.com/u/6128107?s=200&v=4",
        infoLink: "https://github.com/vuejs/jp.vuejs.org",
        pinned: true
    },
    {
        caption: "SURVIVEJS - WEBPACK",
        image: "https://www.gravatar.com/avatar/b26ec3c2769168c2cbc64cc3df9cdd9c?s=200",
        infoLink: "https://survivejs.com/webpack/",
        pinned: true
    },
    {
        caption: "Hoodie",
        image: "https://hoodiehq.github.io/hoodie-css/src/content_img/animals/low-profile-dog-3.png",
        infoLink: "http://hood.ie/",
        pinned: true
    },
    {
        caption: "GIS実習オープン教材",
        image: "https://raw.githubusercontent.com/gis-oer/gis-oer/master/img/logo/logo_gis-oer_01_256px.png",
        infoLink: "https://github.com/gis-oer/gis-oer",
        pinned: true
    },
    {
        caption: "株式会社ソラコム",
        image: "/img/soracom.png",
        infoLink: "https://soracom.jp",
        pinned: true
    },
    {
        caption: "校正さん",
        image: "https://kohsei-san.hata6502.com/favicon.png",
        infoLink: "https://kohsei-san.hata6502.com/lp/",
        pinned: true
    }
];

const siteConfig = {
    title: "textlint" /* title for your website */,
    tagline: "The pluggable linting tool for text and markdown",
    url: "https://textlint.org" /* your website url */,
    cname: "textlint.org",
    editUrl: "https://github.com/textlint/textlint/edit/master/docs/",
    baseUrl: "/" /* base url for your project */,
    organizationName: "textlint", // or set an env variable ORGANIZATION_NAME
    projectName: "textlint",
    onPageNav: "separate",
    headerLinks: [
        { doc: "getting-started", label: "Docs" },
        { href: "https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule", label: "Rules" },
        { blog: true, label: "Blog" },
        { page: "help", label: "Help" },
        {
            href: "https://github.com/textlint/textlint",
            label: "GitHub"
        },
        { search: true }
    ],
    users,
    /* path to images for header/footer */
    headerIcon: "img/textlint-icon_256x256.png",
    footerIcon: "img/textlint-icon_256x256.png",
    favicon: "img/textlint-icon_256x256.png",
    twitterImage: "img/textlint-icon_256x256.png",
    ogImage: "img/textlint-icon_256x256.png",
    /* colors for website */
    colors: {
        primaryColor: "#259eac",
        secondaryColor: "#6f9bf2",
        textColor: "#000000"
    },
    algolia: {
        apiKey: "82014cf9b4a2988df9d5ab7a44d9d3b4",
        indexName: "textlint",
        algoliaOptions: {} // Optional, if provided by Algolia
    },
    // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
    copyright: `Copyright © ${new Date().getFullYear()}textlint organization`,
    highlight: {
        // Highlight.js theme to use for syntax highlighting in code blocks
        theme: "default"
    },
    scripts: ["https://buttons.github.io/buttons.js"],
    // You may provide arbitrary config keys to be used as needed by your template.
    repoUrl: "https://github.com/textlint/textlint"
};

module.exports = siteConfig;
