(function (root) {
  'use strict';
  function validateContact(data) {
    if (data.contact_method === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '') ? '' : 'メールアドレスをご確認ください。';
    }
    if (data.contact_method !== 'line' || data.line_ready !== 'yes') {
      return '公式LINEを友だち追加して、確認チェックを入れてください。';
    }
    return '';
  }
  function supportNote(data) {
    return data.contact_method === 'email'
      ? '【連絡方法】メール（LINEを利用できないため）\n返信先：' + (data.email || '')
      : '【連絡方法】LINE\n公式LINEの友だち追加：お客様による確認済み';
  }
  function validateOrder(data) {
    const contactError = validateContact(data);
    if (contactError) return contactError;
    if (['name','kana','email','tel','postal','address'].some(key => !(data[key] || '').trim())) {
      return 'お客様情報に未入力の項目があります。入力画面からご確認ください。';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) return 'メールアドレスをご確認ください。';
    return '';
  }
  function mount(form, params) {
    const host = form.querySelector('[data-contact-preference]');
    if (!host) return;
    host.innerHTML = `<section class="contact-preference" aria-labelledby="contact-heading">
      <p class="support-step">STEP 1 / ご連絡方法</p>
      <h2 id="contact-heading">まずは公式LINEをご登録ください</h2>
      <p>ご注文のご相談から、刺繍・仕様の確認、完成までのご連絡は、基本的にLINEで行います。</p>
      <input type="hidden" name="contact_method" id="contact-method" value="line">
      <fieldset id="line-fields">
        <ol><li>公式LINEを友だち追加</li><li>このページに戻って、お客様情報を入力</li></ol>
        <a class="line-primary" href="https://lin.ee/WQajS4j" target="_blank" rel="noopener noreferrer">公式LINEを友だち追加する →</a>
        <p class="support-help">すでに友だち追加済みの方は、そのまま下のチェックを入れてお進みください。</p>
        <label class="check"><input name="line_ready" id="line-ready" type="checkbox" value="yes" required><span>公式LINEを友だち追加しました。</span></label>
      </fieldset>
      <div id="email-selected" hidden role="status"><strong>メールでのご連絡を希望</strong><p>下にご入力いただくメールアドレスへ、仕様確認や製作のご連絡をお送りします。</p><button type="button" class="support-link" id="use-line">LINEでのやりとりに戻す</button></div>
      <details class="email-exception" id="email-exception"><summary>LINEをお使いになれない方はこちら</summary><p>LINEを利用できない場合は、メールでも承ります。</p><button type="button" class="support-email-button" id="use-email">メールでのやりとりを希望する</button></details>
    </section>`;
    const method = host.querySelector('#contact-method');
    const fields = host.querySelector('#line-fields');
    const emailSelected = host.querySelector('#email-selected');
    const exception = host.querySelector('#email-exception');
    const choose = value => {
      method.value = value;
      fields.hidden = value === 'email';
      fields.disabled = value === 'email';
      emailSelected.hidden = value !== 'email';
      exception.hidden = value === 'email';
    };
    host.querySelector('#use-email').onclick = () => choose('email');
    host.querySelector('#use-line').onclick = () => choose('line');
    if (params.get('contact_method') === 'email' || params.get('method') === 'email') choose('email');
    host.querySelector('#line-ready').checked = params.get('line_ready') === 'yes';
  }
  const api = {validateContact, validateOrder, supportNote, mount};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ENLUMOSupport = api;
})(typeof window !== 'undefined' ? window : globalThis);
