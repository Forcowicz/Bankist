'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Mutation observer
const observer = new MutationObserver(mutation => {
  if(mutation[0].target !== labelTimer) startLogOutTimer();
});

observer.observe(document.body, {
  subtree: true,
  childList: true,
  attributes: true
});

// Display notifications
let alerts = true;

// Account holder
let currentAccount;

// Timer
let timer;

// Error timeout
let hideAlert;

// Is currently transfer or request operation visible
let operationTransferState = false;

// Requests counts  for IDs
let requestCount = 0;

// Log out timer

const startLogOutTimer = function() {
  if(timer) {
    clearInterval(timer);
  }

  let time = 10 * 60 * 1000 / 1000;

  const tick = function() {
    const minutes = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const seconds = `${Math.trunc(time % 60)}`.padStart(2, 0);
    labelTimer.textContent = `${minutes}:${seconds}`;

    if (time === 0) {
      clearInterval(setInterval(tick, 1000));
      logOut();
    }

    time--;
  };

  tick();
  timer = setInterval(tick, 1000);
};

// END OF Log out timer

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

// END OF Date and time

// Modal

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
    clearUserInputFields();
  }
});

// END OF Modal

// Alerts

const displayAlert = function(info, type = 'error', ignore) {
  if (alerts || ignore) {
    clearTimeout(hideAlert);

    // Check the notification character
    if (type === 'error') {
      alert.classList.add('alert--error');
      alert.classList.remove('alert--success');
    } else {
      alert.classList.add('alert--success');
      alert.classList.remove('alert--error');
    }

    alert.classList.add('animation-pop');
    alert.classList.remove('hidden');
    labelAlert.textContent = info;

    hideAlert = setTimeout(function() {
      if (!alert.classList.contains('hidden')) {
        alert.classList.add('hidden');
        alert.classList.remove('animation-pop');
      }
    }, 7000);
  }
};

btnSwitchAlerts.addEventListener('click', function() {
  this.classList.toggle('alert-switch__btn--active');
  displayAlert(`Alerts turned ${alerts ? 'OFF' : 'ON'}.`, 'success', true);
  alerts = !alerts;
});

// END OF Alerts

// Others

const stripTags = function(html) {
  let doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const logOut = function() {
  labelWelcome.textContent = 'Log in to get started';
  containerApp.style.visibility = 'hidden';
  containerApp.style.opacity = '0';
}

// END OF Others

// MAIN APP

// Create usernames for accounts
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

// ACTIONS

// Changes appearance of the movements' switch button
const modifyBtnSwitchActions = function(changeTo, runFunction = false) {
  // 0: Change to movements, 1: Change to requests, Other: Don't change
  if (changeTo === 0) {
    btnSwitchActions.classList.add('actions__switch--movements');
    btnSwitchActions.classList.remove('actions__switch--requests');
    btnSwitchActionsLabel.textContent = 'Movements';
    btnSwitchActions_CountLabel.textContent = currentAccount.movements.length;
    btnSwitchActions_CountContainer.classList.add('actions__switch-count--positive');
    btnSwitchActions_CountContainer.classList.remove('actions__switch-count--negative');
  } else if (changeTo === 1) {
    btnSwitchActions.classList.remove('actions__switch--movements');
    btnSwitchActions.classList.add('actions__switch--requests');
    btnSwitchActionsLabel.textContent = 'Requests';
    btnSwitchActions_CountLabel.textContent = transferRequests.filter(req => req.from === currentAccount.owner || req.to === currentAccount.owner).length;
    btnSwitchActions_CountContainer.classList.add('actions__switch-count--negative');
    btnSwitchActions_CountContainer.classList.remove('actions__switch-count--positive');
  }

  // If the runFunction argument is 1, it will call the displayTransferRequests function
  if (runFunction) {
    changeTo === 0 ? displayMovements(currentAccount.movements) : displayTransferRequests(transferRequests);
  }
};

// Add descriptions to actions
const addDescriptions = (type, i) => {
  const details = document.querySelector(`#${type}${i} > .actions__details`);
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
  modifyBtnSwitchActions(0);

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
      <div class='actions__row' id='movement${i}'>
        <div class='actions__overview'>
          <div class='actions__type actions__type--${type}'>${i + 1} ${type === 'positive' ? 'deposit' : 'withdrawal'}</div>
          <div class='actions__value actions__value--margin'>${formatMoney(value)}</div>
        </div>
        <div class='actions__details'>
          <div class='actions__details-row'>
            <span class='actions__details-column'>${value > 0 ? 'From:' : 'To'}</span>
            <span class='actions__details-column'>${movementDescriptionObject.source || 'N/A'}</span>
          </div>
          <div class='actions__details-row'>
            <span class='actions__details-column'>Message:</span>
            <span class='actions__details-column'>${movementDescriptionObject.message || 'N/A'}</span>
          </div>
          <div class='actions__details-row'>
            <span class='actions__details-column'>Sent:</span>
            <span class='actions__details-column'>${formatDate(movementDescriptionObject.date) || 'N/A'}</span>
          </div>
        </div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);

    // Display descriptions
    addDescriptions('movement', i);
  });
};

