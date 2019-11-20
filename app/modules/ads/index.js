/* eslint-disable class-methods-use-this */
import { Promise } from 'rsvp';
import { v4 as uuid } from 'ember-uuid';
import { adsSetup } from './setup';
import { fanTakeoverResolver } from './fan-takeover-resolver';
import { adblockDetector } from './tracking/adblock-detector';
import { pageTracker } from './tracking/page-tracker';
import { biddersDelayer } from './bidders-delayer';
import { cheshireCat } from './ml/cheshire-cat';
import { appEvents } from './events';
import { logError } from '../event-logger';
import { trackScrollY, trackXClick } from '../../utils/track';
import { slotsLoader } from './slots-loader';

const logGroup = 'mobile-wiki-ads-module';

function isQueryParamActive(paramValue) {
  return ['0', null, '', 'false', undefined].indexOf(paramValue) === -1;
}

class PromiseLock {
  constructor() {
    this.isLoaded = false;
    this.finished = new Promise((resolve, reject) => {
      this.resolve = (x) => {
        this.isLoaded = true;
        resolve(x);
      };
      this.reject = (x) => {
        reject(x);
      };
    });
  }
}

class Ads {
  constructor() {
    this.engine = null;
    this.spaInstanceId = null;

    this.isInitializationStarted = false;
    this.initialization = new PromiseLock();
    /** @private */
    this.afterPageRenderExecuted = false;
  }

  /**
   * Returns ads instance.
   *
   * @returns {Ads}
   * @public
   */
  static getInstance() {
    if (Ads.instance === null) {
      Ads.instance = new Ads();
    }

    return Ads.instance;
  }

  /**
   * Returns loaded ads instance.
   *
   * @returns {Promise|RSVP.Promise|*}
   */
  static getLoadedInstance() {
    return Ads.getInstance().initialization.finished;
  }

  /**
   * @param instantGlobals
   * @param adsContext
   * @param queryParams
   * @public
   */
  init(instantGlobals, adsContext = {}, queryParams = {}) {
    const reasonConditionMap = {
      noexternals_querystring: isQueryParamActive(queryParams.noexternals),
      noads_querystring: isQueryParamActive(queryParams.noads),
      mobileapp_querystring: isQueryParamActive(queryParams['mobile-app']),
      noads_pagetype: adsContext.opts.pageType === 'no_ads',
      ig: !!instantGlobals.wgSitewideDisableAdsOnMercury,
    };
    const disablers = Object.entries(reasonConditionMap)
      .filter(reasonAndCondition => reasonAndCondition[1])
      .map(reasonAndCondition => reasonAndCondition[0]);

    if (disablers.length > 0) {
      const disablersSerialized = disablers.map(disabler => `off_${disabler}`).join(',');

      this.initialization.reject(disablers);
      pageTracker.trackProp('adengine', `${disablersSerialized}`, true);
    } else {
      // 'wgAdDriverDisableAdStackCountries' - how to check this?
      if (!this.isInitializationStarted) {
        this.isInitializationStarted = true;

        this.loadAdEngine().then(() => {
          M.trackingQueue.push(
            isOptedIn => this.setupAdEngine(adsContext, instantGlobals, isOptedIn),
          );
        });
      }

      Ads.getLoadedInstance()
        .then(() => {
          pageTracker.trackProp('adengine', `on_${window.ads.adEngineVersion}`, true);
        })
        .catch(() => {
          pageTracker.trackProp('adengine', 'off_failed_initialization', true);
        });
    }
  }

  /**
   * @private
   */
  loadAdEngine() {
    return import('@wikia/ad-engine').then((module) => {
      window.Wikia = window.Wikia || {};
      window.Wikia.adEngine = module;
      window.Wikia.adProducts = module;
      window.Wikia.adServices = module;
      window.Wikia.adBidders = module;

      return module;
    }).catch((error) => {
      logError('https://services.fandom.com', 'AdEngine.load', {
        message: error.message,
        stack: error.stack,
      });

      throw Error('Failed to load @wikia/ad-engine package.');
    });
  }

  /**
   * @private
   */
  getInstantGlobals() {
    return new Promise(resolve => window.getInstantGlobals(resolve));
  }

