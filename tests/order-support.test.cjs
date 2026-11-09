const test = require('node:test');
const assert = require('node:assert/strict');
const support = require('../order-support.js');
const valid = {contact_method:'line',line_name:'テスト表示名',line_ready:'yes',name:'確認用 太郎',kana:'カクニンヨウ タロウ',email:'qa@example.com',tel:'09000000000',postal:'0000000',address:'テスト住所'};
test('LINE注文は追加・送信の確認と表示名の両方が必要',()=>{
 assert.equal(support.validateOrder(valid),'');
 for(const patch of [{line_ready:''},{line_ready:'no'},{line_name:'   '},{contact_method:'other'},{contact_method:''}]) assert.notEqual(support.validateOrder({...valid,...patch}),'');
});
test('メール例外はLINEなしでも有効な連絡先とお客様情報が必要',()=>{
 const email={...valid,contact_method:'email',line_name:'',line_ready:''};
 assert.equal(support.validateOrder(email),'');
 for(const patch of [{email:''},{email:'not-an-email'},{address:''},{name:''}]) assert.notEqual(support.validateOrder({...email,...patch}),'');
});
test('既存の注文通知の備考にも連絡方法と照合情報が残る',()=>{
 assert.match(support.supportNote(valid),/LINE表示名：テスト表示名/);
 assert.match(support.supportNote({...valid,contact_method:'email'}),/メール（LINEを利用できないため）/);
 assert.match(support.supportNote({...valid,contact_method:'email'}),/qa@example.com/);
});
