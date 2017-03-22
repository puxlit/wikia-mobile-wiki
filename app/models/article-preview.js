import Ember from 'ember';
import request from 'ember-ajax/request';
import {form} from '../utils/content-type';
import {buildUrl} from '../utils/url';

export default Ember.Object.extend({
	host: null,

	/**
	 * prepare POST request body before sending to API
	 * Encode all params to be able to retrieve correct
	 * values from the text containing for example '&'
	 *
	 * @param {string} title title of edited article
	 * @param {string} wikitext editor wikitext
	 * @param {string} CKmarkup CK editor markup
	 * @returns {Promise}
	 */
	articleFromMarkup(title, wikitext, CKmarkup) {
		const url = buildUrl({
				host: this.get('host'),
				path: '/wikia.php',
				query: {
					controller: 'MercuryApi',
					method: 'getArticleFromMarkup',
					title
				}
			}),
			data = {};

		if (wikitext) {
			data.wikitext = wikitext;
		} else {
			data.CKmarkup = CKmarkup;
		}

		return request(url, {
			method: 'POST',
			// don't use charset until https://github.com/najaxjs/najax/pull/59 is merged
			contentType: 'application/x-www-form-urlencoded',
			data
		})
		/**
		 * @param {payload, redirectLocation}
		 * @returns {Promise}
		 */
			.then(({data}) => data.article);
	}
});
