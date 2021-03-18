'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Display notifications
let notifications = true;

// Account holder
let currentAccount;

// Error timeout
let hideNotification;

// Is currently transfer or request operation visible
let operationTransferState = false;

// Requests counts for IDs
let requestCount = 0;

// Date and time
const getDate = function(time = false) {
  const now = new Date();
  const day = `${now.getDate()}`.padStart(2, '0');
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const year = now.getFullYear();
  const hour = `${now.getHours()}`.padStart(2, '0');
  const minute = `${now.getMinutes()}`.padStart(2, '0');

  return time ? `${year}-${month}-${day} ${hour}:${minute}` : `${year}-${month}-${day}`;
};

const formatDate = function(date) {
  const daysPassed = Math.floor(Math.abs(new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
  if (Number.isNaN(daysPassed)) return null;
  if (daysPassed === 0) {
    return 'Today';
  } else if (daysPassed === 1) {
    return 'Yesterday';
  } else if (daysPassed <= 7) {
    return 'This week';
  } else {
    return `${daysPassed} days ago`;
  }
};

const formatMoney = function(money) {
  const options = {
    style: 'currency',
    currency: currentAccount.currency,
    useGrouping: false
  }

  return new Intl.NumberFormat(navigator.language, options).format(money);
}

const modal = {
  container: document.querySelector('.modal'),
  heading: document.querySelector('.modal__heading'),
  input: document.querySelector('.modal__input'),
  btn: document.querySelector('.modal__btn'),
  openModal(heading, inputPlaceholder, btnAction) {
    this.heading.textContent = heading;
    this.input.placeholder = inputPlaceholder;

    this.container.classList.remove('hidden');
    this.input.focus();

    this.btn.addEventListener('click', btnAction);
  },
  closeModal() {
    this.container.classList.add('hidden');
  }
}

// Close the message modal by clicking on background
modal.container.addEventListener('click', function(e) {
  if (e.target === modal.container) {
    this.classList.add('hidden');
    clearTransferInputFields();
  }
});

// Data
const transferRequests = [];

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
const btnChangeCurrency = document.getElementById('change-currency-btn');

const transferOperation = document.querySelector('.operation--transfer');

const transferRequestForm = document.getElementById('request-deadline');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
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

const stripTags = function(html) {
  let doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const displayNotification = function(info, type = 'error', ignore) {
  if (notifications || ignore) {
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
};

const createUsernames = function(accs) {
  accs.forEach(function(account) {
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
  if (changeTo === 0) {
    btnSwitch.classList.add('movements__switch--movements');
    btnSwitch.classList.remove('movements__switch--requests');
    btnSwitchLabel.textContent = 'Movements';
  } else if (changeTo === 1) {
    btnSwitch.classList.remove('movements__switch--movements');
    btnSwitch.classList.add('movements__switch--requests');
    btnSwitchLabel.textContent = 'Requests';
  }

  if (runFunction) {
    changeTo === 0 ? displayMovements(currentAccount.movements) : displayTransferRequests(transferRequests);
  }
};

const toggleDescriptions = (type, i) => {
  const details = document.querySelector(`#${type}${i} > .movements__details`);
  const movementDOM = document.querySelector(`#${type}${i}`);
  movementDOM.addEventListener('click', function() {
    if (Number.parseInt(details.style.maxHeight) > 0) {
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
  switch (sort) {
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
          <div class="movements__value movements__value--margin">${formatMoney(value)}</div>
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
            <span class='movements__details-column'>${formatDate(movementDescriptionObject.date) || 'N/A'}</span>
          </div>
        </div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);

    // Display descriptions
    toggleDescriptions('movement', i);
  });
};

const setReactButtons = (request, i) => {

  document.querySelector(`#request${i} .movements__react-button--decline`).addEventListener('click', function() {
    removeRequest(request.id);
    updateUI(1);
  });

  if (document.querySelector(`#request${i} .movements__react-button--accept`)) {
    document.querySelector(`#request${i} .movements__react-button--accept`).addEventListener('click', function() {
      const receiverAcc = accounts.find(acc => acc.owner === request.from);

      if (currentAccount.balance >= request.amount) {
        currentAccount.movements.push(-request.amount);
        receiverAcc.movements.push(request.amount);

        currentAccount.movsDesc.set(currentAccount.movements.length - 1, {
          source: receiverAcc.owner,
          message: `Request #${request.id} from ${request.sent}`,
          date: '12-02-2021'
        });
        receiverAcc.movsDesc.set(receiverAcc.movements.length - 1, {
          source: currentAccount.owner,
          message: `Request #${request.id} from ${request.sent}`,
          date: '12-02-2021'
        });

        removeRequest(request.id);
        displayNotification(`Request accepted. You transfered ${formatMoney(request.amount)} to ${request.from}.`, 'success');
        updateUI(1);
      } else {
        displayNotification(`You don't have enough money. Need ${formatMoney(request.amount - currentAccount.balance)} more.`);
      }
    });
  }
};

const displayReactButtons = type => {
  if (type === 'positive') {
    return `
      <div class='movements-react-button-container'>
         <button type='button' class='movements__react-button movements__react-button--decline'>
          <svg>
            <use xlink:href='sprite.svg#close-cross'></use>
          </svg>
        </button>
      </div>
    `;
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
    `;
  }
};

const removeRequest = id => transferRequests.splice(id, 1);

// This function displays transfer requests with their descriptions in form of movements
const displayTransferRequests = function(req, sort = 0) {
  const isExpiring = date => Math.floor(Math.abs(new Date(date) - new Date()) / (1000 * 60 * 60 * 24)) <= 7;

  containerMovements.innerHTML = '';
  modifySwitchBtn(1);

  let requests = req.filter(request => request.to === currentAccount.owner || request.from === currentAccount.owner);
  switch (sort) {
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
      <div class="movements__row ${isExpiring(request.deadline) ? 'movements__row--important' : ''}" id="request${i}">
        <div class='movements__main'>
          <div class='movements__type movements__type--${type}'>${i + 1} request</div>
          <span class='movements__from'>${type === 'positive' ? 'To: ' : 'From: '}${type === 'positive' ? request.to : request.from}</span>
          ${displayReactButtons(type)}
          <div class='movements__value'>${formatMoney(request.amount)}</div>
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
            <span class='movements__details-column'>${formatDate(request.sent)}</span>
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
};

const calcDisplayBalance = function(acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);

  labelBalance.textContent = `${formatMoney(currentAccount.balance)}`;

  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };

  labelDate.textContent = new Intl.DateTimeFormat(navigator.language, options).format(new Date());
};

const calcDisplaySummary = function(account) {
  const incomes = account.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatMoney(incomes)}`;

  const outcomes = account.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatMoney(Math.abs(outcomes))}`;

  const interest = account.movements.filter(mov => mov > 0).map(mov => mov * account.interestRate / 100).reduce((acc, int) => int >= 1 ? acc + int : acc, 0);
  labelSumInterest.textContent = `${formatMoney(interest)}`;
};

const updateUI = function(source) {
  // Source === 0 - display movements. Switch === 1 - display transfer requests

  // Display account's movements
  source ? displayTransferRequests(transferRequests) : displayMovements(currentAccount.movements, currentAccount.movsDesc);

  // Calculate and display balance
  calcDisplayBalance(currentAccount);

  // Calculate and display summary
  calcDisplaySummary(currentAccount);
};

// Event handlers
btnLogin.addEventListener('click', function(e) {
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display the UI and welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}!`;
    containerApp.style.opacity = '1';
    containerApp.style.visibility = 'visible';

    // Display movements and stuff
    updateUI(0);

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
  const message = stripTags(modal.input.value);
  const deadline = inputRequestDeadline.value;
  return [receiverAcc, amount, message, deadline];
};

const clearTransferInputFields = () => inputTransferTo.value = inputTransferAmount.value = modal.input.value = '';

btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();

  const [receiverAcc, amount] = getFormInputTransfer();

  const openMessagePopup = () => {
    modal.openModal('Enter a message', '', transferMessage);
  }

  // Get the context, if it's a transfer or a request
  const context = operationTransferState ? ['request', 'from'] : ['transfer', 'to'];

  if (receiverAcc?.username && receiverAcc.username !== currentAccount.username && amount > 0 && currentAccount.balance >= amount) {
    operationTransferState ? transferRequestForm.style.display = 'block' : transferRequestForm.style.display = 'none';
    openMessagePopup();
  } else if (!receiverAcc) {
    displayNotification('The receiver account does not exist.');
  } else if (receiverAcc.username === currentAccount.username) {
    displayNotification(`You cannot ${context[0]} money ${context[1]} yourself.`);
  } else if (amount <= 0) {
    displayNotification(`You have to ${context[0]} at least 1€.`);
  } else if (currentAccount.balance < amount) {
    if (operationTransferState) {
      openMessagePopup();
    } else {
      displayNotification(`You don't have enough money. Need ${formatMoney(amount - currentAccount.balance)} more.`);
    }
  }
});

const transferMessage = function() {
  const [receiverAcc, amount, message, deadline] = getFormInputTransfer();

  if (message.length <= 25) {
    if (operationTransferState) {
      transferRequests.push({
        to: receiverAcc.owner,
        from: currentAccount.owner,
        amount,
        message,
        sent: `${getDate()}`,
        deadline,
        id: requestCount++
      });
      displayNotification(`You successfuly requested ${formatMoney(amount)} from ${receiverAcc.owner}!`, 'success');
    } else {
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);

      currentAccount.movsDesc.set(currentAccount.movements.length - 1, {
        source: receiverAcc.owner,
        message,
        date: getDate()
      });
      receiverAcc.movsDesc.set(receiverAcc.movements.length - 1, {
        source: currentAccount.owner,
        message,
        date: getDate()
      });
      displayNotification(`You successfuly transfered ${formatMoney(amount)} to ${receiverAcc.owner}!`, 'success');
    }
  } else if (message.length > 25) {
    displayNotification('Your message cannot be longer than 25 characters!');
  }

  modal.closeModal();
  clearTransferInputFields();
  modifySwitchBtn(0);
  updateUI(operationTransferState ? 1 : 0);
  modal.btn.removeEventListener('click', transferMessage);
};

btnLoan.addEventListener('click', function(e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);

    currentAccount.movsDesc.set(currentAccount.movements.length - 1, { source: 'Bank', date: getDate() });

    updateUI(0);
    modifySwitchBtn(0);
    inputLoanAmount.value = '';

    displayNotification(`Your request for ${formatMoney(amount)} loan has been approved!`, 'success');
  } else if (amount <= 0) {
    displayNotification('Requested amount must be at least 1€!');
  } else {
    displayNotification(`The maximum loan you can take is ${formatMoney(currentAccount.movements.reduce((acc, mov) => mov > acc ? acc = mov : acc, 0) * 10)}!`);
  }
});

btnClose.addEventListener('click', function(e) {
  e.preventDefault();

  if (inputCloseUsername.value === currentAccount.username && +(inputClosePin.value) === currentAccount.pin) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);

    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = '0';
    containerApp.style.visibility = 'hidden';

    // Clear the fields
    inputCloseUsername.value = inputClosePin.value = '';

    displayNotification(`Your account, ${currentAccount.owner} has been successfuly deleted!`, 'success');
  } else if (inputCloseUsername.value !== currentAccount.username) {
    displayNotification('Wrong account username!');
  } else if (+inputClosePin.value !== currentAccount.pin) {
    displayNotification('Wrong PIN!');
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

  if (operationTransferState) {
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