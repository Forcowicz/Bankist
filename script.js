'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP
// TODO: Cash request

// Display notifications
let notifications = true;

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
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}]])
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}], [8, {}]])
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}]])
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}]])
};

const account5 = {
  owner: 'Sławomir Węglarz',
  movements: [1300, -2000, 3900, 15020, 2],
  interestRate: 1,
  pin: 5555,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}]])
};

const account6 = {
  owner: 'Michał Wojtusiak',
  movements: [300, -500, 100, 1, 20, -15, -300, 1337],
  interestRate: 1,
  pin: 5555,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}]])
};

const accounts = [account1, account2, account3, account4, account5, account6];

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
const btnTransferMessage = document.querySelector('.form__btn--transfer-message');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferMessageContainer = document.querySelector('.form__message-popup');
const inputTransferMessage = document.querySelector('.form__input--message');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const notificationsSwitchContainer = document.getElementById('notifications-switch-container');
const notificationsSwitch = document.getElementById('notifications-switch');
const notificationContainer = document.querySelector('.notification');
const labelNotification = document.querySelector('.notification__info');
const notificationBtnClose = document.querySelector('.notification__btn');

// Notifications' switch
notificationsSwitch.addEventListener('click', function() {
  notificationsSwitchContainer.classList.toggle('notifications-switch--active');
  notifications = !notifications;
});

const displayNotification = function(info, type = 'error') {
  if(notifications) {
    clearTimeout(hideNotification);

    // Check the notification character
    if (type === 'error') {
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

const displayMovementsDetails = function(movements) {
  movements.forEach(function(mov) {
    const [value, currentIndex] = mov;
    const movementDescriptionObject = currentAccount.movsDesc.get(currentIndex);
    const movementDetailsDOM = document.querySelector(`#movement${currentIndex} > .movements__details`);

    const html = `
      <span class='movements__column-element'>${value > 0 ? 'Received from' : 'Sent to'}: ${movementDescriptionObject.source || 'Initial'}</span>
      ${movementDescriptionObject.message ? `<span class='movements__column-element'>Message: ${movementDescriptionObject.message}</span>` : ''}
      <span class='movements__column-element'>Date: Today</span>
    `;

    document.getElementById(`movement${currentIndex}`).addEventListener('click', function() {
      if (movementDetailsDOM.classList.contains('movements__details--active')) {
        movementDetailsDOM.innerHTML = '';
      } else {
        movementDetailsDOM.insertAdjacentHTML('afterbegin', html);
        document.querySelectorAll(`.${movementDetailsDOM.className} > .movements__column-element`).forEach(el => setTimeout(() => el.style.opacity = '1', 150));
      }
      movementDetailsDOM.classList.toggle('movements__details--active');
    });
  });
}

const displayMovements = function(movements, sort = 0) {
  containerMovements.innerHTML = '';

 let movs;
  switch(sort) {
    case 1:
      movs = movements.map((el, i) => [el, i]).sort((a, b) => a[0] - b[0]);
      break;
    case 2:
      movs = movements.map((el, i) => [el, i]).sort((a, b) => b[0] - a[0]);
      break;
    default:
      movs = movements.map((el, i) => [el, i]);
  }

  movs.forEach(function(mov, i) {
    const type = mov[0] > 0 ? 'deposit' : 'withdrawal';
    let description = currentAccount.movsDesc.get(mov[1]);
    description.currentIndex = i;
    const html = `
      <div class="movements__row" id=movement${mov[1]}>
        <div class='movements__main'>
          <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
          <div class="movements__value">${mov[0]}€</div>
        </div>
        <div class='movements__details'></div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
  displayMovementsDetails(movs);
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
  displayMovements(currentAccount.movements, currentAccount.movsDesc);

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

    displayNotification(`Welcome, ${currentAccount.owner}!`, 'success');
  } else {
    displayNotification('Wrong credentials!');
  }
});

btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();

  inputTransferMessageContainer.classList.remove('hidden');
  inputTransferMessage.focus();
});

btnTransferMessage.addEventListener('click', function(e) {
  e.preventDefault();

  const message = inputTransferMessage.value;
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  if (amount > 0 && currentAccount.balance >= amount && receiverAcc?.username && receiverAcc.username !== currentAccount.username) {

    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    currentAccount.movsDesc.set(currentAccount.movements.length - 1, {source: receiverAcc.owner, message});
    receiverAcc.movsDesc.set(receiverAcc.movements.length - 1, {source: currentAccount.owner, message});

    updateUI();

    // Display success notification
    displayNotification(`You successfuly transfered ${amount}€ to ${receiverAcc.owner}!`, 'success');
  } else if (!receiverAcc?.username) {
    displayNotification('Receiver does not exist!');
  } else if (amount <= 0) {
    displayNotification('You have to transer at least 1€!');
  } else if (currentAccount.balance < amount) {
    displayNotification(`You don't have enough money! Need ${amount - currentAccount.balance}€ more.`);
  } else if (receiverAcc.username === currentAccount.username) {
    displayNotification('You cannot transfer money to yourself!');
  }

  inputTransferTo.value = inputTransferMessage.value = inputTransferAmount.value = '';
  inputTransferMessageContainer.classList.add('hidden');
});

btnLoan.addEventListener('click', function(e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if(amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);

    currentAccount.movsDesc.set(currentAccount.movements.length - 1, {source: 'Bank'});

    updateUI();
    inputLoanAmount.value = '';

    displayNotification( `Your request for ${amount}€ loan has been approved!`, 'success');
  } else if(amount <= 0) {
    displayNotification('Requested amount must be at least 1€!');
  } else {
    displayNotification(`The maximum loan you can take is ${currentAccount.movements.reduce((acc, mov) => mov > acc ? acc = mov : acc, 0) * 10}€!`);
  }
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

// const numDeposits1000 = accounts.flatMap(acc => acc.movements).filter(mov => mov > 1000).length;
const convertTitleCase = function(title) {
  const capitalizeString = str => `${str[0].toUpperCase()}${str.slice(1)}`;
  const exceptions = ['a', 'an', 'the', 'but', 'or', 'on', 'in', 'with'];

  const titleCase = title.toLowerCase().split(' ').map(word => exceptions.includes(word) ? word : capitalizeString(word));
  return capitalizeString(titleCase.join(' '));
}
console.log(convertTitleCase('Hello my name is Mark and I live an the england hehe thanks'));
