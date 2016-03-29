import Ember from 'ember';
import getEditToken from '../utils/edit-token';

export default Ember.Service.extend({
	upvotes: [],
	currentUser: Ember.inject.service(),

	addVote(revisionId, upvotes) {
		const upvote = this.get('upvotes').findBy('revisionId', revisionId);

		if (upvote) {
			let userUpvote = upvotes;

			if (Ember.isArray(userUpvote)) {
				userUpvote = userUpvote.findBy('from_user', this.get('currentUser.userId'));
			}

			if (Ember.isEmpty(upvote.userUpvoteId) && userUpvote) {
				Ember.set(upvote, 'count', upvote.count + 1);
				Ember.set(upvote, 'userUpvoteId', userUpvote.id);
			}

		} else {
			const userUpvote = upvotes.findBy('from_user', this.get('currentUser.userId')) || [];

			this.get('upvotes').addObject({
				revisionId,
				count: upvotes.length,
				userUpvoteId: userUpvote.id
			});
		}
	},

	removeVote(revisionId, upvoteId) {
		const revision = this.get('upvotes').findBy('revisionId', revisionId);

		if (revision) {
			if (revision.userUpvoteId === upvoteId) {
				Ember.set(revision, 'count', revision.count - 1);
				Ember.set(revision, 'userUpvoteId', null);
			}
		}
	},

	/**
	 * Sends request to MW API to upvote newId revision of title
	 * @param {string} revisionId ID of revision that is upvoted
	 * @param {string} title Text tilte of article in main namespace which revision is upvoted
	 * @returns {Ember.RSVP.Promise}
	 */
	upvote(revisionId, title) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			getEditToken(title)
				.then((token) => {
					Ember.$.ajax({
						url: M.buildUrl({
							path: '/wikia.php',
							query: {controller: 'RevisionUpvotesApiController', method: 'addUpvote'}
						}),
						data: {
							revisionId,
							token
						},
						dataType: 'json',
						method: 'POST',
						success: (resp) => {
							if (resp && resp.success) {
								this.addVote(revisionId, {id: resp.id, from_user: this.get('currentUser.userId')});
								resolve();
							} else {
								reject();
							}
						},
						error: (err) => reject(err)
					});
				});
		});
	},

	/**
	 * Send request to server to remove previously added upvote for a revision
	 * @param {int} upvoteId ID of upvote record to remove
	 * @param {int} userId user ID who made an edit
	 * @returns {Ember.RSVP.Promise}
	 */
	removeUpvote(revisionId, upvoteId, title, userId) {
		return new Ember.RSVP.Promise((resolve, reject) => {
			getEditToken(title)
				.then((token) => {
					Ember.$.ajax({
						url: M.buildUrl({
							path: '/wikia.php',
							query: {controller: 'RevisionUpvotesApiController', method: 'removeUpvote'}
						}),
						data: {
							id: upvoteId,
							userId,
							token
						},
						dataType: 'json',
						method: 'POST',
						success: (resp) => {
							if (resp && resp.success) {
								this.removeVote(revisionId, upvoteId);
								resolve();
							} else {
								reject();
							}
						},
						error: (err) => reject(err)
					});
				});
		});
	}
});
