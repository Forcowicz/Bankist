'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}]]),
  currency: 'EUR'
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}], [8, {}]]),
  currency: 'EUR'
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}]]),
  currency: 'EUR'
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}]]),
  currency: 'EUR'
};

const account5 = {
  owner: 'Sławomir Węglarz',
  movements: [1300, -2000, 3900, 15020, 2],
  interestRate: 1,
  pin: 5555,
  movsDesc: new Map([[0, {}], [1, {}], [2, { date: new Date('2021-03-07').toISOString() }], [3, { date: new Date('2021-03-16').toISOString() }], [4, { date: new Date('2021-03-16').toISOString() }]]),
  currency: 'EUR'
};

const account6 = {
  owner: 'Michał Wojtusiak',
  movements: [300, -500, 100, 1, 20, -15, -300, 1337],
  interestRate: 1,
  pin: 5555,
  movsDesc: new Map([[0, {}], [1, {}], [2, {}], [3, {}], [4, {}], [5, {}], [6, {}], [7, {}]]),
  currency: 'EUR'
};

const accounts = [account1, account2, account3, account4, account5, account6];