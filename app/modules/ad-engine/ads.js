import basicContext from './ad-context';
import PorvataTracker from './tracking/porvata-tracker';
import slots from './slots';
import SlotTracker from './tracking/slot-tracker';
import targeting from './targeting';
import ViewabilityTracker from './tracking/viewability-tracker';

const pageTypes = {
	article: 'a',
	home: 'h'
};

function getPageTypeShortcut() {
	// Global imports:
	const context = window.Wikia.adEngine.context;
	// End of imports

	return pageTypes[context.get('targeting.s2')] || 'x';
}

function setupPageLevelTargeting(mediaWikiAdsContext) {
	// Global imports:
	const context = window.Wikia.adEngine.context;
	// End of imports

	const pageLevelParams = targeting.getPageLevelTargeting(mediaWikiAdsContext);
	Object.keys(pageLevelParams).forEach((key) => {
		context.set(`targeting.${key}`, pageLevelParams[key]);
	});
}

function setupSlotIdentificator() {
	// Global imports:
	const context = window.Wikia.adEngine.context;
	// End of imports

	const pageTypeParam = getPageTypeShortcut();
	const slotsDefinition = context.get('slots');

	// Wikia Page Identificator
	context.set('targeting.wsi', `mx${pageTypeParam}1`);
	Object.keys(slotsDefinition).forEach((key) => {
		const slotParam = slotsDefinition[key].slotShortcut || 'x';
		context.set(`slots.${key}.targeting.wsi`, `m${slotParam}${pageTypeParam}1`)
	});
}

function setupAdContext(adsContext, instantGlobals) {
	// Global imports:
	const adEngine = window.Wikia.adEngine;
	const adProductsGeo = window.Wikia.adProductsGeo;
	const context = adEngine.context;
	const utils = adEngine.utils;
	const isProperGeo = adProductsGeo.isProperGeo;

	function isGeoEnabled(instantGlobalKey) {
		return isProperGeo(instantGlobals[instantGlobalKey]);
	}
	// End of imports

	context.extend(basicContext);

	if (adsContext.opts.isAdTestWiki) {
		context.set('src', 'test');
	}

	if (adsContext.targeting.wikiIsTop1000) {
		context.set('custom.wikiIdentifier', context.get('targeting.s1'));
	}

	const labradorCountriesVariable = 'wgAdDriverLABradorTestCountries';
	isProperGeo(instantGlobals[labradorCountriesVariable], labradorCountriesVariable);

	context.set('slots', slots.getContext());
	context.set('state.deviceType', utils.client.getDeviceType());

	context.set('options.video.moatTracking.enabled', isGeoEnabled('wgAdDriverPorvataMoatTrackingCountries'));
	context.set('options.video.moatTracking.sampling', instantGlobals['wgAdDriverPorvataMoatTrackingSampling']);

	context.set('options.video.playAdsOnNextVideo', isGeoEnabled('wgAdDriverPlayAdsOnNextVideoCountries'));
	context.set('options.video.adsOnNextVideoFrequency', instantGlobals['wgAdDriverPlayAdsOnNextVideoFrequency']);
	context.set('options.video.isMidrollEnabled', isGeoEnabled('wgAdDriverVideoMidrollCountries'));
	context.set('options.video.isPostrollEnabled', isGeoEnabled('wgAdDriverVideoPostrollCountries'));

	// TODO: context.push('delayModules', featuredVideoDelay);
	// context.set('options.maxDelayTimeout', instantGlobals.wgAdDriverF2DelayTimeout || 2000);
	// context.set('options.featuredVideoDelay', isGeoEnabled('wgAdDriverFVDelayCountries'));
	// context.set('options.exposeFeaturedVideoUapKeyValue', isGeoEnabled('wgAdDriverFVAsUapKeyValueCountries'));

	context.set('options.tracking.kikimora.player', isGeoEnabled('wgAdDriverKikimoraPlayerTrackingCountries'));
	context.set('options.tracking.kikimora.slot', isGeoEnabled('wgAdDriverKikimoraTrackingCountries'));
	context.set('options.tracking.kikimora.viewability', isGeoEnabled('wgAdDriverKikimoraViewabilityTrackingCountries'));

	const isMoatTrackingEnabledForVideo = isGeoEnabled('wgAdDriverVideoMoatTrackingCountries') &&
		utils.sampler.sample('moat_video_tracking', instantGlobals.wgAdDriverVideoMoatTrackingSampling);
	context.set('options.video.moatTracking.enabledForArticleVideos', isMoatTrackingEnabledForVideo);

	if (isGeoEnabled('wgAdDriverBottomLeaderBoardMegaCountries')) {
		context.set(`slots.bottom-leaderboard.adUnit`, context.get('megaAdUnitId'));
	}

	setupPageLevelTargeting(adsContext);
	setupSlotIdentificator();
}

function configure(adsContext, instantGlobals) {
	// Global imports:
	const {context} = window.Wikia.adEngine;
	// End of imports

	setupAdContext(adsContext, instantGlobals);

	context.push('listeners.porvata', PorvataTracker);
	context.push('listeners.slot', SlotTracker);
	context.push('listeners.slot', ViewabilityTracker);
}

function init() {
	// Global imports:
	const {AdEngine} = window.Wikia.adEngine;
	// End of imports

	new AdEngine().init();
}

export default {
	configure,
	init,
	setupAdContext
};
