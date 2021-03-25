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

import {
	GetServerSideProps,
	GetServerSidePropsContext,
	GetServerSidePropsResult,
} from "next";
import { FunctionComponent } from "react";
import serverlessMysql from "serverless-mysql";
import detectBot from "isbot";
import Head from "next/head";

import {
	getVersion,
	getAppTitle,
	getRedirectDelay,
	getMainDomain,
	isNoNimiq,
} from "../helpers/meta";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "../components/Card";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Fact from "../components/Fact";
import Layout from "../components/Layout";

type Props = {
	appTitle: string;
	isLocked: boolean;
	lockReason: string;
	is404: boolean;
	redirectDelay: number;
	destination: string;
	appVersion: string;
	isNoNimiq: boolean;
};

const Redirect: FunctionComponent<Props> = (props: Props) => {
	if (props.is404) {
		return (
			<Layout
				appTitle={props.appTitle}
				title="Error 404"
				error="Unfortunately, the requested short link could not be found."
				version={props.appVersion}
				isNoNimiq={props.isNoNimiq}
			>
				<Head>
					<meta name="robots" content="noindex" />
				</Head>
				<p className="nq-notice error">
					<b>
						Unfortunately, the requested short link could not be
						found.
					</b>
				</p>
			</Layout>
		);
	}

	if (props.isLocked) {
		return (
			<Layout
				appTitle={props.appTitle}
				title="Short link disabled"
				error={`This short link has been blocked. Reason: ${props.lockReason}`}
				version={props.appVersion}
				isNoNimiq={props.isNoNimiq}
			>
				<Head>
					<meta name="robots" content="noindex" />
				</Head>
				<p className="nq-notice error">
					<b>This short link has been blocked.</b> Reason:{" "}
					{props.lockReason}
				</p>
			</Layout>
		);
	}

	return (
		<Layout
			appTitle={props.appTitle}
			cardTitle={`Redirecting to ${
				new URL(
					props.destination.startsWith("https://")
						? props.destination
						: props.destination.startsWith("http://")
						? props.destination
						: `https://${props.destination}`
				).hostname
			}...`}
			version={props.appVersion}
			isNoNimiq={props.isNoNimiq}
		>
			<Head>
				<meta
					http-equiv="refresh"
					content={`${props.redirectDelay + 2}; URL=${
						props.destination
					}`}
				/>
				<meta name="robots" content="noindex" />
			</Head>
			<Row>
				<Col lg={6} md={12} sm={12}>
					<Card.Card className="card-full">
						<Card.Body>
							<div className="center-children">
								<Fact />
							</div>
						</Card.Body>
					</Card.Card>
				</Col>
				<Col lg={6} md={12} sm={12}>
					<Card.Card>
						<Card.Body>
							<div className="center-children">
								<CountdownCircleTimer
									isPlaying
									duration={props.redirectDelay}
									colors={[
										["#004777", 0.33],
										["#F7B801", 0.33],
										["#A30000", 0.33],
									]}
									onComplete={() => {
										if (typeof window !== "undefined") {
											window.location.replace(
												props.destination
											);
										}
									}}
								>
									{({ remainingTime }) => {
										return (
											<div className="timer">
												<div className="text">
													Redirecting in
												</div>
												<div className="value">
													{remainingTime}
												</div>
												<div className="text">
													seconds
												</div>
											</div>
										);
									}}
								</CountdownCircleTimer>
							</div>
						</Card.Body>
					</Card.Card>
				</Col>
			</Row>
		</Layout>
	);
};

export const getServerSideProps: GetServerSideProps = async (
	context: GetServerSidePropsContext<{ slug: string }>
): Promise<GetServerSidePropsResult<Props>> => {
	if (
		context.params.slug.toString().endsWith("+") ||
		context.req.url.endsWith("+")
	) {
		context.res.statusCode = 302;
		context.res.setHeader(
			"Location",
			`https://${getMainDomain()}/i/${context.params.slug
				.toString()
				.slice(0, -1)}`
		);
		context.res.end();
		return {
			props: {
				appTitle: getAppTitle(),
				appVersion: getVersion(),
				isLocked: false,
				lockReason: "",
				is404: false,
				redirectDelay: getRedirectDelay(),
				destination: "",
				isNoNimiq: isNoNimiq(),
			},
		};
	}
	const isBot: boolean = context.req.headers["user-agent"]
		? detectBot(context.req.headers["user-agent"].toString())
		: false;
	const mysql: serverlessMysql.ServerlessMysql = serverlessMysql({
		config: {
			host: process.env.MYSQL_HOST,
			database: process.env.MYSQL_DATABASE,
			user: process.env.MYSQL_USER,
			password: process.env.MYSQL_PASSWORD,
		},
	});
	const results: any = await mysql.query(
		"SELECT id, destination, locked, lockReason FROM links WHERE active = 1 AND domain = ? AND slug = ? LIMIT 1;",
		[context.req.headers.host, context.params.slug]
	);
	if (results.length !== 1) {
		return {
			props: {
				appTitle: getAppTitle(),
				redirectDelay: getRedirectDelay(),
				is404: true,
				appVersion: getVersion(),
				isLocked: false,
				lockReason: "",
				destination: "",
				isNoNimiq: isNoNimiq(),
			},
		};
	}
	const result = results[0];
	if (!isBot)
		await mysql.query(
			"INSERT INTO clicks (link, date, clicks) VALUES (?, CURRENT_DATE(), 1) ON DUPLICATE KEY UPDATE clicks = clicks + 1;",
			[result.id]
		);
	await mysql.end();
	if (result.locked === 1) {
		return {
			props: {
				appTitle: getAppTitle(),
				redirectDelay: getRedirectDelay(),
				isLocked: true,
				lockReason: result.lockReason ? result.lockReason : "Unknown",
				appVersion: getVersion(),
				is404: false,
				destination: "",
				isNoNimiq: isNoNimiq(),
			},
		};
	}
	if (isNoNimiq() || isBot) {
		context.res.statusCode = 302;
		context.res.setHeader("Location", result.destination);
		context.res.end();
	}
	return {
		props: {
			appTitle: getAppTitle(),
			redirectDelay: getRedirectDelay(),
			destination: result.destination,
			appVersion: getVersion(),
			isLocked: false,
			lockReason: "",
			is404: false,
			isNoNimiq: isNoNimiq(),
		},
	};
};

export default Redirect;