  /**
   * @private
   * @param mediaWikiAdsContext
   * @param instantGlobals
   * @param isOptedIn
   */
  setupAdEngine(mediaWikiAdsContext, instantGlobals, isOptedIn) {
    if (this.initialization.isLoaded) {
      return;
    }

    const { ScrollTracker } = window.Wikia.adEngine;

    this.scrollTracker = new ScrollTracker([0, 2000, 4000], 'application-wrapper');

    this.triggerInitialLoadServices(mediaWikiAdsContext, instantGlobals, isOptedIn)
      .then(() => {
        this.triggerAfterPageRenderServices();

        this.initialization.resolve(this);
      });
  }

  /**
   * @private
   */
  loadGoogleTag() {
    window.M.loadScript('//www.googletagservices.com/tag/js/gpt.js', true);
  }

  /**
   * @private
   */
  finishFirstCall() {
    const { btfBlockerService } = window.Wikia.adEngine;

    btfBlockerService.finishFirstCall();
    fanTakeoverResolver.resolve();
  }

  /**
   * @public
   */
  createJWPlayerVideoAds(options) {
    const { jwplayerAdsFactory } = window.Wikia.adProducts;

    return jwplayerAdsFactory.create(options);
  }

  /**
   * @public
   */
  loadJwplayerMoatTracking() {
    const { jwplayerAdsFactory } = window.Wikia.adProducts;

    jwplayerAdsFactory.loadMoatPlugin();
  }

  /**
   * @public
   */
  getAdSlotComponentAttributes(slotName) {
    const { context } = window.Wikia.adEngine;

    const slotDefinition = context.get(`slots.${slotName}`);

    return {
      disableManualInsert: slotDefinition.disableManualInsert,
      insertOnViewportEnter: slotDefinition.insertOnViewportEnter,
      isAboveTheFold: slotDefinition.aboveTheFold,
      name: slotName,
      hiddenClassName: 'hide',
      numberOfViewportsFromTopToPush: slotDefinition.numberOfViewportsFromTopToPush,
    };
  }

  pushSlotToQueue(name) {
    const { context, utils } = window.Wikia.adEngine;

    context.push('state.adStack', {
      id: name,
    });
    utils.logger(logGroup, `Push slot ${name} to adStack.`);
  }

  registerActions({ onHeadOffsetChange, onSmartBannerChange }) {
    const {
      AdSlot, events, eventService, SlotTweaker,
    } = window.Wikia.adEngine;

    eventService.on(appEvents.HEAD_OFFSET_CHANGE, onHeadOffsetChange);
    eventService.on(appEvents.SMART_BANNER_CHANGE, onSmartBannerChange);
    eventService.on(events.SCROLL_TRACKING_TIME_CHANGED, (time, position) => {
      trackScrollY(time / 1000, position);
    });

    eventService.on(AdSlot.CUSTOM_EVENT, (adSlot, { status }) => {
      if (status === SlotTweaker.SLOT_CLOSE_IMMEDIATELY || status === 'force-unstick') {
        trackXClick(adSlot);
      }
    });
  }

  /**
   * @public
   */
  beforeTransition() {
    if (!this.initialization.isLoaded) {
      return;
    }

    const { events, eventService, utils } = window.Wikia.adEngine;

    this.triggerBeforePageChangeServices();

    eventService.emit(events.BEFORE_PAGE_CHANGE_EVENT);
    utils.logger(logGroup, 'before transition');
  }

  /**
   * @public
   */
  onTransition(options) {
    if (!this.initialization.isLoaded) {
      return;
    }

    const {
      context, events, eventService, utils,
    } = window.Wikia.adEngine;

    context.set('state.adStack', []);
    eventService.emit(events.PAGE_CHANGE_EVENT, options);
    utils.logger(logGroup, 'on transition');
  }

  /**
   * @public
   */
  afterTransition(mediaWikiAdsContext) {
    if (!this.initialization.isLoaded) {
      return;
    }

    const { events, eventService, utils } = window.Wikia.adEngine;

    eventService.emit(events.PAGE_RENDER_EVENT, {
      adContext: mediaWikiAdsContext,
    });

    this.triggerAfterPageRenderServices();
    this.triggerPageTracking();

    utils.logger(logGroup, 'after transition');
  }

