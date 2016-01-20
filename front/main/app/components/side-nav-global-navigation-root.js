import Ember from 'ember';
import LoginLinkMixin from '../mixins/login-link';

export default Ember.Component.extend(LoginLinkMixin, {

	hubsLinks: Ember.get(Mercury, 'wiki.navigation2016.hubsLinks'),
	exploreWikiaLabel: Ember.get(Mercury, 'wiki.navigation2016.exploreWikia.textEscaped'),
	wikiName: Ember.get(Mercury, 'wiki.siteName'),
	currentUser: Ember.inject.service(),
	isUserAuthenticated: Ember.computed.oneWay('currentUser.isAuthenticated'),

	logoutLink: Ember.computed(() => {
		return {
			href: M.buildUrl({
				namespace: 'Special',
				title: 'UserLogout',
			}),
			textKey: 'user-menu-log-out',
		};
	}),
	userProfileLink: Ember.computed('currentUser.name', function () {
		return M.buildUrl({
			namespace: 'User',
			title: this.get('currentUser.name')
		});
	}),
	actions: {
		goToLogin() {
			this.goToLogin();
		}
	}
});
