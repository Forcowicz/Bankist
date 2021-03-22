'use strict';

const currencyCodes = new Set('AFN ALL DZD USD EUR AOA XCD XCD ARS AMD AWG AUD EUR AZN BSD BHD BDT BBD BYN EUR BZD XOF BMD BTN INR BOB BOV USD BAM BWP NOK BRL USD BND BGN XOF BIF CVE KHR XAF CAD KYD XAF XAF CLF CLP CNY AUD AUD COP COU KMF CDF XAF NZD CRC HRK CUC CUP ANG EUR CZK XOF DKK DJF XCD DOP USD EGP SVC USD XAF ERN EUR ETB EUR FKP DKK FJD EUR EUR EUR XPF EUR XAF GMD GEL EUR GHS GIP EUR DKK XCD EUR USD GTQ GBP GNF XOF GYD HTG USD AUD EUR HNL HKD HUF ISK INR IDR XDR IRR IQD EUR GBP ILS EUR JMD JPY GBP JOD KZT KES AUD KPW KRW KWD KGS LAK EUR LBP LSL ZAR LRD LYD CHF EUR EUR MOP MGA MWK MYR MVR XOF EUR USD EUR MRU MUR EUR XUA MXN MXV USD MDL EUR MNT EUR XCD MAD MZN MMK NAD ZAR AUD NPR EUR XPF NZD NIO XOF NGN NZD AUD USD NOK OMR PKR USD  PAB USD PGK PYG PEN PHP NZD PLN EUR USD QAR MKD RON RUB RWF EUR EUR SHP XCD XCD EUR EUR XCD WST EUR STN SAR XOF RSD SCR SLL SGD ANG XSU EUR EUR SBD SOS ZAR  SSP EUR LKR SDG SRD NOK SZL SEK CHE CHF CHW SYP TWD TJS TZS THB USD XOF NZD TOP TTD TND TRY TMT USD AUD UGX UAH AED GBP USD USD USN UYI UYU UZS VUV VEF VND USD USD XPF MAD YER ZMW ZWL EUR'.split(' '));

const changeCurrency = function() {
  const currency = modal.input.value.toUpperCase();

  if(currency.length === 3 && currencyCodes.has(currency)) {
    currentAccount.currency = currency;
    displayAlert(`Your currency has been changed to ${currency}.`, 'success');
  } else if(currency.length !== 3) {
    displayAlert('Currency code needs to be 3 characters long.');
  } else if(!currencyCodes.has(currency)) {
    displayAlert('This currency code is invalid.');
  }

  modal.btn.removeEventListener('click', changeCurrency);
  modal.closeModal();
  modal.input.value = '';
  updateUI(0);
}

btnCurrencyChange.addEventListener('click', () => {
  modal.openModal('Enter a currency code', currentAccount.currency, changeCurrency);
});