// Set behavior of the react buttons for requests
const setReactButtons = (request, i) => {

  document.querySelector(`#request${i} .actions__react-button--decline`).addEventListener('click', function() {
    removeRequest(request.id);
    updateUI(1);
  });

  if (document.querySelector(`#request${i} .actions__react-button--accept`)) {
    document.querySelector(`#request${i} .actions__react-button--accept`).addEventListener('click', function() {
      const receiverAcc = accounts.find(acc => acc.owner === request.from);

      if (currentAccount.balance >= request.amount) {
        currentAccount.movements.push(-request.amount);
        receiverAcc.movements.push(request.amount);

        currentAccount.movsDesc.set(currentAccount.movements.length - 1, {
          source: receiverAcc.owner,
          message: `Request #${request.id} from ${request.sent}`,
          date: getDate(true)
        });
        receiverAcc.movsDesc.set(receiverAcc.movements.length - 1, {
          source: currentAccount.owner,
          message: `Request #${request.id} from ${request.sent}`,
          date: getDate(true)
        });

        removeRequest(request.id);
        displayAlert(`Request accepted. You transfered ${formatMoney(request.amount)} to ${request.from}.`, 'success');
        updateUI(1);
      } else {
        displayAlert(`You don't have enough money. Need ${formatMoney(request.amount - currentAccount.balance)} more.`);
      }
    });
  }
};

// Create react buttons for requests
const displayReactButtons = type => {
  if (type === 'positive') {
    return `
      <div class='movements-react-button-container'>
         <button type='button' class='actions__react-button actions__react-button--decline'>
          <svg>
            <use xlink:href='sprite.svg#close-cross'></use>
          </svg>
        </button>
      </div>
    `;
  } else {
    return `
      <div class='movements-react-button-container'>
         <button type='button' class='actions__react-button actions__react-button--accept'>
          <svg>
            <use xlink:href='sprite.svg#check-mark'></use>
          </svg>
         </button>
         <button type='button' class='actions__react-button actions__react-button--decline'>
          <svg>
            <use xlink:href='sprite.svg#close-cross'></use>
          </svg>
        </button>
      </div>
    `;
  }
};

// Remove a request
const removeRequest = id => transferRequests.splice(id, 1);

