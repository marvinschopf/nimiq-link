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

import { NextPage } from "next";
import { useState } from "react";
import Layout from "../components/Layout";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

type Props = {
	domains: string[];
	mainDomain: string;
};

const Index: NextPage<Props> = (props: Props) => {
	const [error, setError] = useState("");
	const [destination, setDestination] = useState("");

	return (
		<Layout cardTitle="Create short link" error={error}>
			<form
				onSubmit={(event) => {
					event.preventDefault();
				}}
			>
				<Row>
					<Col lg={6} md={6} sm={12}>
						<label className="nq-label">
							Long URL:
							<br />
							<input
								type="url"
								className="nq-input"
								onChange={(event) => {
									setDestination(event.target.value);
								}}
								required
							/>
						</label>
					</Col>
					<Col lg={6} md={6} sm={12}>
						<label className="nq-label">
							Domain:
							<br />
							<select className="nq-input" required>
								{props.domains.map((domain: string) => {
									return (
										<option
											value={domain}
											selected={
												domain === props.mainDomain
													? true
													: false
											}
										>
											{domain}
										</option>
									);
								})}
							</select>
						</label>
					</Col>
				</Row>
			</form>
		</Layout>
	);
};

export async function getStaticProps(context) {
	let domains: string[] = [];
	let mainDomain: string = "";
	domains = process.env.DOMAINS.split(",");
	mainDomain = process.env.MAIN_DOMAIN;
	return {
		props: {
			domains,
			mainDomain,
		},
	};
}

export default Index;
