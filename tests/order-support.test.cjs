const test = require('node:test');
const assert = require('node:assert/strict');
const support = require('../order-support.js');
const valid = {contact_method:'line',line_ready:'yes',name:'確認用 太郎',kana:'カクニンヨウ タロウ',email:'qa@example.com',tel:'09000000000',postal:'0000000',address:'テスト住所'};
test('LINE注文は友だち追加の確認のみ必要',()=>{
 assert.equal(support.validateOrder(valid),'');
 for(const patch of [{line_ready:''},{line_ready:'no'},{contact_method:'other'},{contact_method:''}]) assert.notEqual(support.validateOrder({...valid,...patch}),'');
});
test('メール例外はLINEなしでも有効な連絡先とお客様情報が必要',()=>{
 const email={...valid,contact_method:'email',line_name:'',line_ready:''};
 assert.equal(support.validateOrder(email),'');
 for(const patch of [{email:''},{email:'not-an-email'},{address:''},{name:''}]) assert.notEqual(support.validateOrder({...email,...patch}),'');
});
test('既存の注文通知の備考にも連絡方法と照合情報が残る',()=>{
 assert.match(support.supportNote(valid),/公式LINEの友だち追加：お客様による確認済み/);
 assert.doesNotMatch(support.supportNote(valid),/表示名|お名前の送信/);
 assert.match(support.supportNote({...valid,contact_method:'email'}),/メール（LINEを利用できないため）/);
 assert.match(support.supportNote({...valid,contact_method:'email'}),/qa@example.com/);
});
