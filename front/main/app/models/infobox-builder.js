import Ember from 'ember';
import TrackClickMixin from '../mixins/track-click';

const InfoboxBuilderModel = Ember.Object.extend(
	TrackClickMixin,
	{
	/**
	 * @returns {void}
	 */
	init() {
		this._super(...arguments);
		this._itemIndex = {
			row: 0,
			image: 0,
			title: 0,
			'section-header': 0
		};
		this.infoboxState = [];
		this.itemInEditMode = null;
	},

	/**
	 * @desc add already prepared item to current infobox state
	 * @param {Object} object
	 *
	 * @returns {Object} added item
	 */
	addToState(object) {
		this.get('infoboxState').pushObject(object);
		return object;
	},

	/**
	 * @desc add item to infobox state. Extend it with already existing
	 * data if present.
	 * @param {string} type type of element we want to add
	 * @param {Object} [elementData=null] optional data if we already have some
	 *
	 * @returns {Object} added item
	 */
	addItem(type, elementData = null) {
		let item = {};

		switch (type) {
			case 'title':
				item = InfoboxBuilderModel.extendTitleData(this.createTitleItem(), elementData);
				break;
			case 'row':
				item = InfoboxBuilderModel.extendRowData(this.createRowItem(), elementData);
				break;
			case 'image':
				item = InfoboxBuilderModel.extendRowData(this.createImageItem(), elementData);
				break;
			case 'section-header':
				item = InfoboxBuilderModel.extendHeaderData(this.createSectionHeaderItem(), elementData);
				break;
			default:
				Ember.Logger.warn(`Unsupported infobox builder type encountered: '${type}'`);
				break;
		}

		return this.addToState(item);
	},

	/**
	 * @desc create new row item with accurate index
	 * with default data
	 *
	 * @returns {Object} added item
	 */
	createRowItem() {
		const itemType = 'row',
			index = this.increaseItemIndex(itemType);

		return {
			data: {
				label: i18n.t('main.label-default', {
					ns: 'infobox-builder',
					index
				})
			},
			infoboxBuilderData: {
				index,
				component: InfoboxBuilderModel.createComponentName(itemType)
			},
			source: `${itemType}${index}`,
			type: itemType
		};
	},

	/**
	 * @desc create new image item with accurate index
	 * with default data
	 *
	 * @returns {Object} added item
	 */
	createImageItem() {
		const itemType = 'image',
			index = this.increaseItemIndex(itemType);

		return {
			data: {
				caption: {
					source: `caption${index}`
				}
			},
			infoboxBuilderData: {
				index,
				component: InfoboxBuilderModel.createComponentName(itemType)
			},
			source: `image${index}`,
			type: itemType
		};
	},

	/**
	 * @desc create new title item with accurate index
	 * with default data
	 *
	 * @returns {Object} added item
	 */
	createTitleItem() {
		const itemType = 'title',
			index = this.increaseItemIndex(itemType);

		return {
			data: {
				defaultValue: ''
			},
			infoboxBuilderData: {
				index,
				component: InfoboxBuilderModel.createComponentName(itemType)
			},
			source: `${itemType}${index}`,
			type: itemType
		};
	},

	createSectionHeaderItem() {
		const itemType = 'section-header',
			index = this.increaseItemIndex(itemType);

		return {
			data: i18n.t('main.section-header-default', {
				ns: 'infobox-builder',
				index
			}),
			collapsible: false,
			infoboxBuilderData: {
				index,
				component: InfoboxBuilderModel.createComponentName(itemType)
			},
			type: itemType
		};
	},

	/**
	 * @desc increase index for given item type
	 * @param {String} indexType
	 * @returns {Number}
	 */
	increaseItemIndex(indexType) {
		return this.incrementProperty(`_itemIndex.${indexType}`);
	},

	/**
	 * @desc sets item to the edit mode
	 * @param {Object} item
	 * @returns {void}
	 */
	setEditItem(item) {
		if (item) {
			let itemData = item.data;

			if (item.type == 'section-header') {
				itemData = {
					value: item.data,
					collapsible: item.collapsible
				}
			}
			item.infoboxBuilderData.oldData = jQuery.extend({}, itemData);
		}

		this.set('itemInEditMode', item);
	},

	/**
	 * @desc sets a new value of the default field
	 * on the given title element
	 *
	 * @param {Object} item
	 * @param {Boolean} value
	 * @returns {void}
	 */
	editTitleItem(item, value) {
		const index = this.get('infoboxState').indexOf(item),
			defaultValue = value ? '{{PAGENAME}}' : '';

		this.set(`infoboxState.${index}.data.defaultValue`, defaultValue);
	},

	/**
	 * @desc sets a new value of the label field
	 * on the given row (data) element
	 *
	 * @param {Object} item
	 * @param {string} value
	 * @returns {void}
	 */
	editRowItem(item, value) {
		const index = this.get('infoboxState').indexOf(item);

		this.set(`infoboxState.${index}.data.label`, value);

		if (value.trim().length) {
			this.set(`infoboxState.${index}.source`, InfoboxBuilderModel.sanitizeCustomRowSource(value));
		}
	},

	/**
	 * @desc sets a new value of the data field
	 * on the given section header element
	 *
	 * @param {Object} item
	 * @param {Object} newValues
	 * @returns {void}
	 */
	editSectionHeaderItem(item, newValues) {
		const index = this.get('infoboxState').indexOf(item);

		Object.keys(newValues).forEach((key) => this.set(`infoboxState.${index}.${key}`, newValues[key]));
	},

	/**
	 * @desc removes item from state for given position
	 * @param {Object} item
	 * @returns {void}
	 */
	removeItem(item) {
		this.get('infoboxState').removeObject(item);
		this.resetEditMode();
	},

	/**
	 * @desc updates infobox state order
	 * @param {Ember.Array} newState
	 * @returns {void}
	 */
	updateInfoboxStateOrder(newState) {
		this.set('infoboxState', newState);
	},

	/**
	 * @desc resets item in edit mode and its position to null
	 * @returns {void}
	 */
	resetEditMode() {
		this.set('itemInEditMode', null);
	},

	/**
	 * @desc setup infobox builder initial state
	 * @returns {void}
	 */
	setupInitialState() {
		this.addItem('title');
		this.addItem('image');
		this.addItem('row');
		this.addItem('row');
	},

	/**
	 * @desc setup infobox builder state from already existing infobox template
	 * @param {Array} state
	 * @returns {void}
	 */
	setupExistingState(state) {
		state.forEach((element) => this.addItem(element.type, element));
	},

	createDataDiffs() {
		const currentState = this.get('infoboxState');
		let diff = {
			changed: false,
			changedField: '',
			added: 0,
			removed: 0
		};

		currentState.forEach((element) => {
			if (element.infoboxBuilderData.oldData) {
				switch (element.type) {
					case 'title':
						diff = InfoboxBuilderModel.createTitleDiff(element.data, element.infoboxBuilderData.oldData);
						break;
					case 'row':
						diff = InfoboxBuilderModel.createRowDiff(element.data, element.infoboxBuilderData.oldData);
						break;
					case 'section-header':
						diff = InfoboxBuilderModel.createSectionHeaderDiff(element.data, element.infoboxBuilderData.oldData);
						break;
					default:
						break;
				}

				if (diff.changed) {
					this.trackClick('infobox-builder', `changed-element-${element.type}-${diff.changedField}`);
				}
			}
		})
	},

	/**
	 * @desc saves infobox state to MW template
	 * @returns {Ember.RSVP.Promise}
	 */
	saveStateToTemplate() {
		this.createDataDiffs();

		return;
		return new Ember.RSVP.Promise((resolve, reject) => {
			Ember.$.ajax({
				url: M.buildUrl({
					path: '/wikia.php'
				}),
				data: {
					controller: 'PortableInfoboxBuilderController',
					method: 'publish',
					title: this.get('title'),
					data: InfoboxBuilderModel.prepareStateForSaving(this.get('infoboxState'))
				},
				dataType: 'json',
				method: 'POST',
				success: (data) => {
					if (data && data.success) {
						resolve(this.get('title'));
					} else {
						reject(data.errors);
					}
				},
				error: (err) => reject(err)
			});
		});
	}
});

