import Ember from 'ember';
import TrackClickMixin from '../mixins/track-click';
import {track, trackActions} from 'common/utils/track';

const trackCategory = 'recent-wiki-activity';

export default Ember.Component.extend(
	TrackClickMixin,
	{
		classNames: ['diff-page'],
		currentUser: Ember.inject.service(),
		revisionUpvotes: Ember.inject.service(),
		currentUserUpvoteId: Ember.computed('revisionUpvotes.upvotes.@each.count', 'currentUser.userId', function () {
			const upvotes = this.get('revisionUpvotes.upvotes').findBy('revisionId', this.get('model.newId')) || [];

			return upvotes.userUpvoteId;
		}),
		userNotBlocked: Ember.computed.not('currentUser.isBlocked'),
		showButtons: Ember.computed.and('currentUser.isAuthenticated', 'userNotBlocked'),
		showDiffLink: false,
		upvoted: Ember.computed.bool('currentUserUpvoteId'),
		upvotesEnabled: Ember.get(Mercury, 'wiki.language.content') === 'en',
		shouldShowUndoConfirmation: false,

		init() {
			this._super(...arguments);
			this.get('revisionUpvotes').addVote(this.get('model.newId'), this.get('model.upvotes'));
		},

		addUpvote() {
			this.get('revisionUpvotes').upvote(this.get('model.newId'), this.get('model.title'), this.get('currentUser.userId'))
				.then(
					this.trackSuccess.bind(this, 'upvote-success'),
					this.handleError.bind(this, 'main.error', 'upvote-error')
				);
			this.trackClick(trackCategory, 'upvote');
		},

		/**
		 * Send request to server to remove previously added upvote for a revision
		 * @param {int} upvoteId ID of upvote record to remove
		 * @returns {void}
		 */
		removeUpvote(upvoteId) {
			this.get('revisionUpvotes').removeUpvote(this.get('model.newId'), upvoteId, this.get('model.title'), this.get('model.userId')).then(
				this.trackSuccess.bind(this, 'remove-upvote-success'),
				this.handleError.bind(this, 'main.error', 'remove-upvote-error')
			);
			this.trackClick(trackCategory, 'remove-upvote');
		},

		/**
		 * Sends impression success tracking for recent-wiki-activity category
		 * @param {string} label
		 * @returns {void}
		 */
		trackSuccess(label) {
			track({
				action: trackActions.success,
				category: trackCategory,
				label
			});
		},

		/**
		 * Sends impression error tracking for recent-wiki-activity category
		 * @param {string} label
		 * @returns {void}
		 */
		trackError(label) {
			track({
				action: trackActions.error,
				category: trackCategory,
				label
			});
		},

		/**
		 * Displays error message
		 *
		 * @param {string} messageKey
		 * @param {string} label
		 * @returns {void}
		 */
		handleError(messageKey, label) {
			this.trackError(label);
			this.get('showError')(messageKey);
		},

		actions: {
			/**
			 * Adds or removes upvote
			 * @returns {void}
			 */
			handleVote() {
				if (this.get('upvoted')) {
					this.removeUpvote(this.get('currentUserUpvoteId'));
				} else {
					this.addUpvote();
				}
			},

			/**
			 * Shows confirmation modal
			 * @returns {void}
			 */
			showConfirmation() {
				this.set('shouldShowUndoConfirmation', true);

				track({
					action: trackActions.open,
					category: trackCategory,
					label: 'undo-confirmation-open'
				});
			},

			/**
			 * Closes confirmation modal
			 * @returns {void}
			 */
			closeConfirmation() {
				this.set('shouldShowUndoConfirmation', false);

				track({
					action: trackActions.close,
					category: trackCategory,
					label: 'undo-confirmation-close'
				});
			},

			/**
			 * @param {string} summary Description of reason for undo to be stored as edit summary
			 * @returns {void}
			 */
			undo(summary) {
				this.get('undo')(summary).then(
					() => {
						this.trackSuccess('undo-success');
						this.get('redirectToRWA')().then(() => this.get('showSuccess')('main.undo-success'));
					},
					(errorMsg) => {
						this.handleError(errorMsg, 'undo-error');
					}
				);

				this.trackClick(trackCategory, 'undo');
			}
		}
	}
);
