import Component from '@ember/component';
import { equal, readOnly } from '@ember/object/computed';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import HeadroomMixin from '../mixins/headroom';
import { standalone } from '../utils/browser';
import { track, trackActions } from '../utils/track';

export default Component.extend(
  HeadroomMixin,
  {
    ads: service(),
    smartBanner: service(),
    router: service(),

    classNames: ['site-head-container'],
    classNameBindings: ['themeBar', 'partnerSlot:has-partner-slot'],
    tagName: 'div',
    themeBar: false,
    offset: 0,

    partnerSlot: readOnly('globalNavigation.partner-slot'),
    smartBannerVisible: readOnly('smartBanner.smartBannerVisible'),
    shouldShowFandomAppSmartBanner: readOnly('smartBanner.shouldShowFandomAppSmartBanner'),
    isFandomAppSmartBannerVisible: readOnly('smartBanner.isFandomAppSmartBannerVisible'),
    isCustomSmartBannerVisible: readOnly('smartBanner.isCustomSmartBannerVisible'),
    canShowContentRecommendations: equal('contentLanguage', 'en'),

    init() {
      this._super(...arguments);
      this.headroomOptions = {
        classes: {
          initial: 'site-head-headroom',
          pinned: 'site-head-headroom-pinned',
          unpinned: 'site-head-headroom-un-pinned',
          top: 'site-head-headroom-top',
          notTop: 'site-head-headroom-not-top',
        },
      };
    },

    /**
   * @returns {void}
   */
    willInsertElement() {
      if (this.shouldShowFandomAppSmartBanner) {
        // this HAS TO be run while rendering, but it cannot be run on didInsert/willInsert
        // running this just after render is working too
        run.scheduleOnce('afterRender', this, this.checkForHiding);
      }
    },

    /**
   * @returns {void}
   */
    checkForHiding() {
      const smartBannerService = this.smartBanner;

      if (!standalone && !smartBannerService.isCookieSet()) {
        smartBannerService.setVisibility(true);
        smartBannerService.track(trackActions.impression);
      }
    },

    track(data) {
      track(data);
    },

    onSearchSuggestionChosen({ uri }) {
      this.router.transitionTo('wiki-page', uri);
    },

    goToSearchResults(value) {
      this.router.transitionTo('search', {
        queryParams: { query: value },
      });
    },

    onLinkClicked(href, event) {
      event.preventDefault();

      if (href.substr(0, 6) === '/wiki/') {
        this.router.transitionTo('wiki-page', href.substr(6));
      } else {
        window.location = href;
      }
    },
  },
);
