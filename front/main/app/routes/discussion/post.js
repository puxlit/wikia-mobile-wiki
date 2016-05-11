import DiscussionBaseRoute from './base';
import DiscussionPostModel from '../../models/discussion/post';
import DiscussionContributionRouteMixin from '../../mixins/discussion-contribution-route';
import DiscussionModerationRouteMixin from '../../mixins/discussion-moderation-route';
import DiscussionModalDialogMixin from '../../mixins/discussion-modal-dialog';

export default DiscussionBaseRoute.extend(
	DiscussionContributionRouteMixin,
	DiscussionModerationRouteMixin,
	DiscussionModalDialogMixin,
	{
		postDeleteFullScreenOverlay: true,

		/**
		 * @param {object} params
		 * @returns {Ember.RSVP.Promise}
		 */
		model(params) {
			return DiscussionPostModel.find(Mercury.wiki.id, params.postId, params.replyId);
		},

		/**
		 * @param {DiscussionPostModel} model
		 * @returns {void}
		 */
		afterModel(model) {
			let title = model.get('title');

			this._super(...arguments);

			if (!title) {
				title = i18n.t('main.share-default-title', {siteName: Mercury.wiki.siteName, ns: 'discussion'});
			}

			this.controllerFor('application').set('currentTitle', title);
		},

		/**
		 * @returns {void}
		 */
		activate() {
			this.controllerFor('application').setProperties({
				// Enables vertical-colored theme bar in site-head component
				themeBar: true,
				enableShareHeader: false
			});
			this._super();
		},

		/**
		 * @returns {void}
		 */
		deactivate() {
			this.controllerFor('application').setProperties({
				// Disables vertical-colored theme bar in site-head component
				themeBar: false,
				enableShareHeader: false
			});
			this._super();
		},

		/**
		 * Custom implementation of HeadTagsMixin::setDynamicHeadTags
		 * @param {Object} model, this is model object from route::afterModel() hook
		 * @returns {void}
		 */
		setDynamicHeadTags(model) {
			this._super(model, {
				appArgument: `${Ember.get(Mercury, 'wiki.basePath')}${window.location.pathname}`}
			);
		},

		actions: {
			/**
			 * Load more replies
			 * @returns {void}
			 */
			loadOlderReplies() {
				this.modelFor(this.get('routeName')).loadPreviousPage();
			},

			/**
			 * Load more replies
			 * @returns {void}
			 */
			loadNewerReplies() {
				this.modelFor(this.get('routeName')).loadNextPage();
			},
		}
	}
);
