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
import serverlessMysql from "serverless-mysql";
import argon2 from "argon2";

const mysql: serverlessMysql.ServerlessMysql = serverlessMysql({
	config: {
		host: process.env.MYSQL_HOST,
		database: process.env.MYSQL_DATABASE,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
	},
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === "POST") {
		if (req.body && req.body.id && req.body.password) {
			const results: any = await mysql.query(
				"SELECT id, adminpassword FROM links WHERE id = ? AND active = 1;",
				[req.body.id.toString()]
			);
			if (results.length === 1) {
				const result = results[0];
				if (
					await argon2.verify(
						result.adminpassword,
						req.body.password.toString()
					)
				) {
					await mysql.query(
						"DELETE FROM links WHERE id = ? AND adminpassword = ? AND active = 1;",
						[req.body.id.toString(), result.adminpassword]
					);
					await mysql.end();
					res.status(200).json({
						success: true,
					});
				} else {
					await mysql.end();
					res.status(403).json({
						success: false,
						error: "Wrong password.",
					});
				}
			} else {
				res.status(404).json({
					success: false,
					error: "Not found.",
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
