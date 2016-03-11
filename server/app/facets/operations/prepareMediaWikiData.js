import * as Utils from '../../lib/Utils';
import {gaUserIdHash} from '../../lib/Hashing';
import localSettings from '../../../config/localSettings';
// eslint-disable-next-line max-len
import {isRtl, getUserId, getQualarooScriptUrl, getOptimizelyScriptUrl, getOpenGraphData, getLocalSettings} from './preparePageData';

/**
 * Prepares article data to be rendered
 *
 * @param {Hapi.Request} request
 * @param {MediaWikiPageData} data
 * @returns {object}
 */
export default function prepareMediaWikiData(request, data) {
	const allowedQueryParams = ['_escaped_fragment_', 'noexternals', 'buckysampling'],
		wikiVariables = data.wikiVariables,
		pageData = data.page.data,
		result = {
			server: data.server,
			wikiVariables: data.wikiVariables,
			canonicalUrl: '',
			displayTitle: request.params.title.replace(/_/g, ' '),
		};

	if (wikiVariables) {
		result.canonicalUrl = wikiVariables.basePath;
	}

	if (pageData && pageData.details) {
		result.canonicalUrl += pageData.details.url;
	}

	if (pageData) {
		result.htmlTitle = pageData.htmlTitle;
	} else {
		result.htmlTitle = result.displayTitle;
	}

	result.isRtl = isRtl(wikiVariables);

	result.themeColor = Utils.getVerticalColor(localSettings, wikiVariables.vertical);
	// the second argument is a whitelist of acceptable parameter names
	result.queryParams = Utils.parseQueryParams(request.query, allowedQueryParams);
	result.openGraph = getOpenGraphData('wiki-page', result.htmlTitle, result.canonicalUrl);
	// clone object to avoid overriding real localSettings for futurue requests
	result.localSettings = getLocalSettings();

	result.qualarooScript = getQualarooScriptUrl(request);
	result.optimizelyScript = getOptimizelyScriptUrl(request);
	result.userId = getUserId(request);
	result.gaUserIdHash = gaUserIdHash(result.userId);

	if (typeof request.query.buckySampling !== 'undefined') {
		result.localSettings.weppy.samplingRate = parseInt(request.query.buckySampling, 10) / 100;
	}

	if (data.page.exception) {
		result.exception = data.page.exception;
	}

	result.asyncArticle = false;
	result.prerenderEnabled = false;

	return result;
}
