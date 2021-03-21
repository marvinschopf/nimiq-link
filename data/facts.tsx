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

import { ReactNode } from "react";

export type Fact = {
	headerText?: string;
	text: string | ReactNode;
	url: string;
	urlText?: string;
	icon?: string;
};

type Facts = Fact[];

export const facts: Facts = [
	{
		text: (
			<span>
				Nimiq is a <b>simple</b>, <b>secure</b> and{" "}
				<b>censorship resistant</b> cryptocurrency
			</span>
		),
		url: "https://www.nimiq.com/",
	},
];

export default facts;
