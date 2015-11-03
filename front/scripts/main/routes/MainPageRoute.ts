/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />
/// <reference path="../mixins/MainPageRouteMixin.ts" />

'use strict';

App.MainPageRoute = Em.Route.extend(App.MainPageRouteMixin, {
	/**
	 * @returns {Em.RSVP.Promise}
	 */
	model(): Em.RSVP.Promise {
		return App.MainPageModel.find();
	},

	/**
	 * @param {App.MainPageModel} model
	 * @returns {void}
	 */
	afterModel(model: typeof App.MainPageModel): void {
		this.controllerFor('mainPage').setProperties({
			adsContext: model.get('adsContext'),
			isRoot: true,
			ns: model.get('ns'),
			title: Em.getWithDefault(Mercury, 'wiki.siteName', 'Wikia')
		});

		if (!model.isCuratedMainPage) {
			// This is needed for articles
			App.VisibilityStateManager.reset();
		}
	},

	/**
	 * @param {*} controller
	 * @param {App.MainPageModel} model
	 * @returns {void}
	 */
	renderTemplate(controller: any, model: typeof App.MainPageModel): void {
		if (model.isCuratedMainPage) {
			this.render('main-page', {
				controller: 'mainPage',
				model
			});
		} else {
			this.render('article', {
				view: 'article',
				model
			});
		}
	},

	actions: {
		/**
		 * @param {*} error
		 * @param {EmberStates.Transition} transition
		 * @returns {boolean}
		 */
		error(error: any, transition: EmberStates.Transition): boolean {
			if (transition) {
				transition.abort();
			}
			Em.Logger.warn('Route error', error.stack || error);
			return true;
		}
	}
});
