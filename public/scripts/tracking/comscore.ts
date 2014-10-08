/// <reference path="../baseline/Wikia.d.ts" />

'use strict';

interface Window {
	_comscore: any[];
}

module Wikia.Utils.tracking.comscore {
	var elem = document.createElement('script'),
		script: HTMLScriptElement;

	window._comscore = window._comscore || [];

	elem.async = true;
	elem.src = (document.location.protocol == "https:" ? "https://sb" : "http://b") + ".scorecardresearch.com/beacon.js";

	script = document.getElementsByTagName('script')[0];

	export function track () {
		var comscore = Wikia.tracking.comscore,
			id =  comscore.id,
			c7Value = comscore.c7Value;

		window._comscore.push({
			c1: '2',
			c2: id,
			options: {
				url_append: id + '=' + c7Value
			}
		});

		script.parentNode.insertBefore(elem, script);
	}
}
