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

type State = {
	stats: Stats[] | false;
	clicks: number[] | false;
	error: string;
};

class EditLink extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			error: "",
			stats: false,
			clicks: false,
		};
	}

	async componentDidMount() {
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
			const json = await responseStats.json();
			if (json.success) {
				let clicks: number[] = [];
				const stats: Stats[] = json.response;
				await asyncForEach(stats, (stat: Stats) => {
					clicks.push(stat.clicks);
				});
				this.setState({
					stats,
					clicks,
				});
			} else {
				this.setState({
					error: json.error
						? json.error
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
					this.props.is404
						? `${this.props.domain}/${this.props.slug}`
						: "Error 404"
				}
				error={this.state.error}
			>
				<Head>
					<meta name="robots" content="noindex" />
				</Head>
				{this.state.stats !== false &&
					this.state.stats.length === 0 && (
						<h2 style={{ textAlign: "center" }}></h2>
					)}
				{this.state.stats !== false && this.state.stats.length >= 1 && (
					<LineChart data={this.state.clicks} />
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
