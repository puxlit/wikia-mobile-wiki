import {inject as service} from '@ember/service';
import {readOnly} from '@ember/object/computed';
import {dasherize} from '@ember/string';
import Component from '@ember/component';
import {computed, get} from '@ember/object';
import RenderComponentMixin from '../../mixins/render-component';

export default Component.extend(RenderComponentMixin, {
	ads: service(),

	isVisible: false,
	name: 'INVISIBLE_HIGH_IMPACT_2',

	highImpactCountries: get(Wikia, 'InstantGlobals.wgAdDriverHighImpact2SlotCountries'),

	noAds: readOnly('ads.noAds'),
	nameLowerCase: computed('name', function () {
		return dasherize(this.get('name').toLowerCase());
	}),

	didInsertElement() {
		this._super(...arguments);

		this.get('ads.module').onReady(() => {
			if (this.isEnabled()) {
				this.set('isVisible', true);
				this.get('ads.module').pushSlotToQueue(this.get('name'));
			}
		});
	},

	willDestroyElement() {
		this._super(...arguments);

		if (this.isEnabled()) {
			this.get('ads.module').removeSlot(this.get('name'));
		}
	},

	isProperGeo(param) {
		const isProperGeo = get(Wikia, 'geo.isProperGeo');
		return typeof isProperGeo === 'function' && isProperGeo(param);
	},

	isEnabled() {
		return this.isProperGeo(this.highImpactCountries);
	}
});
