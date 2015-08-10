/// <reference path="../app.ts" />
'use strict';

interface ImageCropData {
	x: number;
	y: number;
	width: number;
	height: number;
}

App.CuratedContentThumbnailMixin = Em.Mixin.create({
	thumbnailer: Mercury.Modules.Thumbnailer,
	cropMode: Mercury.Modules.Thumbnailer.mode.topCrop,
	emptyGif: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',

	aspectRatio: Em.computed('block', function (): number {
		return this.get('block') === 'featured' ? 16 / 9 : 1;
	}),

	aspectRatioName: Em.computed('block', function (): string {
		return this.get('block') === 'featured' ? 'landscape' : 'square';
	}),

	imageHeight: Em.computed('aspectRatio', 'imageWidth', function (): number {
		return Math.round(this.get('imageWidth') / this.get('aspectRatio'));
	}),

	generateThumbUrl(imageUrl: string, imageCropData: ImageCropData = null): string {
		var options: any = {
			width: this.get('imageWidth') || this.get('imageSize')
		};

		if (imageCropData) {
			options.mode = this.thumbnailer.mode.windowCrop;
			options.xOffset1 = imageCropData.x;
			options.yOffset1 = imageCropData.y;
			options.xOffset2 = imageCropData.x + imageCropData.width;
			options.yOffset2 = imageCropData.y + imageCropData.height;
		} else {
			options.mode = this.get('cropMode');
			options.height = this.get('imageHeight') || this.get('imageSize');
		}

		return this.thumbnailer.getThumbURL(imageUrl, options);
	}
});
