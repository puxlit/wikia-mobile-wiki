import Ember from 'ember';
import VisibilityStateManager from 'visibility-state-manager.js';

/**
 * Mixin that sends 'onVisible' action when element appears on screen for the first time.
 *
 */

const VisibleMixin = Ember.Mixin.create({
	/**
	 * @returns {void}
	 */
	init() {
		this._super();

		VisibilityStateManager.add(this);
	}
});

export default VisibleMixin;
