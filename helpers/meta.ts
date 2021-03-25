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

export const getGitSha = (): string => {
	return process.env.VERCEL_GIT_COMMIT_SHA
		? process.env.VERCEL_GIT_COMMIT_SHA
		: process.env.GIT_SHA
		? process.env.GIT_SHA
		: "";
};

export const getVersion = getGitSha;

export const getAppTitle = (): string => {
	return process.env.APP_TITLE ? process.env.APP_TITLE : "Nimiq.link";
};

export const getNoNimiq = (): boolean => {
	return process.env.NONIMIQ ? process.env.NONIMIQ == "true" : false;
};

export const getMainDomain = (): string => {
	return process.env.MAIN_DOMAIN ? process.env.MAIN_DOMAIN : "nimiq.link";
};

export const getDomains = (): string[] => {
	return process.env.DOMAINS
		? process.env.DOMAINS.split(",")
		: process.env.MAIN_DOMAIN
		? [process.env.MAIN_DOMAIN]
		: [getMainDomain()];
};

export const isValidDomain = (domain: string): boolean => {
	return getDomains().includes(domain);
};

export const getRedirectDelay = (): number => {
	return process.env.REDIRECT_DELAY
		? parseInt(process.env.REDIRECT_DELAY)
		: 3;
};

export const isSafeBrowsingEnabled = (): boolean => {
	return process.env.GOOGLE_SAFE_BROWSING_KEY ? true : false;
};

export const isNoNimiq = (): boolean => {
	return process.env.NONIMIQ ? process.env.NONIMIQ == "true" : false;
};

export const getGitUrl = (): string => {
	const provider: string = process.env.VERCEL_GIT_PROVIDER
		? process.env.VERCEL_GIT_PROVIDER
		: "github";
	const repoOwner: string = process.env.VERCEL_GIT_REPO_OWNER
		? process.env.VERCEL_GIT_REPO_OWNER
		: "marvinschopf";
	const repoSlug: string = process.env.VERCEL_GIT_REPO_SLUG
		? process.env.VERCEL_GIT_REPO_SLUG
		: "nimiq-link";
	let providerUrl: string = "";
	switch (provider) {
		case "github":
			providerUrl = "github.com";
			break;
		case "gitlab":
			providerUrl = "gitlab.com";
			break;
		default:
			providerUrl = "github.com";
			break;
	}
	return `https://${providerUrl}/${repoOwner}/${repoSlug}`;
};
