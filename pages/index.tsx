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
import { useState, useRef, Ref } from "react";
import Layout from "../components/Layout";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import isURL from "validator/lib/isURL";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Card from "../components/Card";
import H1 from "../components/H1";

type Props = {
	domains: string[];
	mainDomain: string;
	hcaptchaSiteKey: string;
	enableCaptcha: boolean;
};

const Index: NextPage<Props> = (props: Props) => {
	const [error, setError] = useState("");
	const [destination, setDestination] = useState("");
	const [success, setSuccess] = useState(false);
	const [hcaptchaToken, setHcaptchaToken] = useState("");
	const [domain, setDomain] = useState(props.mainDomain);
	const [isLoading, setIsLoading] = useState(false);
	const [shortUrl, setShortUrl] = useState("");
	const [editPassword, setEditPassword] = useState("");

	const captchaRef: Ref<HCaptcha> = useRef(null);

	return (
		<Layout cardTitle="Create short link" error={error}>
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					setIsLoading(true);
					setError("");
					if (props.enableCaptcha && hcaptchaToken.length === 0) {
						setIsLoading(false);
						setError("Please fill in the captcha.");
						return;
					}
					if (props.enableCaptcha) {
						setHcaptchaToken("");
						captchaRef.current.resetCaptcha();
					}
					if (domain.length === 0 || destination.length === 0) {
						setIsLoading(false);
						setError(
							"Please enter a long URL and select a short domain."
						);
						return;
					}
					if (!isURL(destination)) {
						setIsLoading(false);
						setError("Please enter a valid destination URL.");
						return;
					}
					if (!props.domains.includes(domain)) {
						setIsLoading(false);
						setError("Please select a valid short domain.");
						return;
					}
					const response = await fetch("/api/create", {
						method: "POST",
						body: JSON.stringify({
							destination: destination,
							domain: domain,
							hcaptchaToken: hcaptchaToken,
						}),
					});
					if (response.status === 200) {
						const json = await response.json();
						if (json.success) {
							setShortUrl(json.shortUrl);
							setEditPassword(json.editPassword);
							setSuccess(true);
							setIsLoading(false);
						} else {
							if (json.error) {
								setIsLoading(false), setError(json.error);
							} else {
								setIsLoading(false);
								setError("An unknown error has occurred.");
							}
						}
					} else {
						let json;
						try {
							json = await response.json();
						} catch (e) {
							setIsLoading(false);
							setError("An unknown error has occurred.");
						}
						if (json.error) {
							setIsLoading(false), setError(json.error);
						} else {
							setIsLoading(false);
							setError("An unknown error has occurred.");
						}
					}
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
								disabled={isLoading}
							/>
						</label>
					</Col>
					<Col lg={6} md={6} sm={12}>
						<label className="nq-label">
							Domain:
							<br />
							<select
								className="nq-input"
								onChange={(event) => {
									setDomain(event.target.value);
								}}
								required
								disabled={isLoading}
							>
								{props.domains.map((domain: string) => {
									return (
										<option
											value={domain}
											selected={
												domain === props.mainDomain
													? true
													: false
											}
											onSelect={() => {
												setDomain(domain);
											}}
										>
											{domain}
										</option>
									);
								})}
							</select>
						</label>
					</Col>
				</Row>
				<br />
				<Row>
					<Col lg={success ? 6 : 12} md={12} sm={12}>
						<Card.Card
							className="card-underform"
							isUnderform={true}
						>
							<Card.Body>
								{props.enableCaptcha && (
									<div
										style={{
											margin: "auto",
											textAlign: "center",
											display: "table",
										}}
									>
										<HCaptcha
											sitekey={props.hcaptchaSiteKey}
											onVerify={(token: string) => {
												setHcaptchaToken(token);
											}}
											onExpire={() => {
												setHcaptchaToken("");
											}}
											onError={() => {
												setHcaptchaToken("");
											}}
											ref={captchaRef}
										/>
										<br />
									</div>
								)}
								<button
									type="submit"
									className="nq-button gold"
									style={{ width: "100%" }}
									disabled={isLoading}
								>
									<svg className="nq-icon">
										<use xlinkHref="/nimiq-style.icons.svg#nq-checkmark-small" />
									</svg>{" "}
									Create
								</button>
							</Card.Body>
						</Card.Card>
					</Col>
					{success && (
						<Col lg={6} md={12} sm={12}>
							<Card.Card
								className="card-underform"
								isUnderform={true}
							>
								<Card.Header>
									<H1>
										<svg className="nq-icon">
											<use xlinkHref="/nimiq-style.icons.svg#nq-checkmark" />
										</svg>
									</H1>
									<p className="nq-notice success">
										Your short link was successfully
										created.
									</p>
								</Card.Header>
								<Card.Body>
									<p>
										<b>Your short link:</b>
										<br />
										<Row>
											<Col lg={12} md={12} sm={12}>
												<input
													className="nq-input"
													disabled
													type="url"
													value={shortUrl}
												/>
											</Col>
											<Col lg={12} md={12} sm={12}>
												<CopyToClipboard
													text={shortUrl}
												>
													<button
														className="nq-button green"
														aria-label="Copy to clipboard"
														style={{
															width: "100%",
														}}
														type="button"
													>
														<svg className="nq-icon">
															<use xlinkHref="/nimiq-style.icons.svg#nq-copy" />
														</svg>
													</button>
												</CopyToClipboard>
											</Col>
										</Row>
									</p>
									<p>
										<b>
											Password required to edit the short
											link:
										</b>
										<br />
										<Row>
											<Col lg={12} md={12} sm={12}>
												<input
													className="nq-input"
													disabled
													type="text"
													value={editPassword}
												/>
											</Col>
											<Col lg={12} md={12} sm={12}>
												<CopyToClipboard
													text={editPassword}
												>
													<button
														className="nq-button green"
														aria-label="Copy to clipboard"
														style={{
															width: "100%",
														}}
														type="button"
													>
														<svg className="nq-icon">
															<use xlinkHref="/nimiq-style.icons.svg#nq-copy" />
														</svg>
													</button>
												</CopyToClipboard>
											</Col>
										</Row>
									</p>
								</Card.Body>
							</Card.Card>
						</Col>
					)}
				</Row>
			</form>
		</Layout>
	);
};

export async function getStaticProps(context) {
	let domains: string[] = [];
	domains = process.env.DOMAINS.split(",");
	return {
		props: {
			domains,
			mainDomain: process.env.MAIN_DOMAIN,
			hcaptchaSiteKey: process.env.HCAPTCHA_SITE_KEY,
			enableCaptcha: process.env.ENABLE_CAPTCHA == "true" ? true : false,
		},
	};
}

export default Index;
