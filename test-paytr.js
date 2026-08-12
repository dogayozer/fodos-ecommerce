
const crypto = require('crypto');

async function testPaytr() {
  const merchant_id = process.env.PAYTR_MERCHANT_ID;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

  const email = "test@test.com";
  const payment_amount = "100"; // 1 TL
  const merchant_oid = "TESTORDER12345";
  const user_name = "Test User";
  const user_address = "Test address Istanbul";
  const user_phone = "05321234567";
  const merchant_ok_url = "https://fodos.com.tr/odeme/basarili";
  const merchant_fail_url = "https://fodos.com.tr/odeme/hata";
  
  const basketArray = [ ["PAYTR TEST ÜRÜNÜ", "1.00", 1] ];
  const user_basket = Buffer.from(JSON.stringify(basketArray)).toString('base64');
  
  const user_ip = "85.105.0.0";
  const timeout_limit = "30";
  const debug_on = "1";
  const test_mode = "1"; // Test mode enabled
  const no_installment = "0";
  const max_installment = "12";
  const currency = "TL";

  const hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode;
  const paytr_token = crypto.createHmac('sha256', merchant_key).update(hash_str + merchant_salt).digest('base64');

  const formData = new URLSearchParams();
  formData.append('merchant_id', merchant_id);
  formData.append('user_ip', user_ip);
  formData.append('merchant_oid', merchant_oid);
  formData.append('email', email);
  formData.append('payment_amount', payment_amount);
  formData.append('paytr_token', paytr_token);
  formData.append('user_basket', user_basket);
  formData.append('debug_on', debug_on);
  formData.append('no_installment', no_installment);
  formData.append('max_installment', max_installment);
  formData.append('user_name', user_name);
  formData.append('user_address', user_address);
  formData.append('user_phone', user_phone);
  formData.append('merchant_ok_url', merchant_ok_url);
  formData.append('merchant_fail_url', merchant_fail_url);
  formData.append('timeout_limit', timeout_limit);
  formData.append('currency', currency);
  formData.append('test_mode', test_mode);

  try {
    const res = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    const text = await res.text();
    console.log('PAYTR RESPONSE:', text);
  } catch(e) {
    console.error(e);
  }
}

testPaytr();
