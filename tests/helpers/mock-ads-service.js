import { Promise } from 'rsvp';
import Service from '@ember/service';

export function getAdsModuleMock(adsContext) {
  let context = {
    init() {
    },
    pushSlotToQueue() {
    },
    onReady: cb => cb(),
    onTransition() {
    },
    reload() {
    },
    afterTransition() {
    },
    removeSlot() {
    },
    registerActions() {
    },
    waitForAdEngine() {
    },
    waitForUapResponse() {
    },
    onMenuOpen() {
    },
    getAdSlotComponentAttributes: name => (
      {
        name,
        hiddenClassName: 'hidden',
        disableManualInsert: false,
        isAboveTheFold: false,
      }
    ),
    waitForReady(cb) {
      cb();
    },
  };

  if (adsContext) {
    context = Object.assign({}, context, { adsContext });
  }

  return context;
}

export function mockAdsService(owner) {
  owner.register('service:ads/ads', Service.extend({
    init() {
      this._super(...arguments);

      this.module = getAdsModuleMock();
      this.slotNames = {
        bottomLeaderBoard: 'bottom_leaderboard',
        invisibleHighImpact: 'invisible_high_impact',
        invisibleHighImpact2: 'invisible_high_impact_2',
        mobileInContent: 'mobile_in_content',
        mobilePreFooter: 'mobile_prefooter',
        topLeaderBoard: 'top_leaderboard',
      };
    },
    destroyAdSlotComponents() {
    },
    pushAdSlotComponent() {
    },
    addWaitFor() {
    },
    getWaitsOf() {
      return Promise.resolve();
    },
    clearWaitsOf() {
    },
    setupAdsContext() {
    },
  }));
}

export default mockAdsService;
