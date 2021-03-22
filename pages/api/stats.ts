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
		if (req.body) {
			let body;
			try {
				body = JSON.parse(req.body);
			} catch (e) {
				res.status(400).json({
					success: false,
					error: "Missing parameters.",
				});
			}
			if (body.slug) {
				const slug: string = body.slug.toString();
				const results: any = await mysql.query(
					"SELECT clicks.date, clicks.clicks FROM links INNER JOIN clicks ON clicks.link = links.id WHERE links.slug = ? AND links.active = 1 AND clicks.date >= DATE_ADD(CURDATE(),INTERVAL -7 DAY);",
					[slug]
				);
				res.status(200).json({
					success: true,
					response: results,
				});
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
