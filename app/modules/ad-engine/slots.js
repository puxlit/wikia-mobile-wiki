export default {
	getContext() {
		return {
			'top-leaderboard': {
				aboveTheFold: true,
				adProduct: 'mobile_top_leaderboard',
				group: 'LB',
				options: {},
				slotName: 'MOBILE_TOP_LEADERBOARD',
				slotShortcut: 'l',
				sizes: [],
				defaultSizes: [[2, 2], [320, 50], [300, 250], [300, 50]],
				targeting: {
					loc: 'top'
				}
			},
			'incontent-boxad': {
				adProduct: 'mobile_in_content',
				group: 'HiVi',
				options: {},
				slotName: 'MOBILE_IN_CONTENT',
				slotShortcut: 'i',
				sizes: [],
				defaultSizes: [[320, 50], [300, 250], [300, 50], [320, 480]],
				targeting: {
					loc: 'middle'
				}
			},
			'bottom-boxad': {
				adProduct: 'mobile_prefooter',
				disabled: true,
				group: 'PF',
				options: {},
				slotName: 'MOBILE_PREFOOTER',
				slotShortcut: 'p',
				sizes: [],
				defaultSizes: [[320, 50], [300, 250], [300, 50]],
				targeting: {
					loc: 'footer'
				}
			},
			'bottom-leaderboard': {
				adProduct: 'bottom_leaderboard',
				group: 'PF',
				options: {},
				slotName: 'BOTTOM_LEADERBOARD',
				slotShortcut: 'b',
				sizes: [
					{
						viewportSize: [375, 627],
						sizes: [[300, 50], [320, 50], [300, 250], [300, 600]]
					}
				],
				defaultSizes: [[2, 2], [320, 50], [300, 250], [300, 50]],
				targeting: {
					pos: ['BOTTOM_LEADERBOARD', 'MOBILE_PREFOOTER'],
					loc: 'footer'
				}
			},
			'featured-video': {
				adProduct: 'featured',
				audioSegment: '',
				nonUapSlot: true,
				group: 'VIDEO',
				slotName: 'FEATURED',
				lowerSlotName: 'featured',
				targeting: {
					uap: 'none',
				},
				trackingKey: 'featured-video',
			},
			'inline-video': {
				adProduct: 'video',
				audioSegment: '',
				nonUapSlot: true,
				group: 'VIDEO',
				slotName: 'VIDEO',
				lowerSlotName: 'video',
				targeting: {
					uap: 'none',
				},
				trackingKey: 'video',
			},
		};
	}
};
