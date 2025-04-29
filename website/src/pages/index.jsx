"use client";

import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import CodeBlock from "@theme/CodeBlock";
import styles from "./index.module.css";

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={styles.homeContainer}>
            <div className={styles.homeSplashFade}>
                <div className={styles.homeWrapper}>
                    <h2 className={styles.ProjectTitle}>
                        {siteConfig.title}
                        <small className={styles["ProjectTitle-copy"]}>{siteConfig.tagline}</small>
                    </h2>
                    <div>
                        <Link className={styles.GettingStartedButton} to="/docs/getting-started">
                            Getting Started
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

function FeatureCard({ title, image, children }) {
    return (
        <div className="col col--4 margin-vert--md">
            <div className="text--center">
                <img src={image} className="margin-bottom--md" alt={title} style={{ height: "64px" }} />
                <h2>{title}</h2>
                {children}
            </div>
        </div>
    );
}

function FeatureSection() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <section className={styles.TextlintFeature}>
            <div className="container">
                <div className="margin-bottom--lg">
                    <strong>textlint</strong> is an open source text linting utility written in JavaScript. It is hard
                    to lint natural language texts, but we try to resolve this issue by <strong>pluggable</strong>{" "}
                    approach.
                </div>
                <div className="row">
                    <FeatureCard title="Rules" image={`${siteConfig.baseUrl}img/icon-pen.svg`}>
                        <p>
                            To use a rule, simply run npm install textlint-rule-xxx. See the{" "}
                            <Link to="https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule">
                                collection of textlint rules
                            </Link>
                            .
                        </p>
                    </FeatureCard>
                    <FeatureCard title="Markdown & Texts" image={`${siteConfig.baseUrl}img/icon-markdown.svg`}>
                        <p>
                            Markdown and plain text are supported by default. HTML and other formats are offered by
                            custom plugins.
                        </p>
                    </FeatureCard>
                    <FeatureCard title="Custom Formatters" image={`${siteConfig.baseUrl}img/icon-formatters.svg`}>
                        <p>Formatter is used both by bundled and custom formatters.</p>
                    </FeatureCard>
                </div>
            </div>
        </section>
    );
}

function GetStartedSection() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <section className="container">
            <h2 id="getting-started" className={`text--center ${styles.sectionTitle}`}>
                Getting Started
            </h2>
            <p className="text--center">
                Follow these steps to get started with textlint:
                <br />
                Check out our <Link to="/docs/getting-started">documentation</Link> for more details.
            </p>
            <div className={styles.getStartedFlexContainer}>
                <div className={styles["GettingStarted-steps"]}>
                    <ol>
                        <li>
                            Create your project:
                            <div className={styles.getStartedStep}>
                                <CodeBlock language="bash">npm init --yes</CodeBlock>
                            </div>
                        </li>
                        <li>
                            Install textlint into your project:
                            <div className={styles.getStartedStep}>
                                <CodeBlock language="bash">npm install --save-dev textlint</CodeBlock>
                            </div>
                        </li>
                        <li>
                            Install textlint rule:
                            <div className={styles.getStartedStep}>
                                <CodeBlock language="bash">npm install --save-dev textlint-rule-no-todo</CodeBlock>
                            </div>
                        </li>
                        <li>
                            Create .textlintrc file:
                            <div className={styles.getStartedStep}>
                                <CodeBlock language="bash">npx textlint --init</CodeBlock>
                            </div>
                        </li>
                        <li>
                            Run textlint:
                            <div className={styles.getStartedStep}>
                                <CodeBlock language="bash">npx textlint README.md</CodeBlock>
                            </div>
                        </li>
                    </ol>
                </div>
                <div className={styles["GettingStarted-images"]}>
                    <ol>
                        <li>
                            <img
                                src={`${siteConfig.baseUrl}img/get-started-steps/1.png`}
                                alt="Initialize project with npm init"
                            />
                        </li>
                        <li>
                            <img
                                src={`${siteConfig.baseUrl}img/get-started-steps/2.png`}
                                alt="Install textlint package"
                            />
                        </li>
                        <li>
                            <img src={`${siteConfig.baseUrl}img/get-started-steps/3.png`} alt="Install textlint rule" />
                        </li>
                        <li>
                            <img
                                src={`${siteConfig.baseUrl}img/get-started-steps/4.png`}
                                alt="Initialize textlint configuration"
                            />
                        </li>
                        <li>
                            <img src={`${siteConfig.baseUrl}img/get-started-steps/5.png`} alt="Run textlint command" />
                        </li>
                    </ol>
                </div>
            </div>
        </section>
    );
}

function Playground() {
    return (
        <div className="container margin-vert--xl">
            <div className="text--center">
                <h2 id="try">Playground</h2>
                <p>
                    Take textlint for a spin, start typing below.
                    <br />
                    Want to try more? Go to <Link to="https://textlint.org/playground">playground</Link>.
                </p>
            </div>
            <iframe
                className={styles["Playground-frame"]}
                sandbox="allow-scripts"
                src="https://textlint.org/playground?embed"
                title="online demo"
                width="100%"
                height="500"
            >
                <p>
                    Your browser does not support iframes. Please visit{" "}
                    <Link to="https://textlint.org/playground">online demo</Link>.
                </p>
            </iframe>
        </div>
    );
}

function Showcase() {
    const { siteConfig } = useDocusaurusContext();
    if ((siteConfig.customFields?.users || []).length === 0) {
        return null;
    }

    const showcase = siteConfig.customFields.users
        .filter((user) => user.pinned)
        .map((user, i) => (
            <a href={user.infoLink} key={i}>
                <img src={user.image} title={user.caption} alt={user.caption} width={128} height={128} />
            </a>
        ));

    return (
        <div className="margin-vert--xl">
            <div className="text--center">
                <h2>Who's Using This?</h2>
                <p>
                    This project is used by all these people. <Link to="/users">More {siteConfig.title} users</Link>.
                </p>
            </div>
            <div className="container">
                <div className="row">{showcase}</div>
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <Layout
            title="textlint - pluggable linting tool for text and markdown"
            description="textlint is an open source text linting utility written in JavaScript."
        >
            <HomepageHeader />
            <main>
                <FeatureSection />
                <GetStartedSection />
                <Playground />
                <Showcase />
            </main>
        </Layout>
    );
}
