import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import Service from '@ember/service';
import window, { setupWindowMock } from 'ember-window-mock';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

const i18nService = Service.extend({
  t() {},
});

module('Integration | Component | global-footer-bottom-bar', (hooks) => {
  setupRenderingTest(hooks);
  setupWindowMock(hooks);

  let oldCookies;

  hooks.beforeEach(function () {
    this.owner.register('service:i18n', i18nService);
    oldCookies = window.Cookies;
    window.Cookies = {
      set() {},
    };
  });

  hooks.afterEach(() => {
    window.Cookies = oldCookies;
  });

  test('it correctly works when full site link is clicked', async function (assert) {
    const trackStub = sinon.stub();
    this.set('track', trackStub);
    this.set('model', {});

    const cookiesSetStub = sinon.stub(window.Cookies, 'set');
    const reloadStub = sinon.stub(window.location, 'reload');

    await render(hbs`{{global-footer/global-footer-bottom-bar model=model track=track}}`);
    await click('.wds-global-footer__button-link');

    assert.ok(trackStub.calledWith('full-site-link'), 'this.track is called');
    assert.ok(cookiesSetStub.calledWith('useskin', 'oasis', {
      domain: undefined,
      path: '/',
    }), 'correct cookie is set');
    assert.ok(reloadStub.calledOnce, 'window.location.reload is called');
  });
});
