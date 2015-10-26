/// <reference path='../lib/Utils.ts' />
/// <reference path='../lib/Tracking.ts' />
/// <reference path='../lib/OpenGraph.ts' />
/// <reference path="../../typings/hapi/hapi.d.ts" />

import MW = require('../lib/MediaWiki');
import Utils = require('../lib/Utils');
import Tracking = require('../lib/Tracking');
import OpenGraph = require('../lib/OpenGraph');
import Logger = require('../lib/Logger');
import localSettings = require('../../config/localSettings');
import discussionsSplashPageConfig = require('../../config/discussionsSplashPageConfig');

function showApplication (request: Hapi.Request, reply: Hapi.Response): void {
	var wikiDomain = Utils.getCachedWikiDomainName(localSettings, request),
		wikiVariables = new MW.WikiRequest({wikiDomain: wikiDomain}).wikiVariables(),
		context: any = {},
		hostName: string = Utils.getWikiaSubdomain(request.info.host);

	// TODO: These transforms could be better abstracted, as such, this is a lot like prepareArticleData
	context.server = Utils.createServerData(localSettings, wikiDomain);
	context.queryParams = Utils.parseQueryParams(request.query, []);
	context.localSettings = localSettings;
	context.userId = request.auth.isAuthenticated ? request.auth.credentials.userId : 0;
	context.discussionsSplashPageConfig = getDistilledDiscussionsSplashPageConfig(hostName);

	wikiVariables.then((wikiVariables: any): Promise<any> => {
		var contentDir: string;

		Utils.redirectToCanonicalHostIfNeeded(localSettings, request, reply, wikiVariables);

		context.wikiVariables = wikiVariables;
		if (context.wikiVariables.language) {
			contentDir = context.wikiVariables.language.contentDir;
			context.isRtl = (contentDir === 'rtl');
		}

		return OpenGraph.getAttributes(request, context.wikiVariables);
	}).then((openGraphData: any): void => {
		// Add OpenGraph attributes to context
		context.openGraph = openGraphData;

		outputResponse(request, reply, context);
	}).catch(Utils.RedirectedToCanonicalHost, (): void => {
		Logger.info('Redirected to canonical host');
	}).catch((error: any): void => {
		// `error` could be an object or a string here
		Logger.warn({error: error}, 'Failed to get complete app view context');
		// In case of any unforeseeable error, attempt to output with the context we have so far
		outputResponse(request, reply, context);
	});
}

function outputResponse (request: Hapi.Request, reply: Hapi.Response, context: any): void {
	Tracking.handleResponse(context, request);
	reply.view('application', context);
}

/**
 * @param {string} hostName
 * @returns {*}
 */
function getDistilledDiscussionsSplashPageConfig(hostName: string): Object {
	var mainConfig = discussionsSplashPageConfig[hostName];
	if (mainConfig) {
		return {
			androidAppLink: mainConfig.androidAppLink,
			iosAppLink: mainConfig.iosAppLink,
		};
	}
	return {};
}

export = showApplication;