InfoboxBuilderModel.reopenClass({
	/**
	 * @desc creates source for row item from user customized label value
	 * @param {String} input
	 * @returns {String}
	 */
	sanitizeCustomRowSource(input) {
		return input
			.trim()
			.toLowerCase()
			.replace(/\s+/g, '_');
	},

	/**
	 * @desc creates component name for given item type
	 * @param {String} type
	 * @returns {String}
	 */
	createComponentName(type) {
		return `infobox-builder-item-${type}`;
	},

	/**
	 * @desc Prepares infobox state to be sent to API.
	 * The infoboxBuilderData part is needed only on
	 * client side so remove it and wrap result as data object of the main infobox tag
	 *
	 * @param {Em.Array} state
	 * @returns {String} stringified object
	 */
	prepareStateForSaving(state) {
		const plainState = state.map((item) => {
			delete item.infoboxBuilderData;
			return item;
		}).toArray();

		return JSON.stringify({data: plainState});
	},

	/**
	 * @desc Overrides some properties of given Row object with additional
	 * data, obtained from already existing template
	 * @todo: use Object.assign() when we switch to Babel6
	 * https://wikia-inc.atlassian.net/browse/DAT-3825
	 *
	 * @param {Object} item item to extend
	 * @param {Object} itemData additional data
	 * @returns {Object}
	 */
	extendRowData(item, itemData) {
		if (itemData) {
			const {data} = itemData,
				// as data can be devoid of label value
				{label} = data || {};

			item.source = itemData.source || '';
			item.data.label = label || '';
		}

		return item;
	},

	/**
	 * @desc Overrides some properties of given Title object with additional
	 * data, obtained from already existing template
	 * @todo: use Object.assign() when we switch to Babel6
	 * https://wikia-inc.atlassian.net/browse/DAT-3825
	 *
	 * @param {Object} item item to extend
	 * @param {Object} itemData additional data
	 * @returns {Object}
	 */
	extendTitleData(item, itemData) {
		if (itemData) {
			const {data} = itemData,
				// as title can be devoid of default value
				{defaultValue} = data || {};

			item.source = itemData.source || '';
			item.data.defaultValue = defaultValue || '';
		}

		return item;
	},

	/**
	 * @desc Overrides some properties of given Image object with additional
	 * data, obtained from already existing template
	 * @todo use Object.assign() when we switch to Babel6
	 * https://wikia-inc.atlassian.net/browse/DAT-3825
	 *
	 * @param {Object} item item to extend
	 * @param {Object} itemData additional data
	 * @returns {Object}
	 */
	extendImageData(item, itemData) {
		if (itemData) {
			item.source = itemData.source || '';
			item.data.caption.source = '';

			if (itemData.data && itemData.data.caption) {
				const {data: {caption: {source: captionSource}}} = itemData;

				item.data.caption.source = captionSource || '';
			}
		}

		return item;
	},

	/**
	 * @desc Overrides some properties of given header object with additional
	 * data, obtained from already existing template
	 *
	 * @param {Object} item item to extend
	 * @param {Object} itemData additional data
	 * @returns {Object}
	 */
	extendHeaderData(item, itemData) {
		if (itemData) {
			item.data = itemData.data || '';
			item.collapsible = itemData.collapsible || false;
		}

		return item;
	},

	createTitleDiff(data, oldData) {
		let diff = {
				changed: false,
				changedField: '',
				added: 0,
				removed: 0
			};

		if (data.defaultValue !== oldData.defaultValue) {
			diff.changed = true;
			diff.changedField = 'defaultValue';
		}

		return diff;
	},

	createRowDiff(data, oldData) {
		let diffChars = 0,
			diff = {
				changed: false,
				changedField: '',
				added: 0,
				removed: 0
			};

		if (data.label !== oldData.label) {
			diff.changed = true;
			diff.changedField = 'label';
			diffChars = data.label.length - oldData.label.length;

			if (diffChars < 0) {
				diff.added = diffChars;
			} else if (diffChars > 0) {
				diff.removed = diffChars;
			}
		}

		return diff;
	},

	createSectionHeaderDiff(data, oldData) {
		let diffChars = 0,
			diff = {
				changed: false,
				changedField: '',
				added: 0,
				removed: 0
			};

		if (data !== oldData.value) {
			diff.changed = true;
			diff.changedField = 'value';
			diffChars = data.length - oldData.value.length;

			if (diffChars < 0) {
				diff.added = diffChars;
			} else if (diffChars > 0) {
				diff.removed = diffChars;
			}
		}

		return diff;
	}
});

export default InfoboxBuilderModel;
