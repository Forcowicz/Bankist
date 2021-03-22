# 

## Bankist App

The Bankist App is a simple application, which simulates online banking.

It allows users to:

*   Transfer money
*   Request money
*   Request a loan
*   Manage movements and requests
*   Close an account
*   Sorting actions

#### Accounts

> Username: js, PIN: 1111<br>
> Username: jd, PIN: 2222<br>
> Username: stw, PIN: 3333<br>
> Username: ss, PIN: 4444

### Log In / Accounts

Each account is a standalone object. Each of these objects contain some important data, such as:

*   Account's owner
*   movements array
*   PIN
*   movsDesc map
*   Interest rate

To log in to the account an username and a PIN are required. Usernames are generated automatically on the page load. A username is created **from the first letter of a first name and the first letter of the last name**.

An example username: js

### Movements

Movements are stored in the movements array on each account object. They are displayed in the actions container. Each movement has a **description object** associated with it.

This object contains:

*   Who sent the money
*   A message from the sender
*   A date when the transfer was sent

Descriptions are stored in a Map, where **each key is the movement's index**, and a value associated with it is the actual object. When movements are sorted, their old index is saved so finding the right object is possible.

### Requests

Requests work similarly to movements with a couple of differences. First, requests are stored in the global array of objects called transferRequests. I wanted a different approach than with the movements.

Each object contains:

*   Who is the sender
*   Who is the receiver
*   Amount of money requested
*   Message from the sender
*   Date when the request was sent
*   Deadline of the request (nothing really happens after this time)
*   Unique ID

Requests, same as movements are only displayed in accounts with which they are associated.

**The sender can cancel the request, while the receiver can either accept or decline it.**

Movements and requests are called **actions**. That's why all the DOM elements associated with them are called _actions_.

### Sorting Actions

That part was a bit tricky. At the bottom part of the code, there is a function that controls the sorting order. The sorting takes place in the function which displays movements or requests.

Since each request is a standalone object, it doesn't require any special linking to some other data. Although, it's not the case for the movements. Each element in the movements array is just a value. And every value has an object linked to it. The object is found based on the movement's index. Since while sorting the indexes can change, the old, original index needs to be persisted.

The original index is later used to find a proper description object for a movement.

### Switch Actions Button

The huge button above the action's container displays a current amount of movements/requests and by clicking it the user can switch between displaying movements and requests.

Programming this button was a bit problematic, so to say, that's why the entire function for changing its appearance is created.

### Log Out Timer

The timer in the right bottom corner indicates the time left before the logout. There is a MutationObserver instance in the code that watches all the changes in the entire document. With each change **which isn't the timer ticking**, it is reset back to **10 minutes**.

### Internationalization

The date and time below the _Current balance_ label are formatted using the **Internationalization**. Same with **all the currencies in the app**. Also, each action description has a fancy label that displays how much time has passed since the date when it was sent, for example, _This week_ or _Yesterday_. The locale is based on the **user browser's language**.

### Summary

Below the actions' container is a _Summary_. It displays **incomes, outcomes, and interest**. The virtual bank pays its clients for each deposit on their account. The payment is equal according to their **interest rate**, which is stored in the account's object.

An example interest rate is 1.1, which is 1.1% of the deposit

### Alerts

Alert is displayed each time when the user performs an action. For example transferring money, taking a loan, or logging in.

There are two types of alerts - the success alert and the error alert.

Alert's appearance and the message are changed based on a performed action.

Alerts can be turned on and off by clicking the switch in the bottom left corner.

### Changing Currency

Users can change a currency on their accounts. Although, it's just a change of style since all the currencies have the same exchange rate.

To change a currency user needs a valid currency code. Each one existing is accepted. Also, the input's placeholder is based on the current currency settings.

### Closing Account

The user can close its accounts at any time. All it takes is to enter the username and the valid PIN for the account.

### Authors Modal

By clicking the _Information_ icon in the bottom left corner user can view the authors of the project and the icon authors.

**The website is not fully responsive**.

_This project is partly based on Jonas Schmedtmann's JavaScript course available on Udemy_.
