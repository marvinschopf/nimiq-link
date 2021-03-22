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

import { GetStaticPropsContext, GetStaticPropsResult } from "next";
import serverlessMysql from "serverless-mysql";
import Layout from "../../components/Layout";
import Head from "next/head";
import { Component } from "react";
import { getVersion, getAppTitle } from "./../../util/meta";

type Props = {
	appTitle: string;
	appVersion: string;
	slug: string;
};

type State = {};

class EditLink extends Component<Props> {
	render() {
		return (
			<Layout
				appTitle={this.props.appTitle}
				version={this.props.appVersion}
				cardTitle={this.props.slug}
			>
				<Head>
					<meta name="robots" content="noindex" />
				</Head>
			</Layout>
		);
	}
}

export async function getStaticProps(
	context: GetStaticPropsContext
): Promise<GetStaticPropsResult<Props>> {
	return {
		props: {
			slug: context.params.slug.toString(),
			appVersion: getVersion(),
			appTitle: getAppTitle(),
		},
	};
}

export default EditLink;
