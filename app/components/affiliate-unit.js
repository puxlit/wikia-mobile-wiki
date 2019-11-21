import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import InViewportMixin from 'ember-in-viewport';
import { trackAffiliateUnit, trackActions } from '../utils/track';

export default Component.extend(
  InViewportMixin,
  {
    i18n: service(),

    isInContent: false,
    unit: null,

    classNames: ['affiliate-unit'],

    showAffiiateUnitDisclaimer: !document.querySelector('.watch-show__disclaimer'),

    heading: computed('unit', function () {
      if (this.unit && this.unit.tagline) {
        return this.unit.tagline;
      }
      return this.i18n.t('affiliate-unit.big-unit-heading');
    }),

    getUnitLink: computed('link', function () {
      let unitLink = this.unit.link;

      if (this.isInContent && this.unit.links.page) {
        unitLink = this.unit.links.page;
      } else if (this.unit.links.search) {
        unitLink = this.unit.links.search;
      }
      return unitLink;
    }),

    actions: {
      trackAffiliateClick() {
        trackAffiliateUnit(this.unit, {
          action: trackActions.click,
          category: this.isInContent ? 'affiliate_incontent_recommend' : 'affiliate_search_recommend',
          label: 'only-item',
        });
      },
    },

    didEnterViewport() {
      trackAffiliateUnit(this.unit, {
        action: trackActions.impression,
        category: this.isInContent ? 'affiliate_incontent_recommend' : 'affiliate_search_recommend',
        label: 'affiliate_shown',
      });
    },
  },
);
