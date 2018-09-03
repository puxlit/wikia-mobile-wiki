import PlayerTracker from './player-tracker';

const playerName = 'jwplayer';
const trackingEventsMap = {
  ready: 'ready',
  adBlock: 'blocked',
  adClick: 'clicked',
  adRequest: 'loaded',
  adError: 'error',
  adImpression: 'impression',
  adStarted: 'started',
  adViewableImpression: 'viewable_impression',
  adFirstQuartile: 'first_quartile',
  adMidPoint: 'midpoint',
  adThirdQuartile: 'third_quartile',
  adComplete: 'completed',
  adSkipped: 'skipped',
  videoStart: 'content_started',
  complete: 'content_completed',
};

/**
  * Ads tracker for JWPlayer
  */
export default class JWPlayerTracker {
  /**
  * @param {Object} params
  */
  constructor(params = {}) {
    this.trackingParams = params;
    this.skipCtpAudioUpdate = false;
  }

  /**
  * Register event listeners on player
  * @param {Object} player
  * @returns {void}
  */
  register(player) {
    // Global imports:
    if (!window.Wikia.adEngine) {
      return;
    }

    const { vastParser } = window.Wikia.adEngine;
    // End of imports

    this.track('init');

    player.on('adComplete', () => {
      this.updateCreativeData();
    });

    player.on('adError', () => {
      this.updateCreativeData();
    });

    player.on('adRequest', (event) => {
      const currentAd = vastParser.getAdInfo(event.ima && event.ima.ad);

      this.updateCreativeData(currentAd);
    });

    Object.keys(trackingEventsMap).forEach((playerEvent) => {
      player.on(playerEvent, (event) => {
        let errorCode;

        if (['adRequest', 'adError', 'ready', 'videoStart'].indexOf(playerEvent) !== -1) {
          if (this.skipCtpAudioUpdate) {
            this.skipCtpAudioUpdate = false;
          } else {
            if (this.trackingParams.withCtp) {
              this.trackingParams.withCtp = !player.getConfig().autostart;
            }

            this.trackingParams.withAudio = !player.getMute();
          }

          if (playerEvent === 'adRequest' || playerEvent === 'adError') {
            this.skipCtpAudioUpdate = true;

            const vastParams = event.tag ? vastParser.parse(event.tag) : null;

            if (vastParams && vastParams.customParams) {
              this.trackingParams.withCtp = vastParams.customParams.ctp === 'yes';
              this.trackingParams.withAudio = vastParams.customParams.audio === 'yes';
            }
          }

          if (playerEvent === 'adError') {
            errorCode = event && event.code;
          }
        }

        this.track(trackingEventsMap[playerEvent], errorCode);
      });
    });
  }

  /**
  * Track single event
  * @param {string} eventName
  * @param {int} errorCode
  * @returns {void}
  */
  track(eventName, errorCode = 0) {
    PlayerTracker.track(this.trackingParams, playerName, eventName, errorCode);
  }

  /**
  * Update type of tracking data
  * @param {string} type
  * @returns {void}
  */
  updateType(type) {
    this.trackingParams.adProduct = type;
  }

  /**
  * Update video id
  * @param {string} videoId
  * @returns {void}
  */
  updateVideoId(videoId) {
    this.trackingParams.videoId = videoId;
  }

  /**
  * Update creative details
  * @param {Object} params
  * @returns {void}
  */
  updateCreativeData(params = {}) {
    this.trackingParams.lineItemId = params.lineItemId;
    this.trackingParams.creativeId = params.creativeId;
    this.trackingParams.contentType = params.contentType;
  }
}
