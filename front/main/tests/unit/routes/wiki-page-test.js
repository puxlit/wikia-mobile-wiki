import {test, moduleFor} from 'ember-qunit';

const originalMercury = Ember.$.extend(true, {}, window.Mercury),
	model = Ember.Object.create({
		url: '/wiki/Kermit',
		description: 'Article about Kermit',
		displayTitle: 'Kermit The Frog'
	});

moduleFor('route:wikiPage', 'Unit | Route | wiki page', {
	afterEach() {
		window.Mercury = Ember.$.extend(true, {}, originalMercury);
	}
});

test('set head tags for correct model', function (assert) {
	const mock = this.subject(),
		expectedHeadTags = [
			{
				type: 'link',
				tagId: 'canonical-url',
				attrs: {
					rel: 'canonical',
					href: 'http://muppet.wikia.com/wiki/Kermit'
				}
			},
			{
				type: 'meta',
				tagId: 'meta-description',
				attrs: {
					name: 'description',
					content: 'Article about Kermit'
				}
			},
			{
				type: 'meta',
				tagId: 'meta-apple-app',
				attrs: {
					name: 'apple-itunes-app',
					content: 'app-id=1234, app-argument=http://muppet.wikia.com/wiki/Kermit'
				}
			}
		];

	mock.setHeadTags(model);

	assert.deepEqual(mock.get('headTags'), expectedHeadTags, 'headTags property is different than expected');
});

test('set head tags without apple-itunes-app when appId is not set', function (assert) {
	const mock = this.subject(),
		expectedHeadTags = [
			{
				type: 'link',
				tagId: 'canonical-url',
				attrs: {
					rel: 'canonical',
					href: 'http://muppet.wikia.com/wiki/Kermit'
				}
			},
			{
				type: 'meta',
				tagId: 'meta-description',
				attrs: {
					name: 'description',
					content: 'Article about Kermit'
				}
			}
		];

	delete window.Mercury.wiki.smartBanner.appId.ios;

	mock.setHeadTags(model);

	assert.deepEqual(mock.get('headTags'), expectedHeadTags, 'headTags property is different than expected');
});

test('set correct document title', function (assert) {
	const mock = this.subject(),
		expectedDocumentTitle = 'Kermit The Frog - Muppet Wiki - Wikia';

	mock.setHeadTags(model);

	assert.equal(document.title, expectedDocumentTitle, 'document title is different than expected');
});

test('set default document title when htmlTitleTemplate is not set', function (assert) {
	const mock = this.subject(),
		expectedDocumentTitle = 'Kermit The Frog - Wikia';

	delete window.Mercury.wiki.htmlTitleTemplate;

	mock.setHeadTags(model);

	assert.equal(document.title, expectedDocumentTitle, 'document title is different than expected');
});
