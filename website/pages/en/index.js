/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;
const MarkdownBlock = CompLibrary.MarkdownBlock;

const siteConfig = require(process.cwd() + "/siteConfig.js");

function imgUrl(img) {
    return siteConfig.baseUrl + "img/" + img;
}

function pageUrl(page, language) {
    return siteConfig.baseUrl + (language ? language + "/" : "") + page;
}

class Button extends React.Component {
    render() {
        return (
            <div className="pluginWrapper buttonWrapper">
                <a className="button" href={this.props.href} target={this.props.target}>
                    {this.props.children}
                </a>
            </div>
        );
    }
}

Button.defaultProps = {
    target: "_self"
};

const SplashContainer = props => (
    <div className="homeContainer">
        <div className="homeSplashFade">
            <div className="wrapper homeWrapper">{props.children}</div>
        </div>
    </div>
);

const Logo = props => (
    <div className="projectLogo">
        <img src={props.img_src} />
    </div>
);

const ProjectTitle = props => (
    <h2 className="ProjectTitle">
        {siteConfig.title}
        <small className={"ProjectTitle-copy"}>{siteConfig.tagline}</small>
    </h2>
);

const PromoSection = props => (
    <div className="section promoSection">
        <div className="promoRow">
            <div className="pluginRowBlock">{props.children}</div>
        </div>
    </div>
);

class HomeSplash extends React.Component {
    render() {
        let language = this.props.language || "";
        return (
            <SplashContainer>
                <div className="inner">
                    <ProjectTitle />
                    <PromoSection>
                        <a className={"GettingStartedButton"} href={`${language}/docs/getting-started.html`}>
                            Getting Started
                        </a>
                    </PromoSection>
                </div>
            </SplashContainer>
        );
    }
}

const Block = props => (
    <Container padding={["bottom", "top"]} id={props.id} background={props.background}>
        <GridBlock align="center" contents={props.children} layout={props.layout} />
    </Container>
);

const FeatureCallout = props => (
    <Container padding={["bottom", "top"]} id={props.id} background={props.background}>
        <div className="productShowcaseSection paddingBottom TextlintFeature">
            <MarkdownBlock>{`
**textlint** is an open source text linting utility written in JavaScript.
It is hard to lint natural language texts, but we try to resolve this issue by **pluggable** approach.
`}</MarkdownBlock>
        </div>
        <GridBlock
            align="center"
            className={"TextlintFeature-gridBlock"}
            contents={[
                {
                    imageAlign: "top",
                    image: siteConfig.baseUrl + "img/icon-pen.svg",
                    title: "Rules",
                    content: `To use a rule, simply run npm install textlint-rule-xxx.
See the collection of textlint rules.`
                },
                {
                    imageAlign: "top",
                    image: siteConfig.baseUrl + "img/icon-markdown.svg",
                    title: "Markdown & Texts",
                    content: `Markdown and plain text are supported by default.
HTML and other formats are offered by custom plugins`
                },
                {
                    imageAlign: "top",
                    image: siteConfig.baseUrl + "img/icon-formatters.svg",
                    title: "Custom Formatters",
                    content: `Formatter (reporter) is used both by bundled and custom formatters`
                }
            ]}
            layout="threeColumn"
        />
    </Container>
);

const Playground = props => {
    return (
        <Container adding={["bottom", "top"]} background="highlight">
            <div className="productShowcaseSection paddingBottom paddingTop Playground">
                <h2 id="try" className="Playground-title">
                    Playground
                </h2>
                <p className="Playground-copy">
                    Take textlint for a spin, start typing below.
                    <br />
                    Want to use more? Go to GitHub.
                </p>
            </div>
            <iframe src="https://textlint.github.io/playground?embed" title="online demo" width="100%" height="500">
                <p>
                    Your browser does not support iframes. Please visit{" "}
                    <a href="https://textlint.github.io/playground">online demo</a>.
                </p>
            </iframe>
        </Container>
    );
};

const Showcase = props => {
    if ((siteConfig.users || []).length === 0) {
        return null;
    }
    const showcase = siteConfig.users
        .filter(user => {
            return user.pinned;
        })
        .map((user, i) => {
            return (
                <a href={user.infoLink} key={i}>
                    <img src={user.image} title={user.caption} />
                </a>
            );
        });

    return (
        <Container padding="top" id={props.id} background={props.background}>
            <div className="productShowcaseSection paddingBottom paddingTop Showcase">
                <h2 className="Showcase-title">{"Who's Using This?"}</h2>
                <p>
                    This project is used by all these people.{" "}
                    <a href={pageUrl("users.html", props.language)}>More {siteConfig.title} users</a>.
                </p>
            </div>
            <div className="productShowcaseSection paddingBottom">
                <div className="logos">{showcase}</div>
            </div>
        </Container>
    );
};

class Index extends React.Component {
    render() {
        let language = this.props.language || "";

        return (
            <div className={"main"}>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `document.body.classList.add("is-index");`
                    }}
                />
                <script src={siteConfig.baseUrl + "js/transparent-header.js"} />
                <HomeSplash language={language} />
                <div className="mainContainer">
                    <FeatureCallout />
                    <Playground />
                    <Showcase language={language} />
                </div>
            </div>
        );
    }
}

module.exports = Index;
