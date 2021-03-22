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
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	GetServerSideProps,
} from "next";
import Layout from "../../components/Layout";
import Head from "next/head";
import { Component } from "react";
import { getVersion, getAppTitle, isValidDomain } from "../../helpers/meta";

import { Line as LineChart } from "react-chartjs-2";
import Card from "./../../components/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { asyncForEach } from "foreach-await";

type Props = {
	appTitle: string;
	appVersion: string;
	slug: string;
	is404: boolean;
	domain: string;
};

type Stats = {
	date: string;
	clicks: number;
};

type Info = {
	destination: string;
	locked: boolean;
	lockReason?: string;
	created: Date;
	id: string;
};

type ChartData = {
	labels: string[];
	datasets: {
		data: number[];
		label: string;
		fill: boolean;
		borderColor: string;
		backgroundColor: string;
	}[];
};

type State = {
	stats: Stats[] | false;
	clicks: number[] | false;
	error: string;
	chartData: ChartData | false;
	info: Info | false;
	deleteError: string;
	deletePassword: string;
	isDeleting: boolean;
};

class EditLink extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			error: "",
			stats: false,
			clicks: false,
			chartData: false,
			info: false,
			deleteError: "",
			deletePassword: "",
			isDeleting: false,
		};
	}

	async componentDidMount() {
		const responseInfo = await fetch("/api/info", {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				slug: this.props.slug,
				domain: this.props.domain,
			}),
		});
		if (responseInfo.status !== 200) {
			let json;
			try {
				json = await responseInfo.json();
			} catch (e) {
				this.setState({
					error: "An unexpected error has occurred.",
				});
				return;
			}
			this.setState({
				error: json.error
					? json.error
					: "An unexpected error has occurred.",
			});
			return;
		}
		const jsonInfo = await responseInfo.json();
		if (jsonInfo.success) {
			this.setState({
				info: jsonInfo.response,
			});
		} else {
			this.setState({
				error: jsonInfo.error
					? jsonInfo.error
					: "An unexpected error has occurred.",
			});
			return;
		}
		const responseStats = await fetch("/api/stats", {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				slug: this.props.slug,
				domain: this.props.domain,
			}),
		});
		if (responseStats.status === 200) {
			const jsonStats = await responseStats.json();
			if (jsonStats.success) {
				let chartData: ChartData = {
					labels: [],
					datasets: [
						{
							data: [],
							label: "Clicks",
							backgroundColor: "hotpink",
							borderColor: "hotpink",
							fill: false,
						},
					],
				};
				const stats: Stats[] = jsonStats.response;
				await asyncForEach(stats, (stat: Stats) => {
					chartData.labels.push(
						new Intl.DateTimeFormat(
							navigator.language || undefined
						).format(new Date(stat.date))
					);
					chartData.datasets[0].data.push(stat.clicks);
				});
				console.log(stats);
				this.setState({
					stats,
					chartData,
				});
			} else {
				this.setState({
					error: jsonStats.error
						? jsonStats.error
						: "An unexpected error has occurred.",
				});
				return;
			}
		} else {
			let json;
			try {
				json = await responseStats.json();
			} catch (e) {
				this.setState({
					error: "An unexpected error has occurred.",
				});
				return;
			}
			this.setState({
				error: json.error
					? json.error
					: "An unexpected error has occurred.",
			});
			return;
		}
	}

	render() {
		return (
			<Layout
				appTitle={this.props.appTitle}
				version={this.props.appVersion}
				cardTitle={
					!this.props.is404
						? `${this.props.domain}/${this.props.slug}`
						: "Error 404"
				}
				error={
					this.props.is404
						? "The requested short link could not be found."
						: this.state.error
				}
			>
				<Head>
					<meta name="robots" content="noindex" />
				</Head>
				{this.state.info === false &&
					this.state.stats === false &&
					!this.props.is404 &&
					this.state.error.length ===
						0(
							<p
								className="nq-notice info"
								style={{ textAlign: "center" }}
							>
								<svg className="nq-icon">
									<use xlinkHref="/nimiq-style.icons.svg#nq-arrow-right-small" />
								</svg>{" "}
								<b>Loading link data...</b>
							</p>
						)}
				{this.state.info !== false &&
					this.state.stats === false &&
					!this.props.is404 && (
						<p
							className="nq-notice info"
							style={{ textAlign: "center" }}
						>
							<svg className="nq-icon">
								<use xlinkHref="/nimiq-style.icons.svg#nq-arrow-right-small" />
							</svg>{" "}
							<b>Loading statistics...</b>
						</p>
					)}
				{this.state.info && (
					<Row>
						<Col lg={6} md={6} sm={12}>
							<Card.Card isFull={true}>
								<Card.Header>
									<h1 className="nq-h1">
										<svg className="nq-icon">
											<use xlinkHref="/nimiq-style.icons.svg#nq-info-circle" />
										</svg>
									</h1>
								</Card.Header>
								<Card.Body>
									<label>
										<b>Destination:</b>
										<br />
										<input
											className="nq-input"
											style={{ width: "100%" }}
											value={this.state.info.destination}
											disabled
										/>
									</label>
								</Card.Body>
							</Card.Card>
						</Col>
						<Col lg={6} md={6} sm={12}>
							<Card.Card isFull={true}>
								<Card.Header>
									<h1 className="nq-h1">
										<svg className="nq-icon">
											<use xlinkHref="/nimiq-style.icons.svg#nq-lock-locked" />
										</svg>
									</h1>
									{this.state.deleteError.length >= 1 && (
										<p className="nq-notice error">
											<svg className="nq-icon">
												<use xlinkHref="/nimiq-style.icons.svg#nq-face-sad" />
											</svg>{" "}
											{this.state.deleteError}
										</p>
									)}
								</Card.Header>
								<Card.Body>
									<form
										onSubmit={async (event) => {
											event.preventDefault();
											this.setState({
												deleteError: "",
												deletePassword: "",
												isDeleting: true,
											});
											if (this.state.info === false) {
												return;
											}
											if (
												this.state.deletePassword
													.length === 0
											) {
												this.setState({
													deleteError:
														"Please enter your password.",
													isDeleting: false,
												});
												return;
											}
											if (
												confirm(
													"Are you sure you want to delete this link permanently? This cannot be undone and is forever."
												)
											) {
												const responseDelete = await fetch(
													"/api/delete",
													{
														method: "POST",
														headers: {
															"Content-type":
																"application/json",
														},
														body: JSON.stringify({
															id: this.state.info
																.id,
															password: this.state
																.deletePassword,
														}),
													}
												);
												if (
													responseDelete.status ===
													200
												) {
													const jsonDelete = await responseDelete.json();
													if (jsonDelete.success) {
														location.reload();
													} else {
														this.setState({
															isDeleting: false,
															deleteError: jsonDelete.error
																? jsonDelete.error
																: "An unexpected error has occurred.",
														});
														return;
													}
												} else {
													let jsonDelete;
													try {
														jsonDelete = await responseDelete.json();
													} catch (e) {
														this.setState({
															isDeleting: false,
															deleteError:
																"An unexpected error has occurred.",
														});
														return;
													}
													this.setState({
														isDeleting: false,
														deleteError: jsonDelete.error
															? jsonDelete.error
															: "An unexpected error has occurred.",
													});
													return;
												}
											} else {
												this.setState({
													isDeleting: false,
													deleteError: "Aborted.",
												});
												return;
											}
										}}
									>
										<label>
											<b>Password:</b>
											<br />
											<input
												className="nq-input"
												type="password"
												style={{ width: "100%" }}
												required
												placeholder="Password"
												onChange={(event) => {
													this.setState({
														deletePassword:
															event.target.value,
													});
												}}
												value={
													this.state.deletePassword
												}
												disabled={this.state.isDeleting}
											/>
										</label>
										<br />
										<button
											type="submit"
											className="nq-button red"
											style={{ width: "100%" }}
											disabled={this.state.isDeleting}
										>
											Delete link permanently
										</button>
									</form>
								</Card.Body>
							</Card.Card>
						</Col>
						<br />
					</Row>
				)}
				{this.state.stats !== false &&
					this.state.stats.length === 0 && (
						<h2 style={{ textAlign: "center" }}></h2>
					)}
				{this.state.stats !== false && this.state.stats.length >= 1 && (
					<Row>
						<Col lg={12} md={12} sm={12}>
							<LineChart data={this.state.chartData} />
						</Col>
					</Row>
				)}
			</Layout>
		);
	}
}

export const getServerSideProps: GetServerSideProps = async (
	ctx: GetServerSidePropsContext<{ slug: string }>
): Promise<GetServerSidePropsResult<Props>> => {
	if (!isValidDomain(ctx.req.headers["host"])) {
		return {
			props: {
				appTitle: getAppTitle(),
				appVersion: getVersion(),
				slug: "",
				is404: true,
				domain: "",
			},
		};
	}
	return {
		props: {
			appTitle: getAppTitle(),
			appVersion: getVersion(),
			slug: ctx.params.slug,
			is404: false,
			domain: ctx.req.headers["host"],
		},
	};
};

export default EditLink;
