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
import { useState, useRef, useEffect, Ref, MutableRefObject } from "react";
import Layout from "../components/Layout";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {
	getVersion,
	getAppTitle,
	getDomains,
	getMainDomain,
} from "../helpers/meta";

import { usePlausible } from "next-plausible";

import isURL from "validator/lib/isURL";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Card from "../components/Card";
import H1 from "../components/H1";

type Props = {
	domains: string[];
	mainDomain: string;
	hcaptchaSiteKey: string;
	enableHcaptcha: boolean;
	appTitle: string;
	enableFrcCaptcha: boolean;
	friendlyCaptchaKey: string;
	appVersion: string;
};

const Index: NextPage<Props> = (props: Props) => {
	const [error, setError] = useState("");
	const [destination, setDestination] = useState("");
	const [success, setSuccess] = useState(false);
	const [hcaptchaToken, setHcaptchaToken] = useState("");
	const [friendlyCaptchaToken, setFriendlyCaptchaToken] = useState("");
	const [domain, setDomain] = useState(props.mainDomain);
	const [isLoading, setIsLoading] = useState(false);
	const [shortUrl, setShortUrl] = useState("");
	const [editPassword, setEditPassword] = useState("");

	const hcaptchaRef: Ref<HCaptcha> = useRef(null);
	const friendlyCaptchaRef: MutableRefObject<any> = useRef(null);
	const friendlyCaptchaContainerRef: Ref<any> = useRef(null);

	const plausible = usePlausible();

	useEffect(() => {
		if (props.mainDomain !== window.location.hostname) {
			window.location.replace(`https://${props.mainDomain}`);
			return;
		}
		if (props.enableFrcCaptcha && !props.enableHcaptcha) {
			if (
				!friendlyCaptchaRef.current &&
				friendlyCaptchaContainerRef.current
			) {
				import("friendly-challenge").then((fcMod) => {
					friendlyCaptchaRef.current = new fcMod.WidgetInstance(
						friendlyCaptchaContainerRef.current,
						{
							startMode: "none",
							doneCallback: (solution: string) => {
								setFriendlyCaptchaToken(solution);
							},
							errorCallback: (error) => {
								setFriendlyCaptchaToken("");
								setError(error);
							},
						}
					);
				});
			}

			return () => {
				if (friendlyCaptchaRef.current != undefined)
					friendlyCaptchaRef.current.reset();
			};
		}
	}, [friendlyCaptchaContainerRef]);

	return (
		<Layout
			appTitle={props.appTitle}
			cardTitle="Create short link"
			error={error}
			version={props.appVersion}
		>
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					setIsLoading(true);
					setError("");
					if (props.enableHcaptcha && hcaptchaToken.length === 0) {
						setIsLoading(false);
						setError("Please fill in the captcha.");
						return;
					}
					if (
						props.enableFrcCaptcha &&
						!props.enableHcaptcha &&
						friendlyCaptchaToken.length === 0
					) {
						setIsLoading(false);
						setError("Please fill in the captcha.");
						return;
					}
					if (props.enableHcaptcha) {
						setHcaptchaToken("");
						hcaptchaRef.current.resetCaptcha();
					}
					if (props.enableFrcCaptcha && !props.enableHcaptcha) {
						setFriendlyCaptchaToken("");
						friendlyCaptchaRef.current.reset();
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
					let requestParams: { [key: string]: string } = {
						destination: destination,
						domain: domain,
					};
					if (props.enableHcaptcha) {
						requestParams.hcaptchaToken = hcaptchaToken;
					}
					if (props.enableFrcCaptcha && !props.enableHcaptcha) {
						requestParams.friendlyCaptchaToken = friendlyCaptchaToken;
					}
					const response = await fetch("/api/create", {
						method: "POST",
						headers: {
							"Content-type": "application/json",
						},
						body: JSON.stringify(requestParams),
					});
					if (response.status === 200) {
						const json = await response.json();
						if (json.success) {
							plausible("create");
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
						<Card.Card className="card-full" isUnderform={true}>
							<Card.Body>
								{props.enableHcaptcha && (
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
											ref={hcaptchaRef}
										/>
										<br />
									</div>
								)}
								{props.enableFrcCaptcha &&
									!props.enableHcaptcha && (
										<div
											style={{
												margin: "auto",
												textAlign: "center",
												display: "table",
											}}
										>
											<div
												ref={
													friendlyCaptchaContainerRef
												}
												className="frc-captcha"
												data-sitekey={
													props.friendlyCaptchaKey
												}
											/>
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
							<Card.Card className="card-full" isUnderform={true}>
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
													className="nq-input vanishing"
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
													className="nq-input vanishing"
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
									<p>
										<label>
											<b>
												Append a <code>+</code> to see
												statistics of this link:
											</b>
											<br />
											<input
												className="nq-input vanishing"
												disabled
												type="text"
												value={`${shortUrl}+`}
											/>
										</label>
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
	return {
		props: {
			domains: getDomains(),
			mainDomain: getMainDomain(),
			hcaptchaSiteKey: process.env.HCAPTCHA_SITE_KEY
				? process.env.HCAPTCHA_SITE_KEY
				: "",
			enableHcaptcha:
				process.env.ENABLE_HCAPTCHA == "true" ? true : false,
			enableFrcCaptcha:
				process.env.ENABLE_FRIENDLYCAPTCHA == "true" ? true : false,
			friendlyCaptchaKey: process.env.FRIENDLYCAPTCHA_SITE_KEY
				? process.env.FRIENDLYCAPTCHA_SITE_KEY
				: "",
			appTitle: getAppTitle(),
			appVersion: getVersion(),
		},
	};
}

export default Index;
