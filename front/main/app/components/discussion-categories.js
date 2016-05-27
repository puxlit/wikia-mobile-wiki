import Ember from 'ember';
import {track, trackActions} from '../utils/discussion-tracker';

export default Ember.Component.extend({
	collapsed: false,
	tagName: 'fieldset',
	classNames: ['discussion-fieldset', 'discussion-categories'],
	classNameBindings: ['collapsed'],

	defaultVisibleCategoriesCount: 10,

	init() {
		this._super();

		this.updateCategoryAllSelected();
		this.get('categories').slice(this.get('defaultVisibleCategoriesCount')).setEach('collapsed', true);
	},

	toggleButtonLabel: Ember.computed('categories.@each.collapsed', function () {
		if (this.get('categories').isEvery('collapsed', false)) {
			return i18n.t('main.categories-show-less-button-label', {ns: 'discussion'});
		} else {
			return i18n.t('main.categories-show-more-button-label', {ns: 'discussion'});
		}
	}),

	toggleButtonVisible: Ember.computed('categories.length', function () {
		return this.get('categories.length') > this.get('defaultVisibleCategoriesCount');
	}),

	categoriesInputIdPrefix: Ember.computed.oneWay('inputIdPrefix', function () {
		return `${this.get('inputIdPrefix')}-discussion-category-`;
	}),

	categoryAllSelected: true,

	selectedCategoriesObserver: Ember.observer('categories.@each.selected', function () {
		this.updateCategoryAllSelected();
	}),

	categoryAllSelectedObserver: Ember.observer('categoryAllSelected', function () {
		if (this.get('categoryAllSelected')) {
			this.get('categories').setEach('selected', false);
		} else if (this.get('categories').isEvery('selected', false)) {
			this.set('categoryAllSelected', true);
		}
	}),

	updateCategoryAllSelected() {
		this.set('categoryAllSelected', this.get('categories').isEvery('selected', false));
	},

	actions: {
		/**
		 * Toggle categories section
		 */
		toggle() {
			const collapsed = this.get('collapsed');

			this.set('collapsed', !collapsed);
			track(collapsed ? trackActions.CategoriesUncollaped : trackActions.CategoriesCollaped);
		},

		/**
		 * Show/hide more categories when more than defaultVisibleCategoriesCount
		 */
		toggleMore() {
			const categories = this.get('categories');

			if (categories.isEvery('collapsed', false)) {
				categories.slice(this.get('defaultVisibleCategoriesCount')).setEach('collapsed', true);
			} else {
				categories.setEach('collapsed', false);
			}
		},

		/**
		 * Track click on category
		 */
		trackCategory(isAllCategories) {
			console.log(isAllCategories);
			track(isAllCategories ? trackActions.AllCategoriesTapped : trackActions.CategoryTapped);
		}
	}
	// TODO reset link
});
