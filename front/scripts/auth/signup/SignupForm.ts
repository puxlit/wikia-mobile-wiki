interface HeliosError {
	description: string;
	additional: HeliosErrorAdditional;
}

interface HeliosErrorAdditional {
	field: string;
}

interface HeliosRegisterInput {
	username: string;
	password: string;
	email: string;
	birthdate: string;
}

class SignupForm {
	form: HTMLFormElement;

	constructor(form: Element) {
		this.form = <HTMLFormElement> form;
	}

	private urlEncode(object: Object) {
		var encodedString = '';
		for (var prop in object) {
			if (object.hasOwnProperty(prop)) {
				if (encodedString.length > 0) {
					encodedString += '&';
				}
				encodedString += encodeURI(prop + '=' + object[prop]);
			}
		}
		return encodedString;
	}

	private clearValidationErrors() {
		var errorNodes = this.form.querySelectorAll('.error');

		Array.prototype.forEach.call( errorNodes, function( node: Node ) {
			node.parentNode.removeChild( node );
		});
	}

	private displayValidationError(errors: Array<HeliosError>) {
		Array.prototype.forEach.call( errors, (function( err: HeliosError ) {
			var errorNode = window.document.createElement('small');
			errorNode.classList.add('error');
			errorNode.appendChild(window.document.createTextNode(this.translateValidationError(err.description)));
			this.form.elements[err.additional.field].parentNode.appendChild(errorNode);
		}).bind(this));
	}

	private translateValidationError(errCode: String) {
		// TODO translate error

		return errCode;
	}

	private onSubmit(event: Event) {
		var xhr = new XMLHttpRequest(),
			formElements: HTMLCollection = this.form.elements,
			data: HeliosRegisterInput = {
				username: (<HTMLInputElement> formElements.namedItem('username')).value,
				password: (<HTMLInputElement> formElements.namedItem('password')).value,
				email: (<HTMLInputElement> formElements.namedItem('email')).value,
				birthdate: (<HTMLInputElement> formElements.namedItem('birthdate')).value
				// TODO add langCode
			};

		this.clearValidationErrors();

		xhr.onreadystatechange = (function() {
			if(xhr.readyState < 4) {
				// TODO throbbing
				return;
			}

			if (xhr.status === 400) {
				this.displayValidationError(JSON.parse(xhr.responseText).errors);
				return;
			}
			if (xhr.status !== 200) {
			// TODO error handling
				alert('some error!');
				return;
			}

			// all is well
			if(xhr.readyState === 4) {
				alert('signed in correctly');
			}
		}).bind(this);

		xhr.open('POST', this.form.action, true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send(this.urlEncode(data));

		event.preventDefault();
	}

	public watch (): void {
		this.form.addEventListener('submit', this.onSubmit.bind(this));
	}
}
