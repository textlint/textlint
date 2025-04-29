/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const CompLibrary = {
    Container: (props) => <div {...props}></div>,
    GridBlock: (props) => <div {...props}></div>,
    MarkdownBlock: (props) => <div {...props}></div>
};
const Container = CompLibrary.Container;

const siteConfig = require("../../docusaurus.config");

import Layout from "@theme/Layout";

class Users extends React.Component {
    render() {
        const showcase = siteConfig.users.map((user, i) => {
            return (
                <a href={user.infoLink} key={i}>
                    <img src={user.image} title={user.caption} />
                </a>
            );
        });

        return (
            <div className="mainContainer">
                <Container padding={["bottom", "top"]}>
                    <div className="showcaseSection">
                        <div className="prose">
                            <h1>Who's Using This?</h1>
                            <p>This project is used by many folks</p>
                        </div>
                        <div className="logos">{showcase}</div>
                        <p>Are you using this project?</p>
                        <a
                            href="https://github.com/textlint/textlint/edit/master/website/siteConfig.js"
                            className="button"
                        >
                            Add your company or project
                        </a>
                    </div>
                </Container>
            </div>
        );
    }
}

export default (props) => (
    <Layout>
        <Users {...props} />
    </Layout>
);
