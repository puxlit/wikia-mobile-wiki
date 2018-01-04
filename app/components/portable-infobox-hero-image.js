import {readOnly} from '@ember/object/computed';
import {computed} from '@ember/object';
import Component from '@ember/component';
import Thumbnailer from '../modules/thumbnailer';
import ViewportMixin from '../mixins/viewport';
import RenderComponentMixin from '../mixins/render-component';

export default Component.extend(
	RenderComponentMixin,
	ViewportMixin,
	{
		// TODO it's not treated as custom property
		imageAspectRatio: 16 / 9,

		// @todo XW-1363 - keep it DRY
		// or should it be the same as in portable-infobox-image-collection?
		cropMode: computed('viewportDimensions.width', function () {
			const windowWidth = this.get('viewportDimensions.width'),
				imageAspectRatio = this.get('imageAspectRatio'),
				imageWidth = this.get('width') || windowWidth,
				imageHeight = this.get('height'),
				maxWidth = Math.floor(imageHeight * imageAspectRatio);

			let computedHeight = imageHeight;

			// wide image - crop images wider than 16:9 aspect ratio to 16:9
			if (imageWidth > maxWidth) {
				return Thumbnailer.mode.zoomCrop;
			}

			// image needs resizing
			if (windowWidth < imageWidth) {
				computedHeight = Math.floor(windowWidth * (imageHeight / imageWidth));
			}

			// tall image - use top-crop-down for images taller than square
			if (windowWidth < computedHeight) {
				return Thumbnailer.mode.topCropDown;
			}

			return Thumbnailer.mode.thumbnailDown;
		}),

		// @todo XW-1363 - keep it DRY
		computedHeight: computed('viewportDimensions.width', function () {
			const windowWidth = this.get('viewportDimensions.width'),
				imageAspectRatio = this.get('imageAspectRatio'),
				imageWidth = this.get('width') || windowWidth,
				imageHeight = this.get('height'),
				maxWidth = Math.floor(imageHeight * imageAspectRatio);

			let computedHeight = imageHeight;

			// wide image - crop images wider than 16:9 aspect ratio to 16:9
			if (imageWidth > maxWidth) {
				return Math.floor(windowWidth / imageAspectRatio);
			}

			// image needs resizing
			if (windowWidth < imageWidth) {
				computedHeight = Math.floor(windowWidth * (imageHeight / imageWidth));
			}

			// tall image - use top-crop-down for images taller than square
			if (windowWidth < computedHeight) {
				return windowWidth;
			}

			return computedHeight;
		}),

		computedWidth: readOnly('viewportDimensions.width')
	}
);
