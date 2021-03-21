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

import { FunctionComponent } from "react";
import facts, { Fact as FactData } from "./../data/facts";
import H1 from "./H1";

type Props = {
	fact?: FactData;
};

export const Fact: FunctionComponent<Props> = ({
	fact = facts[Math.floor(Math.random() * facts.length)],
}) => {
	return (
		<div style={{ margin: "auto", display: "table" }}>
			<H1>
				{fact.icon && (
					<svg className="nq-icon">
						<use
							xlinkHref={`/nimiq-style.icons.svg#nq-${fact.icon}`}
						/>
					</svg>
				)}
				{!fact.icon && (
					<svg className="nq-icon">
						<use xlinkHref="/nimiq-style.icons.svg#nq-questionmark" />
					</svg>
				)}
				<br />
				{fact.headerText ? fact.headerText : "Did you know?"}
			</H1>
			<p style={{ textAlign: "center" }}>{fact.text}</p>
			<a
				href={fact.url}
				target="_blank"
				rel="noopener"
				className="nq-button-pill light-blue"
				style={{ paddingTop: "4px" }}
			>
				{fact.urlText ? fact.urlText : "Learn more"}{" "}
				<svg className="nq-icon">
					<use xlinkHref="/nimiq-style.icons.svg#nq-arrow-right-small" />
				</svg>
			</a>
		</div>
	);
};

export default Fact;
