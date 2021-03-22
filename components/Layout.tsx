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

type Props = {
	title?: string;
	error?: string;
	cardTitle?: string;
	appTitle: string;
	children: ReactNode;
	version?: string;
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
				<h1 className="nq-h1">
					<Link href="/">{props.appTitle}</Link>
				</h1>
			</header>
			<main>
				<Card.Card>
					<Card.Header>
						<h1 className="nq-h1">
							{props.cardTitle
								? props.cardTitle
								: props.title
								? props.title
								: props.appTitle}
						</h1>
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
			<br />
			<footer>
				<div className="float-lg-left float-md-left">
					<a
						href={
							props.version
								? `https://github.com/marvinschopf/nimiq-link/commit/${props.version}`
								: "https://github.com/marvinschopf/nimiq-link"
						}
						target="_blank"
						rel="noopener"
						className="nq-button-s light-blue"
					>
						Version:{" "}
						<code>{props.version ? props.version : "unknown"}</code>
					</a>{" "}
					<a
						className="nq-button-pill green"
						target="_blank"
						rel="noopener"
						href="https://github.com/marvinschopf/nimiq-link"
					>
						GitHub
					</a>
				</div>
				<a
					href="https://wallet.nimiq.com/nimiq:NQ848KE9H2L9QSNRYMSTGQML7V5R92FMJC9N"
					target="_blank"
					rel="noopener"
					className="float-lg-right float-md-right nq-button-pill orange"
				>
					Donate NIM
				</a>
			</footer>
		</div>
	);
};

export default Layout;
