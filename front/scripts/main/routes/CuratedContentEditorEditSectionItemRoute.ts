/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />

'use strict';

interface CuratedContentEditorEditSectionItemRouteParamsInterface {
	section: string;
	item: string;
}

App.CuratedContentEditorEditSectionItemRoute = Em.Route.extend({
	model: function (params: CuratedContentEditorEditSectionItemRouteParamsInterface) {
		var section = decodeURIComponent(params.section),
			item = decodeURIComponent(params.item),
			itemModel = App.CuratedContentEditorModel.getSectionItem(this.modelFor('curatedContentEditor'), section, item);

		return {
			section: section,
			item: itemModel
		};
	},

	setupController: function (controller: any, model: typeof App.CuratedContentEditorItemModel) {
		this._super(controller, model);
		controller.set('model.originalItem', $.extend({}, model.item));
	},

	renderTemplate: function (): void {
		this.render('curated-content-editor-item');
	},

	actions: {
		goBack(): void {
			var section = encodeURIComponent(this.modelFor('curatedContentEditor.editSectionItem').section);
			this.transitionTo('curatedContentEditor.section', section);
		},

		updateItem(updatedEditItemModel: CuratedContentEditorItemInterface): void {
			var section: string = this.modelFor('curatedContentEditor.editSectionItem').section,
				item = this.modelFor('curatedContentEditor.editSectionItem').originalItem,
				currentModel: typeof App.CuratedContentEditorModel = this.modelFor('curatedContentEditor');

			App.CuratedContentEditorModel.updateSectionItem(currentModel, updatedEditItemModel, section, item);
			this.transitionTo('curatedContentEditor.section', encodeURIComponent(section));
		},

		deleteItem(): void {
			var item = this.modelFor('curatedContentEditor.editSectionItem').originalItem,
				currentSectionModel: typeof App.CuratedContentEditorModel = this.modelFor('curatedContentEditor.section').data;

			App.CuratedContentEditorModel.deleteSectionItem(currentSectionModel, item);
			this.transitionTo('curatedContentEditor.section', encodeURIComponent(currentSectionModel.title));
		}
	}
});