// Display transfer requests with their descriptions
const displayTransferRequests = function(req, sort = 0) {
  const isExpiring = date => Math.floor(Math.abs(new Date(date) - new Date()) / (1000 * 60 * 60 * 24)) <= 7;

  containerMovements.innerHTML = '';
  modifyBtnSwitchActions(1);

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
      <div class='actions__row ${isExpiring(request.deadline) ? 'actions__row--important' : ''}' id='request${i}'>
        <div class='actions__overview'>
          <div class='actions__type actions__type--${type}'>${i + 1} request</div>
          <span class='actions__from'>${type === 'positive' ? 'To: ' : 'From: '}${type === 'positive' ? request.to : request.from}</span>
          ${displayReactButtons(type)}
          <div class='actions__value'>${formatMoney(request.amount)}</div>
        </div>
        <div class='actions__details'>
          <div class='actions__details-row'>
          <span class='actions__details-column'>${source}:</span>
          <span class='actions__details-column'>${request[source] || 'N/A'}</span>
          </div>
          <div class='actions__details-row'>
            <span class='actions__details-column'>Message:</span>
            <span class='actions__details-column'>${request.message || 'N/A'}</span>
          </div>
          <div class='actions__details-row'>
            <span class='actions__details-column'>Sent:</span>
            <span class='actions__details-column'>${formatDate(request.sent)}</span>
          </div>
          <div class='actions__details-row'>
            <span class='actions__details-column'>Valid until:</span>
            <span class='actions__details-column'>${request.deadline || 'Forever'}</span>
          </div>
      </div>
     </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);

    // Display descriptions
    addDescriptions('request', i);

    // Set behavior of the react buttons
    setReactButtons(request, i);
  });
};

// Calculate and display the account's balance
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

// Calculate and display the summary
const calcDisplaySummary = function(account) {
  const incomes = account.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatMoney(incomes)}`;

  const outcomes = account.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatMoney(Math.abs(outcomes))}`;

  const interest = account.movements.filter(mov => mov > 0).map(mov => mov * account.interestRate / 100).reduce((acc, int) => int >= 1 ? acc + int : acc, 0);
  labelSumInterest.textContent = `${formatMoney(interest)}`;
};

// Update the user interface
const updateUI = function(source) {
  // Source === 0 - display movements. Switch === 1 - display transfer requests

  // Display account's movements
  source ? displayTransferRequests(transferRequests) : displayMovements(currentAccount.movements, currentAccount.movsDesc);

  // Calculate and display balance
  calcDisplayBalance(currentAccount);

  // Calculate and display summary
  calcDisplaySummary(currentAccount);
};

// END OF ACTIONS

// OPERATIONS

// Log in to the account
btnLogin.addEventListener('click', function(e) {
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display the UI and welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}!`;
    containerApp.style.opacity = '1';
    containerApp.style.visibility = 'visible';

    startLogOutTimer();

    // Display movements and stuff
    updateUI(0);

    // Clear the form
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();

    displayAlert(`Welcome, ${currentAccount.owner}!`, 'success');
  } else {
    displayAlert('Wrong credentials!');
  }
});

// Get data from the transfer's input fields
const getUserInputForTransfer = function() {
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  const amount = +inputTransferAmount.value;
  const message = stripTags(modal.input.value);
  const deadline = inputRequestDeadline.value;
  return [receiverAcc, amount, message, deadline];
};

const clearUserInputFields = () => inputTransferTo.value = inputTransferAmount.value = modal.input.value = '';

// First stage of transfering/requesting money - receiver and amount
btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();

  const [receiverAcc, amount] = getUserInputForTransfer();

  // Open and set the modal
  const openMessagePopup = () => {
    if(operationTransferState) transferRequestForm.style.display = 'block';
    modal.openModal('Enter a message', '', transferMoneyStageTwo);
  }

  // Get the context, if it's a transfer or a request
  const context = operationTransferState ? ['request', 'from'] : ['transfer', 'to'];

  // Formal validation
  if (receiverAcc?.username && receiverAcc.username !== currentAccount.username && amount > 0 && currentAccount.balance >= amount) {
    openMessagePopup();
  } else if (!receiverAcc) {
    displayAlert('The receiver account does not exist.');
  } else if (receiverAcc.username === currentAccount.username) {
    displayAlert(`You cannot ${context[0]} money ${context[1]} yourself.`);
  } else if (amount <= 0) {
    displayAlert(`You have to ${context[0]} at least 1€.`);
  } else if (currentAccount.balance < amount) {
    if (operationTransferState) {
      openMessagePopup();
    } else {
      displayAlert(`You don't have enough money. Need ${formatMoney(amount - currentAccount.balance)} more.`);
    }
  }
});

