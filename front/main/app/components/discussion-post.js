import DiscussionModalDialogMixin from '../mixins/discussion-modal-dialog';
import DiscussionPermalinkMixin from '../mixins/discussion-permalink';

export default Ember.Component.extend(
	DiscussionModalDialogMixin,
	DiscussionPermalinkMixin,
	{
		discussionSort: Ember.inject.service(),

		didInsertElement(...params) {
			this._super(...params);
			this.initializeNewerButtons();
		},

		canShowOlder: Ember.computed('model.replies.firstObject.position', function () {
			return this.get('model.replies.firstObject.position') > 1;
		}),

		canShowNewer: Ember.computed('model.replies.lastObject.position', 'model.repliesCount', function () {
			return this.get('model.replies.lastObject.position') < this.get('model.repliesCount');
		}),

		canReply: Ember.computed('model.isDeleted', 'model.isLocked', function () {
			return !this.get('model.isDeleted') && !this.get('model.isLocked');
		}),

		/**
		 * This method displays the floating 'load newer replies' button when it's needed
		 * @return {void}
		 */
		initializeNewerButtons() {
			const $floatingButton = Ember.$('.load-newer.floating'),
				$wideButton = Ember.$('.load-newer.wide'),
				$editor = Ember.$('.editor-container.sticky');
				offsetTop = $editor.length ? $editor.offset().top : window.innerHeight;


			if (offsetTop <= $wideButton.offset().top) {
				$floatingButton.css('top', offsetTop - 15).show();

				Ember.run.later(() => {
					Ember.$(window).one('scroll', () => {
						$floatingButton.hide();
					});
				}, 1000);
			}
		},
	}
);
