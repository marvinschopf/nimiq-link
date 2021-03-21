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

import { GetServerSideProps } from "next";
import { FunctionComponent } from "react";
import serverlessMysql from "serverless-mysql";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "../components/Card";
import H1 from "../components/H1";
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
};

const Redirect: FunctionComponent<Props> = (props: Props) => {
	if (props.is404) {
		return (
			<Layout
				appTitle={props.appTitle}
				title="Error 404"
				error="Unfortunately, the requested short link could not be found."
			>
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
			>
				<p className="nq-notice error">
					<b>This short link has been blocked.</b> Reason:{" "}
					{props.lockReason}
				</p>
			</Layout>
		);
	}

	return (
		<Layout appTitle={props.appTitle}>
			<Row>
				<Col lg={6} md={12} sm={12}>
					<Card.Card>
						<Card.Header>
							<H1>Short link</H1>
						</Card.Header>
						<Card.Body>
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
											<div className="text">seconds</div>
										</div>
									);
								}}
							</CountdownCircleTimer>
						</Card.Body>
					</Card.Card>
				</Col>
				<Col lg={6} md={12} sm={12}>
					<Card.Card className="card-full">
						<Card.Body>
							<Fact />
						</Card.Body>
					</Card.Card>
				</Col>
			</Row>
		</Layout>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	let nonimiq: boolean = false;
	if (process.env.NONIMIQ && process.env.NONIMIQ == "true") nonimiq = true;
	const mysql: serverlessMysql.ServerlessMysql = serverlessMysql({
		config: {
			host: process.env.MYSQL_HOST,
			database: process.env.MYSQL_DATABASE,
			user: process.env.MYSQL_USER,
			password: process.env.MYSQL_PASSWORD,
		},
	});
	const results: any = await mysql.query(
		"SELECT destination, locked, lockReason FROM links WHERE active = 1 AND domain = ? AND slug = ? LIMIT 1;",
		[context.req.headers.host, context.params.slug]
	);
	await mysql.end();
	if (results.length !== 1) {
		return {
			props: {
				appTitle: process.env.APP_TITLE,
				redirectDelay: process.env.REDIRECT_DELAY
					? parseInt(process.env.REDIRECT_DELAY)
					: 3,
				is404: true,
			},
		};
	}
	const result = results[0];
	if (result.locked === 1) {
		return {
			props: {
				appTitle: process.env.APP_TITLE,
				redirectDelay: process.env.REDIRECT_DELAY
					? parseInt(process.env.REDIRECT_DELAY)
					: 3,
				isLocked: true,
				lockReason: result.lockReason ? result.lockReason : "Unknown",
			},
		};
	}
	if (!nonimiq) {
		return {
			props: {
				appTitle: process.env.APP_TITLE,
				redirectDelay: process.env.REDIRECT_DELAY
					? parseInt(process.env.REDIRECT_DELAY)
					: 3,
				destination: result.destination,
			},
		};
	} else {
		context.res.statusCode = 302;
		context.res.setHeader("Location", result.destination);
		return { props: {} };
	}
};

export default Redirect;
