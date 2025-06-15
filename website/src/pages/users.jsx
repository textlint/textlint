/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./users.module.css";

// ユーザーコンポーネント
const Users = () => {
    const { siteConfig } = useDocusaurusContext();
    // ユーザー一覧を生成
    const showcase = siteConfig.customFields.users.map((user, i) => (
        <a href={user.infoLink} key={i}>
            <img src={user.image} title={user.caption} alt={user.caption} width={128} height={128} />
        </a>
    ));

    return (
        <div className={styles.mainContainer}>
            <div className="container">
                <div className={styles.showcaseSection}>
                    <div className={styles.prose}>
                        <h1>Who's Using This?</h1>
                        <p>This project is used by many folks</p>
                    </div>
                    <div className={styles.logos}>{showcase}</div>
                    <p>Are you using this project?</p>
                    <a
                        href="https://github.com/textlint/textlint/edit/master/website-v2/docusaurus.config.js"
                        className={styles.button}
                    >
                        Add your company or project
                    </a>
                </div>
            </div>
        </div>
    );
};

// メインページコンポーネント
export default function UsersPage(props) {
    return (
        <Layout>
            <Users />
        </Layout>
    );
}
