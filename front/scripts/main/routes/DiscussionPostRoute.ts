/// <reference path="../app.ts" />
/// <reference path="../mixins/UseNewNavMixin.ts" />

'use strict';
App.DiscussionPostRoute = Em.Route.extend(App.UseNewNavMixin, {
	model (params: any): Em.RSVP.Promise {
		return App.DiscussionPostModel.find(Mercury.wiki.id, params.postId);
	},

	afterModel (model: typeof App.DiscussionPostModel): void {
		var title: string = model.get('title');
		if (!title) {
			title = i18n.t('discussion.share-default-title', {siteName: Mercury.wiki.siteName});
		}
		this.controllerFor('application').set('currentTitle', title);
	},

	activate (): void {
		this.controllerFor('application').setProperties({
			// Enables vertical-colored theme bar in site-head component
			themeBar: true,
			enableSharingHeader: true
		});
		this._super();
	},

	deactivate (): void {
		this.controllerFor('application').setProperties({
			// Disables vertical-colored theme bar in site-head component
			themeBar: false,
			enableSharingHeader: false
		});
		this._super();
	},

	actions: {
		didTransition(): boolean {
			this.controllerFor('application').set('noMargins', true);
			window.scrollTo(0, 0);
			return true;
		}
	}
});
