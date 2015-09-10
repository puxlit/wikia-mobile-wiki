/// <reference path='../../../typings/hapi/hapi.d.ts' />

import caching = require('../../lib/Caching');
import Utils = require('../../lib/Utils');
import localSettings = require('../../../config/localSettings');
import url = require('url');

module authView {
	interface PageParams {
		[key: string]: string;
	}

	export var VIEW_TYPE_MOBILE = 'mobile';
	export var VIEW_TYPE_DESKTOP = 'desktop';

	export interface AuthViewContext {
		title: string;
		canonicalUrl: string;
		language: string;
		exitTo: string;
		mainPage: string;
		optimizelyScript: string;
		pageParams: any;
		hideHeader?: boolean;
		hideFooter?: boolean;
		footerHref?: string;
		footerCallout?: string;
		footerCalloutLink?: string;
		headerText?: string;
		bodyClasses?: string;
		pageType?: string;
		standalone?: boolean;
		trackingConfig?: any;
	}

	export function view (template: string, context: AuthViewContext, request: Hapi.Request, reply: any): Hapi.Response {
		var response: Hapi.Response;

		response = reply.view(
			'auth/' + this.getViewType(request) + '/' + template,
			context,
			{
				layout: 'auth'
			}
		);

		caching.disableCache(response);
		return response;
	}

	export function getRedirectUrl (request: Hapi.Request): string {
		var currentHost: string = request.headers.host,
			redirectUrl: string = request.query.redirect || '/',
			redirectUrlHost: string = url.parse(redirectUrl).host,
			whiteListedDomains: Array<string> = ['.wikia.com'],
			isWhiteListedDomain: boolean;

		if (!redirectUrlHost) {
			return redirectUrl;
		}

		if (
			currentHost === redirectUrlHost ||
			redirectUrlHost.indexOf('.' + currentHost, redirectUrlHost.length - currentHost.length - 1) !== -1
		) {
			return redirectUrl;
		}

		isWhiteListedDomain = whiteListedDomains.some((whiteListedDomain: string): boolean => {
			return redirectUrlHost.indexOf(whiteListedDomain, redirectUrlHost.length - whiteListedDomain.length) !== -1;
		});

		if (isWhiteListedDomain) {
			return redirectUrl;
		}

		// Not valid domain
		return '/';
	}

	export function getCanonicalUrl (request: Hapi.Request): string {
		return 'https://' + request.headers.host + request.path;
	}

	export function getDefaultContext (request: Hapi.Request): AuthViewContext {
		var viewType: string = this.getViewType(request),
			isModal: boolean = request.query.modal === '1';
		return {
			title: null,
			canonicalUrl: this.getCanonicalUrl(request),
			exitTo: this.getRedirectUrl(request),
			mainPage: 'http://www.wikia.com',
			language: request.server.methods.i18n.getInstance().lng(),
			trackingConfig: localSettings.tracking,
			optimizelyScript: localSettings.optimizely.scriptPath +
			localSettings.optimizely.account + '.js',
			standalonePage: (viewType === authView.VIEW_TYPE_DESKTOP && !isModal),
			pageParams: {
				cookieDomain: localSettings.authCookieDomain,
				isModal: isModal,
				viewType: viewType
			}
		};
	}

	export function validateRedirect (request: Hapi.Request, reply: any): any {
		var queryRedirectUrl = authView.getRedirectUrl(request);

		if (request.query.redirect && queryRedirectUrl !== request.query.redirect) {
			request.url.query.redirect = queryRedirectUrl;
			request.url.search = null;
			return reply.redirect(request.url.format()).takeover();
		}

		return reply();
	}

	export function getViewType(request: Hapi.Request): string {
		var mobilePattern = localSettings.patterns.mobile,
			ipadPattern = localSettings.patterns.iPad;
		if (mobilePattern.test(request.headers['user-agent']) && !ipadPattern.test(request.headers['user-agent'])) {
			return this.VIEW_TYPE_MOBILE;
		}
		return this.VIEW_TYPE_DESKTOP;
	}

	export function requestAuthenticated(request: Hapi.Request, reply: any, context: AuthViewContext): Hapi.Response {
		var redirect: string = authView.getRedirectUrl(request),
			response: Hapi.Response;

		if (context.pageParams.isModal) {
			response = reply.view(
				'auth/desktop/modal-message',
				context,
				{
					layout: 'auth-modal-empty'
				}
			);
		} else {
			response = reply.redirect(redirect);
		}

		return response;
	}
}

export = authView;
