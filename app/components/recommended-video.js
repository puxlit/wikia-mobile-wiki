import {inject as service} from '@ember/service';
import Component from '@ember/component';
import {run} from '@ember/runloop';
import NoScrollMixin from '../mixins/no-scroll';
import jwPlayerAssets from '../modules/jwplayer-assets';
import {track, trackActions} from '../utils/track';
import extend from '../utils/extend';

export default Component.extend(NoScrollMixin, {
	logger: service(),

	classNames: ['recommended-video'],
	classNameBindings: ['isExtended', 'isReady', 'isClosed', 'isClickToPlay'],

	playlistItem: null,
	playlistItems: null,
	isClickToPlay: true,

	init() {
		this._super(...arguments);

		run.later(() => {
			this.initRecommendedVideo();
		}, 5000);
	},

	willDestroyElement() {
		const player = this.get('playerInstance');
		if (player) {
			try {
				player.remove();
			} catch (e) {
				this.get('logger').warn(e);
			}
		}
	},

	actions: {
		play(index = 0) {
			this.get('playerInstance').playlistItem(index);

			track({
				category: 'recommended-video',
				label: 'recommended-video-click',
				action: trackActions.click,
			});
		},

		close() {
			this.setProperties({
				isClosed: true,
				noScroll: false
			});
			this.get('playerInstance').remove();
		}
	},

	initRecommendedVideo() {
		Promise.all([
			this.getVideoData(),
			jwPlayerAssets.load()
		]).then(([videoData]) => {
			this.setProperties({
				playlistItems: videoData.playlist,
				playlistItem: videoData.playlist[0]
			});
			window.wikiaJWPlayer(
				'recommended-video-player',
				this.getPlayerSetup(videoData),
				this.playerCreated.bind(this)
			);
		});

		track({
			category: 'recommended-video',
			label: 'recommended-video-revealed',
			action: trackActions.view,
		});
	},

	playerCreated(playerInstance) {
		playerInstance.once('mute', () => {
			this.expandPlayer(playerInstance);
		});

		playerInstance.on('play', (data) => {
			if (data.playReason === 'interaction') {
				this.expandPlayer(playerInstance);
			}
		});

		playerInstance.on('playlistItem', ({item}) => {
			// we have to clone item because Ember change it to Ember Object and it caused exception
			// when jwplayer try to set property on this object without using ember setter
			this.set('playlistItem', extend({}, item));

			track({
				category: 'recommended-video',
				label: 'playlist-item-start',
				action: trackActions.view,
			});
		});

		playerInstance.once('ready', () => {
			this.set('isReady', true);
		});

		this.set('playerInstance', playerInstance);
	},

	getPlayerSetup(jwVideoData) {
		return {
			autoplay: !this.get('isClickToPlay'),
			tracking: {
				category: 'recommended-video',
				track(data) {
					data.trackingMethod = 'both';

					track(data);
				},
			},
			showSmallPlayerControls: true,
			videoDetails: {
				playlist: jwVideoData.playlist
			},
			playerURL: 'https://content.jwplatform.com/libraries/h6Nc84Oe.js',
			repeat: true
		};
	},

	getVideoData() {
		return fetch(`https://cdn.jwplayer.com/v2/playlists/${this.get('playlistId')}`).then((response) => response.json());
	},

	expandPlayer(playerInstance) {
		this.setProperties({
			isExtended: true,
			noScroll: true,
			isClickToPlay: false,
		});

		playerInstance.getContainer().classList.remove('wikia-jw-small-player-controls');

		track({
			category: 'recommended-video',
			label: 'recommended-video-expanded',
			action: trackActions.view,
		});
	}
});