  /**
   * @private
   * This trigger is executed once, at the very beginning
   */
  triggerInitialLoadServices(mediaWikiAdsContext, instantGlobals, isOptedIn) {
    const { eventService } = window.Wikia.adEngine;
    const { confiant, durationMedia, moatYiEvents } = window.Wikia.adServices;

    return adsSetup.configure(mediaWikiAdsContext, instantGlobals, isOptedIn)
      .then(() => {
        confiant.call();
        durationMedia.call();

        eventService.on(moatYiEvents.MOAT_YI_READY, (data) => {
          pageTracker.trackProp('moat_yi', data);
        });
      });
  }

  /**
   * @private
   * This trigger is executed before ember start the transition
   */
  triggerBeforePageChangeServices() {
    const { SessionCookie, InstantConfigCacheStorage } = window.Wikia.adEngine;
    const { universalAdPackage } = window.Wikia.adProducts;
    const { taxonomyService } = window.Wikia.adServices;
    const cacheStorage = InstantConfigCacheStorage.make();
    const sessionCookie = SessionCookie.make();

    cacheStorage.resetCache();
    sessionCookie.readSessionId();
    universalAdPackage.reset();
    fanTakeoverResolver.reset();
    cheshireCat.reset();
    slotsLoader.reset();
    taxonomyService.reset();
    this.afterPageRenderExecuted = false;
  }

  /**
   * @private
   * This trigger is executed after the new page is rendered
   * Context service is fully configured at this moment
   */
  triggerAfterPageRenderServices() {
    if (this.afterPageRenderExecuted) {
      return;
    }

    const { bidders } = window.Wikia.adBidders;
    const { slotService } = window.Wikia.adEngine;

    biddersDelayer.resetPromise();

    bidders.requestBids({
      responseListener: biddersDelayer.markAsReady,
    });
    this.startAdEngine();

    if (!slotService.getState('top_leaderboard')) {
      this.finishFirstCall();
    }

    this.callExternalTrackingServices();
    adblockDetector.run();

    this.afterPageRenderExecuted = true;
  }

  /**
   * @private
   */
  startAdEngine() {
    const { AdEngine } = window.Wikia.adEngine;

    if (!this.engine) {
      this.engine = new AdEngine();
      this.engine.init();

      this.loadGoogleTag();
    } else {
      this.engine.runAdQueue();
    }
  }

  /**
   * @private
   * Call Krux, Moat and Nielsen services.
   */
  callExternalTrackingServices() {
    const { context } = window.Wikia.adEngine;
    const {
      krux, moatYi, nielsen, taxonomyService,
    } = window.Wikia.adServices;
    const targeting = context.get('targeting');

    krux.call().then(this.trackKruxSegments);
    moatYi.call();
    nielsen.call({
      type: 'static',
      assetid: `fandom.com/${targeting.s0v}/${targeting.s1}/${targeting.artid}`,
      section: `FANDOM ${targeting.s0v.toUpperCase()} NETWORK`,
    });
    taxonomyService.configureComicsTargeting();
  }

  /**
   * @private
   */
  triggerPageTracking() {
    this.trackViewabilityToDW();
    this.initScrollSpeedTracking();
    this.trackLabradorToDW();
    this.trackLikhoToDW();
    this.trackConnectionToDW();
    this.trackSpaInstanceId();
    this.trackTabId();
  }

  /**
   * @private
   */
  trackViewabilityToDW() {
    const { ViewabilityCounter } = window.Wikia.adServices;
    const viewabilityCounter = ViewabilityCounter.make();

    pageTracker.trackProp('session_viewability_all', viewabilityCounter.getViewability());
    pageTracker.trackProp('session_viewability_tb', viewabilityCounter.getViewability('top_boxad'));
    pageTracker.trackProp('session_viewability_icb', viewabilityCounter.getViewability('incontent_boxad'));

    viewabilityCounter.init();
  }

  /**
   * @private
   */
  trackLabradorToDW() {
    const { utils, InstantConfigCacheStorage } = window.Wikia.adEngine;
    const cacheStorage = InstantConfigCacheStorage.make();
    const labradorPropValue = cacheStorage.getSamplingResults().join(';');

    if (labradorPropValue) {
      pageTracker.trackProp('labrador', labradorPropValue);
      utils.logger(logGroup, 'labrador props', labradorPropValue);
    }
  }

