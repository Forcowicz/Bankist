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

// Is currently transfer or request operation visible
let operationTransferState = false;

// Requests counts for IDs
let requestCount = -1;

// Data
const transferRequests = [];

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}]]),
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}], [8, {}]]),
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}]]),
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}]]),
};

const account5 = {
  owner: 'Sławomir Węglarz',
  movements: [1300, -2000, 3900, 15020, 2],
  interestRate: 1,
  pin: 5555,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}]]),
};

const account6 = {
  owner: 'Michał Wojtusiak',
  movements: [300, -500, 100, 1, 20, -15, -300, 1337],
  interestRate: 1,
  pin: 5555,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}]]),
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
const btnSwitchLabel = document.querySelector('.movements__switch-text');
const operationTransferHeading = document.querySelector('.operation--transfer > h2');
const operationTransferFromLabel = document.querySelector('.operation--transfer .form__label');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements__movs');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnTransferMessage = document.querySelector('.form__btn--transfer-message');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');
const btnSwitch = document.getElementById('btn-switch');
const btnFormSwitch = document.getElementById('switchOperations');

const transferOperation = document.querySelector('.operation--transfer');

const transferRequestForm = document.getElementById('request-deadline');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferMessageContainer = document.querySelector('.form__message-popup');
const inputTransferMessage = document.querySelector('.form__input--message');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputRequestDeadline = document.getElementById('form__input--deadline');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const notificationsSwitch = document.getElementById('notifications-switch');
const notificationContainer = document.querySelector('.notification');
const labelNotification = document.querySelector('.notification__info');
const notificationBtnClose = document.querySelector('.notification__btn');

// Notifications' switch
notificationsSwitch.addEventListener('click', function() {
  this.classList.toggle('notifications-switch-btn--active');
  displayNotification(`Notifications turned ${notifications ? 'OFF' : 'ON'}.`, 'success', true);
  notifications = !notifications;
});

