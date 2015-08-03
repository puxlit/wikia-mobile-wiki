/// <reference path="../app.ts" />
/// <reference path="./MediaComponent.ts" />
/// <reference path="../mixins/ArticleContentMixin.ts" />
/// <reference path="../mixins/ViewportMixin.ts" />
'use strict';

App.InfoboxImageMediaComponent = App.ImageMediaComponent.extend(App.ArticleContentMixin, App.ViewportMixin, {
	imageAspectRatio: 16 / 9,
	hasCaption: false,
	limitHeight: true,
	noNormalizeWidth: true,
	cropMode: Mercury.Modules.Thumbnailer.mode.thumbnailDown,

	/**
	 * used to set proper height to img tag before it loads
	 * so we have less content jumping around due to lazy loading images
	 * @return number
	 */
	computedHeight: Em.computed('viewportDimensions.width', 'media.width', 'media.height', function (): number {
		var windowWidth: number = this.get('viewportDimensions.width'),
			imageAspectRatio: number = this.get('imageAspectRatio'),
			imageWidth: number = this.get('media.width') || windowWidth,
			imageHeight: number = this.get('media.height'),
			maximalWidth: number = Math.floor(imageHeight * imageAspectRatio),
			computedHeight: number = imageHeight;

		//image needs resizing
		if (windowWidth < imageWidth) {
			computedHeight =  Math.floor(windowWidth * (imageHeight / imageWidth));
		}

		//wide image- image wider than 16:9 aspect ratio. Crop it to have 16:9 ratio.
		if (imageWidth > maximalWidth) {
			this.set('cropMode', Mercury.Modules.Thumbnailer.mode.zoomCrop);
			return Math.floor(windowWidth / imageAspectRatio);
		}

		//high image- image higher than square. Use top-crop-down mode.
		if (windowWidth < computedHeight) {
			this.set('cropMode', Mercury.Modules.Thumbnailer.mode.topCropDown);
			return windowWidth;
		}

		return computedHeight;
	}),

	/**
	 * @desc return the params for getThumbURL for infobox image.
	 * In case of very high or very wide images, crop them properly.
	 */
	url: Em.computed('media', 'computedHeight', 'imageSrc', {
		get(): string {
				var media: ArticleMedia = this.get('media'),
					computedHeight: number = this.get('computedHeight'),
					windowWidth: number = this.get('viewportDimensions.width');

				if (!media) {
					return this.get('imageSrc');
				}

				return this.getThumbURL(media.url, {
					mode: this.get('cropMode'),
					height: computedHeight,
					width: windowWidth
				});
			}
	})
});
