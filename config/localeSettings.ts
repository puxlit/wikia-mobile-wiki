var deepExtend: any = require('deep-extend');

var localeSettings: LocaleSettings = {
	'en' : {
		urls: {
			'terms-of-use-link-url': 'http://www.wikia.com/Terms_of_Use',
			privacyPolicyLinkUrl: 'http://www.wikia.com/Privacy_Policy'
		},
		date: {
			'endian': 'middle',
			'month-format': 'MM',
			'month-separator': '/',
			'day-format': 'DD',
			'day-separator': '/',
			'year-format': 'YYYY',
			'year-separator': ''
		}
	}
};

localeSettings['de'] = deepExtend({
	urls: {
	},
	date: {
		'endian': 'little',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'TT',
		'day-separator': '\/',
		'year-format': 'JJJJ',
		'year-separator': ''
	}
}, localeSettings['en']);
localeSettings['en-au'] = deepExtend({
	urls :{},
	date :{
		'endian': 'little'
	}
}, localeSettings['en']);

localeSettings['en-gb'] = deepExtend({
	urls :{},
	date :{
		'endian': 'little'
	}
}, localeSettings['en']);

localeSettings['en-ie'] = deepExtend({
	urls :{},
	date :{
		'endian': 'little'
	}
}, localeSettings['en']);

localeSettings['en-in'] = deepExtend({
	urls :{},
	date :{
		'endian': 'little'
	}
}, localeSettings['en']);

localeSettings['en-nz'] = deepExtend({
	urls :{},
	date :{
		'endian': 'little'
	}
}, localeSettings['en']);

localeSettings['en-za'] = deepExtend({
	urls :{},
	date :{
		'endian': 'little'
	}
}, localeSettings['en']);

localeSettings['es'] = deepExtend({
	urls :{
		'terms-of-use-link-url': 'http://es.wikia.com/T%C3%A9rminos_de_Uso',
		'privacyPolicyLinkUrl': 'http://es.wikia.com/T%C3%A9rminos_de_Uso'
	},
	date: {
		'endian': 'Segundo nombre',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'DD',
		'day-separator': '\/',
		'year-format': 'AAAA',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['es-es'] = deepExtend({
	urls :{
		'terms-of-use-link-url': 'http://es.wikia.com/T%C3%A9rminos_de_Uso',
		'privacyPolicyLinkUrl': 'http://es.wikia.com/T%C3%A9rminos_de_Uso'
	},
	date: {
		'endian': 'little',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'DD',
		'day-separator': '\/',
		'year-format': 'AAAA',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['fi'] = deepExtend({
	urls :{},
	date :{
		'endian': 'middle',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'DD',
		'day-separator': '\/',
		'year-format': 'YYYY',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['fr'] = deepExtend({
	urls :{
		'terms-of-use-link-url': 'http://fr.wikia.com/Conditions_d%27utilisation',
		'privacyPolicyLinkUrl': 'http://fr.wikia.com/Politique_de_confidentialit%C3%A9'
	},
	date: {
		'endian': 'little',
		'month-format': 'mm',
		'month-separator': '\/',
		'day-format': 'jj',
		'day-separator': '\/',
		'year-format': 'aaaa',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['it'] = deepExtend({
	urls :{},
	date :{
		'endian': 'little',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'GG',
		'day-separator': '\/',
		'year-format': 'AAAA',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['ja'] = deepExtend({
	urls :{
		'terms-of-use-link-url': 'http://ja.wikia.com/%E5%88%A9%E7%94%A8%E8%A6%8F%E7%B4%84',
		'privacyPolicyLinkUrl': 'http://ja.wikia.com/%E3%83%97%E3%83%A9%E3%82%A4%E3%83%90%E3%82%B7%E3%83%BC%E3%83%BB%E3%83%9D%E3%83%AA%E3%82%B7%E3%83%BC'
	},
	date: {
		'endian': 'big',
		'month-format': 'XX',
		'month-separator': '月',
		'day-format': 'XX',
		'day-separator': '日',
		'year-format': 'XXXX',
		'year-separator': '年'
	}
}, localeSettings['en']);

localeSettings['ko'] = deepExtend({
	urls :{},
	date :{
		'endian': 'middle',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'DD',
		'day-separator': '\/',
		'year-format': 'YYYY',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['nl'] = deepExtend({
	urls :{},
	date :{
		'endian': 'middle',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'DD',
		'day-separator': '\/',
		'year-format': 'YYYY',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['pl'] = deepExtend({
	urls :{},
	date :{
		'endian': 'little',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'DD',
		'day-separator': '\/',
		'year-format': 'RRRR',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['pt-br'] = deepExtend({
	urls :{},
	date :{
		'endian': 'little',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'DD',
		'day-separator': '\/',
		'year-format': 'AAAA',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['pt-pt'] = deepExtend({
	urls :{},
	date :{
		'endian': 'middle',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'DD',
		'day-separator': '\/',
		'year-format': 'YYYY',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['ru'] = deepExtend({
	urls :{},
	date :{
		'endian': 'little',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'ДД',
		'day-separator': '\/',
		'year-format': 'ГГГГ',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['sv-se'] = deepExtend({
	urls :{},
	date :{
		'endian': 'middle',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'DD',
		'day-separator': '\/',
		'year-format': 'YYYY',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['vi'] = deepExtend({
	urls :{},
	date :{
		'endian': 'middle',
		'month-format': 'MM',
		'month-separator': '\/',
		'day-format': 'DD',
		'day-separator': '\/',
		'year-format': 'YYYY',
		'year-separator': ''
	}
}, localeSettings['en']);

localeSettings['zh'] = deepExtend({
	urls :{
		'terms-of-use-link-url': 'http://zh-tw.wikia.com/wiki/%E4%BD%BF%E7%94%A8%E6%A2%9D%E6%AC%BE',
		'privacyPolicyLinkUrl': 'http://zh-tw.wikia.com/wiki/%E9%9A%B1%E7%A7%81%E6%AC%8A%E6%96%B9%E9%87%9D'
	},
	date: {
		'endian': 'big',
		'month-format': '曰',
		'month-separator': '\/',
		'day-format': '日',
		'day-separator': '\/',
		'year-format': '年',
		'year-separator': ''
	}
}, localeSettings['en']);


localeSettings['zh-hans'] = deepExtend({

	urls :{
		'terms-of-use-link-url': 'http://zh.wikia.com/wiki/%E4%BD%BF%E7%94%A8%E6%9D%A1%E6%AC%BE',
		'privacyPolicyLinkUrl': 'http://zh.wikia.com/wiki/%E9%9A%90%E7%A7%81%E6%9D%83%E6%96%B9%E9%92%88'
	},date :{
		'endian': '中间名',
		'month-format': '月',
		'month-separator': '\/',
		'day-format': '日',
		'day-separator': '\/',
		'year-format': '年',
		'year-separator': ''
	}
}, localeSettings['en']);

export = localeSettings;
