import Ember from 'ember';
import ArticleContentMixin from '../mixins/article-content';
import VisibleMixin from '../mixins/visible';
import Thumbnailer from 'common/modules/Thumbnailer';

export default Ember.Component.extend(
	ArticleContentMixin,
	VisibleMixin,
	{
		classNames: ['article-media-image'],
		classNameBindings: ['type'],
		tagName: 'figure',

		emptyGif: 'data:image/gif;base64,R0lGODlhEAAJAIAAAP///////yH5BAEKAAEALAAAAAAQAAkAAAIKjI+py+0Po5yUFQA7',

		thumbnailUrl: Ember.computed('url', 'shouldBeLoaded', function () {
			const url = this.get('url');

			if (url && this.get('shouldBeLoaded')) {
				const {mode, width, height} = this.getThumbnailParams();

				return Thumbnailer.getThumbURL(url, {
					mode,
					height,
					width
				});
			} else {
				return this.emptyGif;
			}
		}),

		actions: {
			/**
			 * Sent by visibility-state-manager every time the window is scrolled and the component is in viewport
			 *
			 * @returns {void}
			 */
			onVisible() {
				if (!this.get('shouldBeLoaded')) {
					this.set('shouldBeLoaded', true);
				}
			}
		},

		/**
		* @returns {{mode: string, width: number, height: number}}
		*/
		getThumbnailParams() {
			const articleWidth = this.get('articleContent.width'),
				mode = this.get('cropMode') || Thumbnailer.mode.thumbnailDown,
				width = this.get('forceWidth') || articleWidth,
				height = this.get('forceHeight') || this.calculateHeightBasedOnWidth(
						this.get('width'), this.get('height'), width
					);

			return {mode, width, height};
		},

		/**
		 * Keep the aspect ratio
		 *
		 * @param {number} originalWidth
		 * @param {number} originalHeight
		 * @param {number} width
		 * @returns {number}
		 */
		calculateHeightBasedOnWidth(originalWidth, originalHeight, width) {
			const aspectRatio = originalWidth / originalHeight;

			return Math.floor(width * aspectRatio);
		},

		/**
		 * Normalize image width used to generate a thumbnail
		 * so we don't pollute the cache with multiple thumbs for every device width
		 *
		 * @param {number} width
		 * @returns {number}
		 */
		normalizeThumbWidth(width) {
			const thumbSize = {
				small: 340,
				medium: 660,
				large: 900
			};

			if (width <= thumbSize.small) {
				return thumbSize.small;
			} else if (width <= thumbSize.medium) {
				return thumbSize.medium;
			}

			return thumbSize.large;
		},
	});
