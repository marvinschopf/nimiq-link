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

import type { NextApiRequest, NextApiResponse } from "next";

import { randomBytes } from "crypto";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import isURL from "validator/lib/isURL";
import fetch from "node-fetch";
import serverlessMysql from "serverless-mysql";

const mysql: serverlessMysql.ServerlessMysql = serverlessMysql({
	config: {
		host: process.env.MYSQL_HOST,
		database: process.env.MYSQL_DATABASE,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
	},
});

function generateSlug(length = parseInt(process.env.SHORT_LENGTH)): string {
	let result: string = "";
	for (let i: number = 0; i < length; i++) {
		result += process.env.SHORT_CHARACTERS.charAt(
			Math.floor(Math.random() * process.env.SHORT_CHARACTERS.length)
		);
	}
	return result;
}

function generatePassword(): string {
	return randomBytes(16).toString("hex");
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const hcaptchaEnabled: boolean = process.env.ENABLE_CAPTCHA ? true : false;
	const domains: string[] = process.env.DOMAINS.split(",");
	if (req.method === "POST") {
		if (req.body) {
			let body;
			try {
				body = JSON.parse(req.body);
			} catch (e) {
				res.status(400).json({
					success: false,
					error: "Missing parameters;",
				});
				return;
			}
			if (
				body.destination &&
				body.domain &&
				(body.hcaptchaToken || !hcaptchaEnabled)
			) {
				const destination: string = body.destination;
				const domain: string = body.domain;
				const hcaptchaToken: string = hcaptchaEnabled
					? body.hcaptchaToken
					: "";
				if (domains.includes(domain)) {
					if (hcaptchaEnabled) {
						const responseCaptcha = await fetch(
							"https://hcaptcha.com/siteverify",
							{
								method: "POST",
								headers: {
									"Content-type":
										"application/x-www-form-urlencoded",
								},
								body: `response=${hcaptchaToken}&secret=${process.env.HCAPTCHA_SECRET_KEY}`,
							}
						);
						if (responseCaptcha.status === 200) {
							const jsonCaptcha = await responseCaptcha.json();
							if (!jsonCaptcha.success) {
								res.status(400).json({
									success: false,
									error: "Captcha invalid.",
								});
								return;
							}
						} else {
							res.status(500).json({
								success: false,
								error: "Captcha verification failed.",
							});
							return;
						}
					}
					if (!isURL(destination)) {
						res.status(400).json({
							success: false,
							error: "Destination is not a valid URL.",
						});
						return;
					}
					const slug: string = generateSlug();
					const editPassword: string = generatePassword();
					await mysql.query(
						"INSERT INTO links (id, destination, domain, slug, adminpassword) VALUES (?, ?, ?, ?, ?);",
						[
							uuidv4(),
							destination,
							domain,
							slug,
							await argon2.hash(editPassword, {
								type: argon2.argon2id,
							}),
						]
					);
					await mysql.end();
					res.status(200).json({
						success: true,
						shortUrl: `https://${domain}/${slug}`,
						editPassword,
					});
				} else {
					res.status(400).json({
						success: false,
						error: "Unknown domain.",
					});
				}
			} else {
				res.status(400).json({
					success: false,
					error: "Missing parameters.",
				});
			}
		} else {
			res.status(400).json({
				success: false,
				error: "Missing parameters.",
			});
		}
	} else {
		res.status(405).json({
			success: false,
			error: "Method unsupported.",
		});
	}
};
