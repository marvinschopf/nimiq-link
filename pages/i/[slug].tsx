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
import Layout from "../../components/Layout";
import Head from "next/head";

type Props = {
	appTitle: string;
	appVersion: string;
	slug: string;
};

const EditLink: FunctionComponent<Props> = (props: Props) => {
	return (
		<Layout appTitle={props.appTitle} version={props.appVersion}>
			<Head>
				<meta name="robots" content="noindex" />
			</Head>
			<h1>{props.slug}</h1>
		</Layout>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {
			appTitle: process.env.APP_TITLE,
			appVersion: process.env.GIT_SHA,
			slug: context.params.slug,
		},
	};
};

export default EditLink;
