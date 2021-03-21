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

import { FunctionComponent, ReactNode } from "react";

type CardProps = {
	children: ReactNode;
	className?: string;
	isUnderform?: boolean;
};

type CardHeaderProps = {
	children: ReactNode;
};

type CardBodyProps = {
	children: ReactNode;
};

export const Card: FunctionComponent<CardProps> = (props: CardProps) => {
	return (
		<div
			className={
				!props.className ? "nq-card" : `nq-card ${props.className}`
			}
			style={props.isUnderform ? { margin: "auto", width: "100%" } : {}}
		>
			{props.children}
		</div>
	);
};

export const Header: FunctionComponent<CardHeaderProps> = (
	props: CardHeaderProps
) => {
	return <div className="nq-card-header">{props.children}</div>;
};

export const Body: FunctionComponent<CardBodyProps> = (
	props: CardBodyProps
) => {
	return <div className="nq-card-body">{props.children}</div>;
};

export default {
	Card,
	Header,
	Body,
};
