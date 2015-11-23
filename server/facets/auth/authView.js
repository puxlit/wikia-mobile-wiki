import * as caching from '../../lib/Caching';
import * as url from 'url';
import localSettings from '../../../config/localSettings';

/**
 * @typedef {string[]} PageParams
 */

/**
 * @typedef {Object} AuthViewContext
 * @property {string} title
 * @property {string} canonicalUrl
 * @property {string} language
 * @property {string} exitTo
 * @property {string} mainPage
 * @property {string} optimizelyScript
 * @property {PageParams} pageParams
 * @property {boolean} [hideHeader]
 * @property {boolean} [hideFooter]
 * @property {string} [footerHref]
 * @property {string} [footerCallout]
 * @property {string} [footerCalloutLink]
 * @property {string} [headerText]
 * @property {string} [bodyClasses]
 * @property {string} [pageType]
 * @property {string} [parentOrigin]
 * @property {boolean} [standalone]
 * @property {*} [trackingConfig]
 */

const VIEW_TYPE_MOBILE = 'mobile',
	VIEW_TYPE_DESKTOP = 'desktop';

export {VIEW_TYPE_MOBILE};
export {VIEW_TYPE_DESKTOP};

/**
 * @param {string} template
 * @param {AuthViewContext} context
 * @param {Hapi.Request} request
 * @param {*} reply
 * @returns {Hapi.Response}
 */
export function view(template, context, request, reply) {
	const response = reply.view(
		`auth/${this.getViewType(request)}/${template}`,
		context,
		{
			layout: 'auth'
		}
	);

	caching.disableCache(response);
	return response;
}

/**
 * @param {Hapi.Request} request
 * @returns {string}
 */
export function getRedirectUrl(request) {
	const currentHost = request.headers.host,
		redirectUrl = request.query.redirect || '/',
		redirectUrlHost = url.parse(redirectUrl).host;

	if (!redirectUrlHost ||
		this.checkDomainMatchesCurrentHost(redirectUrlHost, currentHost) ||
		this.isWhiteListedDomain(redirectUrlHost)
	) {
		return redirectUrl;
	}

	// Not valid domain
	return '/';
}

/**
 * @param {Hapi.Request} request
 * @returns {string}
 */
export function getOrigin(request) {
	const currentHost = request.headers.host,
		redirectUrl = request.query.redirect || '/',
		redirectUrlHost = url.parse(redirectUrl).host,
		redirectUrlOrigin = `${url.parse(redirectUrl).protocol}//${redirectUrlHost}`;

	if (redirectUrlHost && (
			this.checkDomainMatchesCurrentHost(redirectUrlHost, currentHost) ||
			this.isWhiteListedDomain(redirectUrlHost)
		)
	) {
		return redirectUrlOrigin;
	}

	return this.getCurrentOrigin(request);
}

/**
 * @param {string} domain
 * @param {string} currentHost
 * @returns {boolean}
 */
export function checkDomainMatchesCurrentHost(domain, currentHost) {
	return currentHost === domain ||
		domain.indexOf(`.${currentHost}`, domain.length - currentHost.length - 1) !== -1;
};

/**
 * @param {string} domain
 * @returns {boolean}
 */
export function isWhiteListedDomain(domain) {
	const whiteListedDomains = ['.wikia.com', '.wikia-dev.com'];

	/**
	 * @param {string} whileListedDomain
	 * @returns {boolean}
	 */
	return whiteListedDomains.some((whiteListedDomain) => {
		return domain.indexOf(whiteListedDomain, domain.length - whiteListedDomain.length) !== -1;
	});
}

/**
 * @param {Hapi.Request} request
 * @returns {string}
 */
export function getCurrentOrigin(request) {
	// for now the assumption is that there will be https
	return `https://${request.headers.host}`;
}

/**
 * @param {Hapi.Request} request
 * @returns {string}
 */
export function getCanonicalUrl(request) {
	return this.getCurrentOrigin(request) + request.path;
}

/**
 * @param {Hapi.Request} request
 * @returns {AuthViewContext}
 */
export function getDefaultContext(request) {
	const viewType = this.getViewType(request),
		isModal = request.query.modal === '1';

	/* eslint no-undefined: 0 */
	return {
		title: null,
		canonicalUrl: this.getCanonicalUrl(request),
		exitTo: this.getRedirectUrl(request),
		mainPage: 'http://www.wikia.com',
		language: request.server.methods.i18n.getInstance().lng(),
		trackingConfig: localSettings.tracking,
		optimizelyScript: `${localSettings.optimizely.scriptPath}${localSettings.optimizely.account}.js`,
		standalonePage: (viewType === this.VIEW_TYPE_DESKTOP && !isModal),
		pageParams: {
			cookieDomain: localSettings.authCookieDomain,
			isModal,
			enableAuthLogger: localSettings.clickstream.auth.enable,
			authLoggerUrl: localSettings.clickstream.auth.url,
			viewType,
			parentOrigin: (isModal ? this.getOrigin(request) : undefined)
		}
	};
}


/**
 * @param {Hapi.Request} request
 * @param {*} reply
 * @returns {*}
 */
export function validateRedirect(request, reply) {
	const queryRedirectUrl = this.getRedirectUrl(request);

	if (request.query.redirect && queryRedirectUrl !== request.query.redirect) {
		request.url.query.redirect = queryRedirectUrl;
		request.url.search = null;
		return reply.redirect(request.url.format()).takeover();
	}

	return reply();
}

/**
 * @param {Hapi.Request} request
 * @returns {string}
 */
export function getViewType(request) {
	const mobilePattern = localSettings.patterns.mobile,
		ipadPattern = localSettings.patterns.iPad;

	if (mobilePattern.test(request.headers['user-agent']) && !ipadPattern.test(request.headers['user-agent'])) {
		return this.VIEW_TYPE_MOBILE;
	}
	return this.VIEW_TYPE_DESKTOP;
}


/**
 * @param {Hapi.Request} request
 * @param {*} reply
 * @param {AuthViewContext} context
 * @returns {Hapi.Response}
 */
export function onAuthenticatedRequestReply(request, reply, context) {
	const redirect = this.getRedirectUrl(request);

	if (context.pageParams.isModal) {
		return reply.view(
			'auth/desktop/modal-message',
			context,
			{
				layout: 'auth-modal-empty'
			}
		);
	}

	return reply.redirect(redirect);
}