const stripTags = function (html) {
  let doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

const displayNotification = function(info, type = 'error', ignore) {
  if(notifications || ignore) {
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

const modifySwitchBtn = function(changeTo, runFunction = false) {
  // 0: Change to movements, 1: Change to requests, Other: Don't change
  if(changeTo === 0) {
    btnSwitch.classList.add('movements__switch--movements');
    btnSwitch.classList.remove('movements__switch--requests');
    btnSwitchLabel.textContent = 'Movements';
  } else if(changeTo === 1) {
    btnSwitch.classList.remove('movements__switch--movements');
    btnSwitch.classList.add('movements__switch--requests');
    btnSwitchLabel.textContent = 'Requests';
  }

  if(runFunction) {
    changeTo === 0 ? displayMovements(currentAccount.movements) : displayTransferRequests(transferRequests);
  }
};

const toggleDescriptions = (type, i) => {
  const details = document.querySelector(`#${type}${i} > .movements__details`);
  document.querySelector(`#${type}${i}`).addEventListener('click', function() {
    if(Number.parseInt(details.style.maxHeight) > 0) {
      details.style.maxHeight = 0;
    } else {
      details.style.maxHeight = `${details.scrollHeight}px`;
    }
  });
};

// This function creates DOM elements, displays movements
const displayMovements = function(movements, sort = 0) {
 containerMovements.innerHTML = '';
 modifySwitchBtn(0);

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
    const [value, currentIndex] = mov;
    const movementDescriptionObject = currentAccount.movsDesc.get(currentIndex);
    movementDescriptionObject.currentIndex = i;
    const type = value > 0 ? 'positive' : 'negative';
    const html = `
      <div class="movements__row" id=movement${i}>
        <div class='movements__main'>
          <div class="movements__type movements__type--${type}">${i + 1} ${type === 'positive' ? 'deposit' : 'withdrawal'}</div>
          <div class="movements__value movements__value--margin">${value.toFixed(2)}€</div>
        </div>
        <div class='movements__details'>
          <div class='movements__details-row'>
            <span class='movements__details-column'>${value > 0 ? 'From:' : 'To'}</span>
            <span class='movements__details-column'>${movementDescriptionObject.source || 'N/A'}</span>
          </div>
          <div class='movements__details-row'>
            <span class='movements__details-column'>Message:</span>
            <span class='movements__details-column'>${movementDescriptionObject.message || 'N/A'}</span>
          </div>
          <div class='movements__details-row'>
            <span class='movements__details-column'>Sent:</span>
            <span class='movements__details-column'>${movementDescriptionObject.date || 'N/A'}</span>
          </div>
        </div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);

    // Display descriptions
    toggleDescriptions('movement', i);
  });
}

const setReactButtons = (request, i) => {

  document.querySelector(`#request${i} .movements__react-button--decline`).addEventListener('click', function() {
    removeRequest(request.id);
    updateUI();
  });

  if(document.querySelector(`#request${i} .movements__react-button--accept`)) {
    document.querySelector(`#request${i} .movements__react-button--accept`).addEventListener('click', function() {
      const receiverAcc = accounts.find(acc => acc.owner === request.from);

      currentAccount.movements.push(-request.amount);
      receiverAcc.movements.push(request.amount);

      currentAccount.movsDesc.set(currentAccount.movements.length - 1, {source: receiverAcc.owner, message: `Request #${request.id} from ${request.sent}`, date: '12-02-2021'});
      receiverAcc.movsDesc.set(receiverAcc.movements.length - 1, {source: currentAccount.owner, message: `Request #${request.id} from ${request.sent}`, date: '12-02-2021'});

      removeRequest(request.id);
      displayNotification(`Request accepted. You transfered ${request.amount.toFixed(2)}€ to ${request.from}.`, 'success')
      updateUI();
    });
  }
}

const displayReactButtons = type => {
  if(type === 'positive') {
    return `
      <div class='movements-react-button-container'>
         <button type='button' class='movements__react-button movements__react-button--decline'>
          <svg>
            <use xlink:href='sprite.svg#close-cross'></use>
          </svg>
        </button>
      </div>
    `
  } else {
    return `
      <div class='movements-react-button-container'>
         <button type='button' class='movements__react-button movements__react-button--accept'>
          <svg>
            <use xlink:href='sprite.svg#check-mark'></use>
          </svg>
         </button>
         <button type='button' class='movements__react-button movements__react-button--decline'>
          <svg>
            <use xlink:href='sprite.svg#close-cross'></use>
          </svg>
        </button>
      </div>
    `
  }
}

const removeRequest = id => transferRequests.splice(id, 1);

// This function displays transfer requests with their descriptions in form of movements
const displayTransferRequests = function(req, sort = 0) {
  containerMovements.innerHTML = '';
  modifySwitchBtn(1);

  let requests = req.filter(request => request.to === currentAccount.owner || request.from === currentAccount.owner);
  switch(sort) {
    case 0:
      requests.sort((a, b) => a.amount - b.amount);
      break;
    case 1:
      requests.sort((a, b) => b.amount - a.amount);
      break;
  }

  requests.forEach((request, i) => {
    const type = currentAccount.owner === request.from ? 'positive' : 'negative';
    const source = request.from === currentAccount.owner ? 'to' : 'from';
    const html = `
      <div class="movements__row" id="request${i}">
        <div class='movements__main'>
          <div class='movements__type movements__type--${type}'>${i + 1} request</div>
          <span class='movements__from'>${type === 'positive' ? 'To: ' : 'From: '}${type === 'positive' ? request.to : request.from}</span>
          ${displayReactButtons(type)}
          <div class='movements__value'>${(request.amount).toFixed(2)}€</div>
        </div>
        <div class='movements__details'>
          <div class='movements__details-row'>
          <span class='movements__details-column'>${source}:</span>
          <span class='movements__details-column'>${request[source] || 'N/A'}</span>
          </div>
          <div class='movements__details-row'>
            <span class='movements__details-column'>Message:</span>
            <span class='movements__details-column'>${request.message || 'N/A'}</span>
          </div>
          <div class='movements__details-row'>
            <span class='movements__details-column'>Sent:</span>
            <span class='movements__details-column'>${request.sent}</span>
          </div>
          <div class='movements__details-row'>
            <span class='movements__details-column'>Valid until:</span>
            <span class='movements__details-column'>${request.deadline || 'Forever'}</span>
          </div>
      </div>
     </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);

    // Display descriptions
    toggleDescriptions('request', i);

    setReactButtons(request, i);
  });
}
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);

  labelBalance.textContent = `${(acc.balance).toFixed(2)}€`
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const outcomes = account.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outcomes.toFixed(2))}€`;

  const interest = account.movements.filter(mov => mov > 0).map(mov => mov * account.interestRate / 100).reduce((acc, int) => int >= 1 ? acc + int : acc ,0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
}

const updateUI = function() {
  // Display account's movements
  displayMovements(currentAccount.movements, currentAccount.movsDesc);

  // Calculate and display balance
  calcDisplayBalance(currentAccount);

  // Calculate and display summary
  calcDisplaySummary(currentAccount);
}

// Event handlers
btnLogin.addEventListener('click', function(e) {
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

  if(currentAccount?.pin === +inputLoginPin.value) {
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

const getFormInputTransfer = function() {
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  const amount = +inputTransferAmount.value;
  const message = stripTags(inputTransferMessage.value);
  const deadline = inputRequestDeadline.value;
  return [receiverAcc, amount, message, deadline];
}

btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();

  const toggleMessagePopup = () => {
    inputTransferMessageContainer.classList.remove('hidden');
    inputTransferMessage.focus();
  }

  const [receiverAcc, amount] = getFormInputTransfer();

  // Get the context, if it's a transfer or a request
  const context = operationTransferState ? ['request', 'from'] : ['transfer', 'to'];

  if(receiverAcc?.username && receiverAcc.username !== currentAccount.username && amount > 0 && currentAccount.balance >= amount) {
    operationTransferState ? transferRequestForm.style.display = 'block' : transferRequestForm.style.display = 'none';
    toggleMessagePopup();
  } else if(!receiverAcc) {
    displayNotification('The receiver account does not exist.');
  } else if(receiverAcc.username === currentAccount.username) {
    displayNotification(`You cannot ${context[0]} money ${context[1]} yourself.`);
  } else if(amount <= 0) {
    displayNotification(`You have to ${context[0]} at least 1€.`);
  } else if(currentAccount.balance < amount) {
    if(operationTransferState) {
      toggleMessagePopup();
    } else {
      displayNotification(`You don't have enough money. Need ${amount - currentAccount.balance}€ more.`);
    }
  }
 });

btnTransferMessage.addEventListener('click', function(e) {
  e.preventDefault();

  const [receiverAcc, amount, message, deadline] = getFormInputTransfer();

  if(message.length <= 25) {
    if(operationTransferState) {
      transferRequests.push({
        to: receiverAcc.owner,
        from: currentAccount.owner,
        amount,
        message,
        sent: '10-03-2021',
        deadline,
        id: ++requestCount
      });
      displayNotification(`You successfuly requested ${amount}€ from ${receiverAcc.owner}!`, 'success');
    } else {
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);

      currentAccount.movsDesc.set(currentAccount.movements.length - 1, {source: receiverAcc.owner, message, date: '12-02-2021'});
      receiverAcc.movsDesc.set(receiverAcc.movements.length - 1, {source: currentAccount.owner, message, date: '12-02-2021'});
      displayNotification(`You successfuly transfered ${amount}€ to ${receiverAcc.owner}!`, 'success');
    }
  } else if(message.length > 25) {
    displayNotification('Your message cannot be longer than 25 characters!');
  }

  inputTransferMessageContainer.classList.add('hidden');
  inputTransferTo.value = inputTransferAmount.value = inputTransferMessage.value = ''
  modifySwitchBtn();
  updateUI();
});

btnLoan.addEventListener('click', function(e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if(amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);

    currentAccount.movsDesc.set(currentAccount.movements.length - 1, {source: 'Bank'});

    updateUI();
    modifySwitchBtn();
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

  if(inputCloseUsername.value === currentAccount.username && +(inputClosePin.value) === currentAccount.pin) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);

    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = '0';

    // Clear the fields
    inputCloseUsername.value = inputClosePin.value = '';

    displayNotification(`Your account, ${currentAccount.owner} has been successfuly deleted!`, 'success');
  } else if(inputCloseUsername.value !== currentAccount.username) {
    displayNotification('Wrong account username!');
  } else if(+inputClosePin.value !== currentAccount.pin) {
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
  btnSwitch.classList.contains('movements__switch--requests') ? displayTransferRequests(transferRequests, sorted) : displayMovements(currentAccount.movements, sorted);
});

btnSwitch.addEventListener('click', function() {
  btnSwitch.classList.contains('movements__switch--movements') ? modifySwitchBtn(1, true) : modifySwitchBtn(0, true);
});

btnFormSwitch.addEventListener('click', function(e) {
  e.preventDefault();

  if(operationTransferState) {
    operationTransferHeading.textContent = 'Transfer money';
    operationTransferFromLabel.textContent = 'Transfer to';
  } else {
    operationTransferHeading.textContent = 'Request money';
    operationTransferFromLabel.textContent = 'Request from';
  }
  transferOperation.classList.toggle('operation--request');
  btnFormSwitch.classList.toggle('form__btn-switch--request');
  operationTransferState = !operationTransferState;
});

// Error event listener
notificationBtnClose.addEventListener('click', function() {
  notificationContainer.classList.add('hidden');
  notificationContainer.classList.remove('pop');
  clearTimeout(hideNotification);
});