const transferMoneyStageTwo = function() {
  // Get user's input
  const [receiverAcc, amount, message, deadline] = getUserInputForTransfer();

  if (message.length <= 25) {
    // If it's a request, push a request object to the transferRequests array
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
      displayAlert(`You successfuly requested ${formatMoney(amount)} from ${receiverAcc.owner}!`, 'success');
    } else {
      // If it's a transfer, add movements and description to the current and receiver accounts
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
      displayAlert(`You successfuly transfered ${formatMoney(amount)} to ${receiverAcc.owner}!`, 'success');
    }
  } else if (message.length > 25) {
    displayAlert('Your message cannot be longer than 25 characters!');
  }

  // Close modal and hide the deadline form
  modal.closeModal();
  transferRequestForm.style.display = 'none';
  clearUserInputFields();
  modifyBtnSwitchActions(0);
  updateUI(operationTransferState ? 1 : 0);
  modal.btn.removeEventListener('click', transferMoneyStageTwo);
};

// Get loan
btnLoan.addEventListener('click', function(e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      currentAccount.movements.push(amount);

      currentAccount.movsDesc.set(currentAccount.movements.length - 1, { source: 'Bank', date: getDate() });

      updateUI(0);
      modifyBtnSwitchActions(0);
      inputLoanAmount.value = '';

      displayAlert(`Your request for ${formatMoney(amount)} loan has been approved!`, 'success');
    }, 4000);
  } else if (amount <= 0) {
    displayAlert('Requested amount must be at least 1€!');
  } else {
    displayAlert(`The maximum loan you can take is ${formatMoney(currentAccount.movements.reduce((acc, mov) => mov > acc ? acc = mov : acc, 0) * 10)}!`);
  }
});

// Close the account
btnClose.addEventListener('click', function(e) {
  e.preventDefault();

  if (inputCloseUsername.value === currentAccount.username && +(inputClosePin.value) === currentAccount.pin) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);

    accounts.splice(index, 1);

    // Hide UI
    logOut();

    // Clear the fields
    inputCloseUsername.value = inputClosePin.value = '';

    displayAlert(`Your account, ${currentAccount.owner} has been successfuly deleted!`, 'success');
  } else if (inputCloseUsername.value !== currentAccount.username) {
    displayAlert('Wrong account username!');
  } else if (+inputClosePin.value !== currentAccount.pin) {
    displayAlert('Wrong PIN!');
  }
});

// Sorting controller
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
  btnSwitchActions.classList.contains('movements__switch--requests') ? displayTransferRequests(transferRequests, sorted) : displayMovements(currentAccount.movements, sorted);
});

// Actions' switch event listener
btnSwitchActions.addEventListener('click', function() {
  btnSwitchActions.classList.contains('actions__switch--movements') ? modifyBtnSwitchActions(1, true) : modifyBtnSwitchActions(0, true);
});

// Switch between money transfer and request
btnTransferSwitch.addEventListener('click', function(e) {
  e.preventDefault();

  if (operationTransferState) {
    operationTransferHeadingLabel.textContent = 'Transfer money';
    operationTransferFromLabel.textContent = 'Transfer to';
  } else {
    operationTransferHeadingLabel.textContent = 'Request money';
    operationTransferFromLabel.textContent = 'Request from';
  }
  operationTransfer.classList.toggle('operation--request');
  btnTransferSwitch.classList.toggle('operation__form-btn-switch--request');
  operationTransferState = !operationTransferState;
});

// Alert event listener
btnCloseAlert.addEventListener('click', function() {
  alert.classList.add('hidden');
  alert.classList.remove('animation-pop');
  clearTimeout(hideAlert);
});

// Authors modal
btnAuthors.addEventListener('click', function() {
  authorsContainer.classList.remove('hidden');
});

authorsContainer.addEventListener('click', function(e) {
  if(e.target === authorsContainer) authorsContainer.classList.add('hidden');
});