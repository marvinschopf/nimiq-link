/**
 * nimiq-link
 * Copyright (C) 2021 Marvin Schopf
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { FunctionComponent, ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";

import Card from "./Card";
import H1 from "./H1";

type Props = {
	title?: string;
	error?: string;
	cardTitle?: string;
	appTitle: string;
	children: ReactNode;
};

const Layout: FunctionComponent<Props> = (props: Props) => {
	return (
		<div style={{ backgroundColor: "var(--nimiq-blue)", color: "#ffffff" }}>
			<Head>
				{props.title && (
					<title>
						{props.title} &middot; {props.appTitle}
					</title>
				)}
				{!props.title && <title>{props.appTitle}</title>}
			</Head>
			<header>
				<Link href="/">
					<H1>{props.appTitle}</H1>
				</Link>
			</header>
			<main>
				<Card.Card>
					<Card.Header>
						<H1>
							{props.cardTitle
								? props.cardTitle
								: props.title
								? props.title
								: props.appTitle}
						</H1>
						{props.error && (
							<p className="nq-notice error">
								<svg className="nq-icon">
									<use xlinkHref="/nimiq-style.icons.svg#nq-face-sad" />
								</svg>{" "}
								{props.error}
							</p>
						)}
					</Card.Header>
					<Card.Body>{props.children}</Card.Body>
				</Card.Card>
			</main>
			<footer>
				<a
					className="nq-button-pill green"
					target="_blank"
					rel="noopener"
					href="https://github.com/marvinschopf/nimiq-link"
				>
					GitHub
				</a>
				<div style={{ float: "right" }}>
					<a
						href="https://wallet.nimiq.com/nimiq:NQ848KE9H2L9QSNRYMSTGQML7V5R92FMJC9N"
						target="_blank"
						rel="noopener"
					>
						<img src="https://www.nimiq.com/accept-donations/img/donationBtnImg/orange-small.svg" />
					</a>
				</div>
			</footer>
		</div>
	);
};

export default Layout;
