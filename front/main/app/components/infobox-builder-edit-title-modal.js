import Ember from 'ember';
import {track, trackActions} from 'common/utils/track';
import InfoboxBuilderInputAutoFocusMixin from '../mixins/infobox-builder-input-auto-focus';

export default Ember.Component.extend(
	InfoboxBuilderInputAutoFocusMixin,
	{
		untitledTemplate: i18n.t('infobox-builder:main.untitled-infobox-template'),
		value: Ember.computed('title', function () {
			return this.get('title') || '';
		}),
		isConfirmButtonDisabled: Ember.computed('value', function () {
			return this.get('value').trim() === '';
		}),

		actions: {
			onInputFocus() {
				track({
					action: trackActions.focus,
					category: 'infobox-builder',
					label: 'edit-template-title-input'
				});
			}
		}
	}
);
