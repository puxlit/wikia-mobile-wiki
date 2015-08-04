interface HeliosFacebookConnectData {
	fb_access_token: string;
}

class FacebookConnect extends Login {
	urlHelper: UrlHelper;

	constructor (form: HTMLFormElement) {
		super(form);
		new FacebookSDK(this.init.bind(this));
		this.urlHelper = new UrlHelper();
	}

	public init (): void {
		window.FB.getLoginStatus(function (facebookResponse: FacebookResponse): void {
			var status: string = facebookResponse.status;

			if (status === 'connected') {
				this.watch();
			}
		}.bind(this));
	}

	private getHeliosFacebookConnectData(): HeliosFacebookConnectData {
		return {
			fb_access_token: window.FB.getAccessToken()
		};
	}

	private getHeliosFacebookConnectUrl(userId: string): string {
		return this.form.getAttribute('data-heliosFacebookConnectURL')
			+ userId + '/facebook_app_id/' + window.facebookAppId;
	}

	public onLoginSuccess (loginResponse: LoginResponse): void {
		var facebookConnectXhr = new XMLHttpRequest(),
			data: HeliosFacebookConnectData = this.getHeliosFacebookConnectData(),
			url: string = this.getHeliosFacebookConnectUrl(loginResponse.user_id);

		facebookConnectXhr.onload = (e: Event) => {
			var status: number = (<XMLHttpRequest> e.target).status;

			if (status === HttpCodes.OK) {
				window.location.href = this.redirect;
			} else if (status === HttpCodes.BAD_REQUEST) {
				//ToDo show the "unable to connect" error
			} else {
				//ToDo show the "unable to connect" error
			}
		};

		facebookConnectXhr.onerror = (e: Event) => {
			//ToDo show the "unable to connect" error
		};

		facebookConnectXhr.open('PUT', url, true);
		facebookConnectXhr.withCredentials = true;
		facebookConnectXhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		facebookConnectXhr.send(this.urlHelper.urlEncode(data));
	}
}
