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
    <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
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
                <Logo img_src={imgUrl("textlint-icon_256x256.png")} />
                <div className="inner">
                    <ProjectTitle />
                    <PromoSection>
                        <Button href="#try">Try It Out</Button>
                        <Button href="https://github.com/textlint/textlint">GitHub</Button>
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
    <Container padding="top" id={props.id} background={props.background}>
        <h2 className="header-has-icon">What is textlint?</h2>
        <p>
            textlint is an open source text linting utility written in JavaScript. It is hard to lint natural language
            texts, but we try to resolve this issue by <strong>pluggable</strong> approach.
        </p>

        <h3>Everything is pluggable:</h3>
        <ul>
            <li>No bundled rules</li>
            <li>
                To use a rule, simply run <code>npm install textlint-rule-xxx</code>. See the{" "}
                <a
                    href="https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule"
                    title="Collection of textlint rule · textlint/textlint Wiki"
                >
                    collection of textlint rules
                </a>
            </li>
            <li>
                <a href="https://github.com/textlint/textlint-plugin-markdown" title="Markdown support for textlint.">
                    Markdown
                </a>{" "}
                and{" "}
                <a href="https://github.com/textlint/textlint-plugin-text" title="plain txt support for textlint">
                    plain text
                </a>{" "}
                are supported by default. Additionally,{" "}
                <a
                    href="https://github.com/textlint/textlint-plugin-html"
                    title="textlint/textlint-plugin-html: html support for textlint"
                >
                    HTML
                </a>{" "}
                and other formats are supported by custom plugins
            </li>
            <li>Formatter (reporter) is used both by bundled and custom formatters</li>
        </ul>

        <h2 id="try" className="header-has-icon">
            Online Demo
        </h2>
        <p>
            Take textlint for a spin, start typing below. Want to use more? Go to{" "}
            <a href="https://github.com/textlint/textlint">GitHub</a>.
        </p>

        <iframe src="https://textlint.github.io/playground?embed" title="online demo" width="100%" height="500">
            <p>
                Your browser does not support iframes. Please visit{" "}
                <a href="https://textlint.github.io/playground">online demo</a>.
            </p>
        </iframe>

        <h2 className="header-has-icon">Fixable in textlint</h2>
        <p>
            textlint is a <strong>linter</strong> and also is <strong>fixer</strong>. Please see{" "}
            <a href="https://github.com/textlint/textlint#fixable">document about fixer</a> for details.
        </p>
    </Container>
);

const Description = props => (
    <Block background="dark">
        {[
            {
                content: "This is another description of how this project is useful",
                image: imgUrl("docusaurus.svg"),
                imageAlign: "right",
                title: "Description"
            }
        ]}
    </Block>
);

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
            <h2 className="header-has-icon">{"Who's Using This?"}</h2>
            <p>
                This project is used by all these people.{" "}
                <a href={pageUrl("users.html", props.language)}>More {siteConfig.title} users</a>.
            </p>
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
            <div>
                <HomeSplash language={language} />
                <div className="mainContainer">
                    <FeatureCallout />
                    <Showcase language={language} />
                </div>
            </div>
        );
    }
}

module.exports = Index;
