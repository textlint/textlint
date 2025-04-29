import { themes as prismThemes } from "prism-react-renderer";

export default {
    title: "textlint",
    tagline: "The pluggable linting tool for text and markdown",
    url: "https://textlint.org",
    baseUrl: "/",
    organizationName: "textlint",
    projectName: "textlint",
    scripts: ["https://buttons.github.io/buttons.js"],
    favicon: "img/textlint-icon_256x256.png",
    markdown: {
        format: "md"
    },
    customFields: {
        users: [
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
        ],
        repoUrl: "https://github.com/textlint/textlint"
    },
    onBrokenLinks: "log",
    onBrokenMarkdownLinks: "log",
    presets: [
        [
            "@docusaurus/preset-classic",
            {
                docs: {
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                    editUrl: "https://github.com/textlint/textlint/edit/master/docs/",
                    path: "../docs",
                    sidebarPath: "../website/sidebars.json"
                },
                blog: {
                    path: "blog",
                    onUntruncatedBlogPosts: "ignore"
                },
                theme: {
                    customCss: "./src/css/customTheme.css"
                }
            }
        ]
    ],
    plugins: [
        [
            "@docusaurus/plugin-client-redirects",
            {
                fromExtensions: ["html"]
            }
        ]
    ],
    themeConfig: {
        footer: {
            style: "light",
            logo: {
                alt: "textlint Logo",
                src: "img/textlint-icon_256x256.png",
                href: "/"
            },
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "User Manual",
                            to: "/docs/configuring"
                        },
                        {
                            label: "Developer Guide",
                            to: "/docs/rule"
                        }
                    ]
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "Discussions",
                            href: "https://github.com/orgs/textlint/discussions"
                        }
                    ]
                },
                {
                    title: "More",
                    items: [
                        {
                            label: "Blog",
                            to: "/blog"
                        },
                        {
                            label: "GitHub",
                            href: "https://github.com/textlint/textlint"
                        }
                    ]
                }
            ],
            copyright: `Copyright © ${new Date().getFullYear()} textlint organization`
        },
        navbar: {
            title: "textlint",
            logo: {
                src: "img/textlint-icon_256x256.png"
            },
            items: [
                {
                    to: "docs/getting-started",
                    label: "Docs",
                    position: "right"
                },

                {
                    href: "/blog",
                    label: "Blog",
                    position: "right"
                },
                {
                    href: "https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule",
                    label: "Rules",
                    position: "right"
                },
                {
                    to: "/help",
                    label: "Help",
                    position: "right"
                },
                {
                    href: "https://github.com/textlint/textlint",
                    label: "GitHub",
                    position: "right"
                }
            ]
        },
        image: "img/textlint-icon_256x256.png",
        algolia: {
            appId: "YKHP6FTHHI",
            apiKey: "82014cf9b4a2988df9d5ab7a44d9d3b4",
            indexName: "textlint",
            algoliaOptions: {}
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula
        }
    }
};
