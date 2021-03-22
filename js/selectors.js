'use strict';

// Labels
const labelWelcome = document.querySelector('.nav__welcome');
const labelAlert = document.querySelector('.alert__info');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const operationTransferHeadingLabel = document.querySelector('.operation--transfer > h2');
const operationTransferFromLabel = document.querySelector('.operation--transfer .operation__form-label');

// Buttons
const btnLogin = document.querySelector('.nav__login-btn');
const btnTransfer = document.getElementById('operationTransferBtn');
const btnTransferMessage = document.querySelector('.form__btn--transfer-message');
const btnLoan = document.getElementById('operationLoanBtn');
const btnClose = document.getElementById('operationCloseBtn');
const btnSort = document.querySelector('.btn--sort');
const btnSwitchActions = document.querySelector('.actions__switch');
const btnTransferSwitch = document.getElementById('switchOperations');
const btnCurrencyChange = document.getElementById('change-currency-btn');
const btnCloseAlert = document.querySelector('.alert__btn');
const btnSwitchAlerts = document.getElementById('alerts-switch-btn');
const btnSwitchActions_CountLabel = document.querySelector('.actions__switch-count > b');
const btnSwitchActionsLabel = document.querySelector('.actions__switch-text');
const btnAuthors = document.querySelector('.btn--authors');


// Inputs
const inputLoginUsername = document.querySelector('.nav__login-input--user');
const inputLoginPin = document.querySelector('.nav__login-input--pin');
const inputTransferTo = document.getElementById('operationTransferTo');
const inputTransferAmount = document.getElementById('operationTransferAmount');
const inputRequestDeadline = document.getElementById('form__input--deadline');
const inputLoanAmount = document.getElementById('operationLoanAmount');
const inputCloseUsername = document.getElementById('operationCloseUsername');
const inputClosePin = document.getElementById('operationClosePIN');

// Elements
const alert = document.querySelector('.alert');
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.actions');
const btnSwitchActions_CountContainer = document.querySelector('.actions__switch-count');
const operationTransfer = document.querySelector('.operation--transfer');
const transferRequestForm = document.getElementById('request-deadline');
const authorsContainer = document.querySelector('.authors');
