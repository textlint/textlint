const users = [
    {
        caption: "SURVIVEJS - WEBPACK",
        image: "https://www.gravatar.com/avatar/b26ec3c2769168c2cbc64cc3df9cdd9c?s=200",
        infoLink: "https://survivejs.com/webpack/",
        pinned: true
    },
    {
        caption: "Hoodie",
        image: "http://hoodiehq.github.io/hoodie-css/src/content_img/animals/low-profile-dog-3.png",
        infoLink: "http://hood.ie/",
        pinned: true
    },
    {
        caption: "JavaScriptの入門書",
        image: "http://78.media.tumblr.com/avatar_c63524fcb991_128.pnj",
        infoLink: "https://asciidwango.github.io/js-primer/ ",
        pinned: true
    },
    {
        caption: "jp.vuejs.org",
        image: "https://avatars3.githubusercontent.com/u/11144750?s=200&v=4",
        infoLink: "https://github.com/vuejs-jp/jp.vuejs.org",
        pinned: true
    }
];

const siteConfig = {
    title: "textlint" /* title for your website */,
    tagline: "The pluggable linting tool for text and markdown",
    url: "https://textlint.github.io" /* your website url */,
    baseUrl: "/" /* base url for your project */,
    organizationName: "textlint", // or set an env variable ORGANIZATION_NAME
    projectName: "textlint",
    onPageNav: "separate",
    headerLinks: [
        { doc: "getting-started", label: "Documentation" },
        { href: "https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule", label: "Rules" },
        { blog: true, label: "Blog" },
        { page: "help", label: "Help" },
        {
            href: "https://github.com/textlint/textlint",
            label: "GitHub"
        }
    ],
    users,
    /* path to images for header/footer */
    headerIcon: "img/textlint-icon_256x256.png",
    footerIcon: "img/textlint-icon_256x256.png",
    favicon: "img/textlint-icon_256x256.png",
    /* colors for website */
    colors: {
        primaryColor: "#259eac",
        secondaryColor: "#6f9bf2",
        textColor: "#000000"
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
