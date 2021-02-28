'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Account holder
let currentAccount;

// Error timeout
let hideNotification;

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movsDescriptions: [null, null, null, null, null, null, null, null],
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movsDescriptions: [null, null, null, null, null, null, null, null],
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  movsDescriptions: [null, null, null, null, null, null, null, null],
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  movsDescriptions: [null, null, null, null, null],
};

const account5 = {
  owner: 'Sławomir Węglarz',
  movements: [1300, -2000, 3900, 15020, 2],
  interestRate: 1,
  pin: 5555,
  movsDescriptions: [null, null, null, null, null],
};

const accounts = [account1, account2, account3, account4, account5];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const notificationContainer = document.querySelector('.notification');
const labelNotification = document.querySelector('.notification__info');
const notificationBtnClose = document.querySelector('.notification__btn');

const displayNotification = function(info, type = 'error') {
  clearTimeout(hideNotification);

  // Check the notification character
  if(type === 'error') {
    notificationContainer.classList.add('notification--error');
    notificationContainer.classList.remove('notification--success');
  } else {
    notificationContainer.classList.add('notification--success');
    notificationContainer.classList.remove('notification--error');
  }

  notificationContainer.classList.add('pop');
  notificationContainer.classList.remove('hidden');
  labelNotification.textContent = info;

  hideNotification = setTimeout(function() {
    if (!notificationContainer.classList.contains('hidden')) {
      notificationContainer.classList.add('hidden');
      notificationContainer.classList.remove('pop');
    }
  }, 7000);
}

const createUsernames = function (accs) {
  accs.forEach(function (account) {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

const displayMovements = function(movements, sort = 0) {
  containerMovements.innerHTML = '';

  let movs;
  switch(sort) {
    case 1:
      movs = movements.slice().sort((a, b) => a - b);
      break;
    case 2:
      movs = movements.slice().sort((a, b) => b - a);
      break;
    default:
      movs = movements;
  }

  movs.forEach(function(mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const desc = currentAccount.movsDescriptions[i] ?? 'Unknown';
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class='movements__sender'>${type === 'deposit' ? 'from' : 'to'}: ${desc}</div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

const calcPrintBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);

  labelBalance.textContent = `${acc.balance}€`
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const outcomes = account.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outcomes)}€`;

  const interest = account.movements.filter(mov => mov > 0).map(mov => mov * account.interestRate / 100).reduce((acc, int) => int >= 1 ? acc + int : acc ,0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
}

const updateUI = function() {
  // Display account's movements
  displayMovements(currentAccount.movements);

  // Calculate and display balance
  calcPrintBalance(currentAccount);

  // Calculate and display summary
  calcDisplaySummary(currentAccount);
}

// Event handlers
btnLogin.addEventListener('click', function(e) {
  e.preventDefault();
  
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  
  if(currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display the UI and welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}!`;
    containerApp.style.opacity = '1';

    // Display movements and stuff
    updateUI();

    // Clear the form
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();
  } else {
    displayNotification('Wrong credentials!');
  }
});

btnLoan.addEventListener('click', function(e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if(amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);

    currentAccount.movsDescriptions.push('Bank');

    updateUI();
    inputLoanAmount.value = '';

    displayNotification( 'Money will be transfered soon!', 'success');
  } else if(amount <= 0) {
    displayNotification('Requested amount must be at least 1€!');
  } else {
    displayNotification(`The maximum loan you can take is ${currentAccount.movements.reduce((acc, mov) => (mov > acc ? (acc = mov) : acc),0) * 10}€!`);
  }
});

btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);

  if (amount > 0 && currentAccount.balance >= amount && receiverAcc?.username && receiverAcc.username !== currentAccount.username) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    currentAccount.movsDescriptions.push(receiverAcc.owner);
    receiverAcc.movsDescriptions.push(currentAccount.owner);

    updateUI();

    // Display success notification
    displayNotification('Transfer successful!', 'success');
  } else if (!receiverAcc?.username) {
    displayNotification('Receiver does not exist!');
  } else if (amount <= 0) {
    displayNotification('You have to transer at least 1€!');
  } else if (currentAccount.balance < amount) {
    displayNotification(`You don't have enough money! Need ${amount - currentAccount.balance}€ more.`);
  } else if (receiverAcc.username === currentAccount.username) {
    displayNotification('You cannot transfer money to yourself!');
  }

  inputTransferTo.value = inputTransferAmount.value = '';
});

btnClose.addEventListener('click', function(e){
  e.preventDefault();

  if(inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);

    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = '0';

    // Clear the fields
    inputCloseUsername.value = inputClosePin.value = '';

    displayNotification(`Your account, ${currentAccount.owner} has been successfuly deleted!`, 'success');
  } else if(inputCloseUsername.value !== currentAccount.username) {
    displayNotification('Wrong account username!');
  } else if(Number(inputClosePin.value) !== currentAccount.pin) {
    displayNotification( 'Wrong PIN!');
  }
});

let sorted = 0;
btnSort.addEventListener('click', () => {
  switch (sorted) {
    case 0:
      sorted = 1;
      break;
    case 1:
      sorted = 2;
      break;
    default:
      sorted = 0;
  }
  displayMovements(currentAccount.movements, sorted);
});

// Error event listener
notificationBtnClose.addEventListener('click', function() {
  notificationContainer.classList.add('hidden');
  notificationContainer.classList.remove('pop');
  clearTimeout(hideNotification);
})

////// LECTURES

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