  /**
   * @private
   */
  trackKruxSegments() {
    const { context, utils } = window.Wikia.adEngine;
    const kruxUserSegments = context.get('targeting.ksg') || [];
    const kruxTrackedSegments = context.get('services.krux.trackedSegments') || [];

    const kruxPropValue = kruxUserSegments.filter(segment => kruxTrackedSegments.includes(segment));

    if (kruxPropValue.length) {
      pageTracker.trackProp('krux_segments', kruxPropValue.join('|'));
      utils.logger(logGroup, 'krux props', kruxPropValue);
    }
  }

  /**
   * @private
   */
  trackLikhoToDW() {
    const { context, utils } = window.Wikia.adEngine;
    const likhoPropValue = context.get('targeting.likho') || [];

    if (likhoPropValue.length) {
      pageTracker.trackProp('likho', likhoPropValue.join(';'));
      utils.logger(logGroup, 'likho props', likhoPropValue);
    }
  }

  /**
   * @private
   */
  trackSpaInstanceId() {
    const { context } = window.Wikia.adEngine;

    if (!context.get('options.tracking.spaInstanceId')) {
      return;
    }

    if (!this.spaInstanceId) {
      this.spaInstanceId = uuid();
    }

    pageTracker.trackProp('spa_instance_id', this.spaInstanceId);
  }

  /**
   * @private
   */
  trackTabId() {
    const { context } = window.Wikia.adEngine;

    if (!context.get('options.tracking.tabId')) {
      return;
    }

    window.tabId = sessionStorage.tab_id ? sessionStorage.tab_id : sessionStorage.tab_id = uuid();

    pageTracker.trackProp('tab_id', window.tabId);
  }

  /**
   * @private
   */
  trackConnectionToDW() {
    const { utils } = window.Wikia.adEngine;
    const connection = navigator.connection
      || navigator.mozConnection
      || navigator.webkitConnection;

    if (connection) {
      const data = [];
      if (connection.downlink) {
        data.push(`downlink=${connection.downlink.toFixed(1)}`);
      }
      if (connection.effectiveType) {
        data.push(`effectiveType=${connection.effectiveType}`);
      }
      if (connection.rtt) {
        data.push(`rtt=${connection.rtt.toFixed(0)}`);
      }
      if (typeof connection.saveData === 'boolean') {
        data.push(`saveData=${+connection.saveData}`);
      }

      pageTracker.trackProp('connection', data.join(';'));
      utils.logger(logGroup, 'connection', data);
    }
  }

  /**
   * @private
   */
  initScrollSpeedTracking() {
    this.scrollTracker.initScrollSpeedTracking();
    this.trackSessionScrollSpeed();
  }

  /**
   * Tracks average session scroll speed
   */
  trackSessionScrollSpeed() {
    const { ScrollSpeedCalculator } = window.Wikia.adServices;
    const scrollSpeedCalculator = ScrollSpeedCalculator.make();
    const scrollSpeed = scrollSpeedCalculator.getAverageSessionScrollSpeed();

    pageTracker.trackProp('session_scroll_speed', scrollSpeed);
  }

  onMenuOpen() {
    const { eventService } = window.Wikia.adEngine;

    eventService.emit(appEvents.MENU_OPEN_EVENT);
  }

  waitForVideoBidders() {
    const { context, utils } = window.Wikia.adEngine;

    const timeout = new Promise((resolve) => {
      setTimeout(resolve, context.get('options.maxDelayTimeout'));
    });

    return Promise.race([
      biddersDelayer.getPromise(),
      timeout,
    ]).then(() => {
      utils.logger('featured-video', 'resolving featured video delay');
    });
  }

  waitForUapResponse(uapCallback, noUapCallback) {
    return fanTakeoverResolver.getPromise().then((isFanTakeover) => {
      if (isFanTakeover) {
        if (uapCallback && typeof uapCallback === 'function') {
          uapCallback();

          return true;
        }
      } else if (noUapCallback && typeof noUapCallback === 'function') {
        noUapCallback();

        return false;
      }

      return isFanTakeover;
    });
  }
}

Ads.instance = null;

export default Ads;
