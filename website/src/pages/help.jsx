/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const Card = ({ title, children }) => (
    <div className="col col--4 margin-vert--md">
        <div className="text--center padding-horiz--md">
            <h3>{title}</h3>
            {children}
        </div>
    </div>
);

function Help() {
    const { siteConfig } = useDocusaurusContext();

    return (
        <Layout>
            <main className="container margin-vert--lg">
                <div className="text--center margin-bottom--xl">
                    <h2>Need help?</h2>
                    <p>This project is maintained by a dedicated group of people.</p>
                </div>
                <div className="row row--center">
                    <Card title="Browse Docs">
                        <p>
                            Learn more using the <Link to="/docs/getting-started">documentation on this site</Link>.
                        </p>
                    </Card>
                    <Card title="Join the Community">
                        <p>
                            For bugs and feature requests, please{" "}
                            <Link to="https://github.com/textlint/textlint/issues">open an issue</Link>. Be sure to also
                            check out our <Link to="/docs/contributing">Contributing Guideline</Link>.
                        </p>
                    </Card>
                </div>
            </main>
        </Layout>
    );
}

export default Help;
