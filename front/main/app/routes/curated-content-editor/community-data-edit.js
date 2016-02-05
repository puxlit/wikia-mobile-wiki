import Ember from 'ember';
import CuratedContentEditorModel from '../../models/curated-content-editor';

export default Ember.Route.extend({
	/**
	 * @returns {Object} item
	 */
	model() {
		const rootModel= this.modelFor('curatedContentEditor');

		return rootModel.communityData;
	},

	/**
	 * @param {Object} controller
	 * @param {CuratedContentEditorItemModel} model
	 * @param {EmberStates.Transition} transition
	 * @returns {void}
	 */
	setupController(controller, model, transition) {
		console.log("setupController! model: ", model)
		this._super(controller, model, transition);
		controller.setProperties({
			isFeaturedItem: false,
			originalItemLabel: model.description
		});
	},

	/**
	 * @returns {void}
	 */
	renderTemplate() {
		this.render('curated-content-editor/item', {
			into: 'application'
		});
	},

	actions: {
		/**
		 * @returns {void}
		 */
		goBack() {
			this.transitionTo('curatedContentEditor.index');
		},

		/**
		 * @param {CuratedContentEditorItemModel} newItem
		 * @returns {void}
		 */
		done(newData) {
			const controller = this.get('controller'),
				originalItemLabel = controller.get('originalItemLabel'),
				rootModel = this.modelFor('curatedContentEditor'),
				blockModel =  rootModel.communityData;
			debugger

			CuratedContentEditorModel.updateItem(blockModel, newData, originalItemLabel);
			this.transitionTo('curatedContentEditor.index');
		}
	}
});
