'use strict';

const transferRequests = [];

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2,
  pin: 1111,
  movsDesc: new Map([[0, {date: new Date(2018, 2, 21).toISOString()}], [1, {date: new Date(2019, 0, 29).toISOString()}], [2, {date: new Date(2019, 11, 27).toISOString()}], [3, {date: new Date(2020, 6, 27).toISOString()}], [4, {date: new Date(2021, 1, 1).toISOString()}], [5, {date: new Date(2021, 1, 3).toISOString()}], [6, {date: new Date(2021, 2, 11).toISOString()}], [7, {date: new Date(2021, 3, 14).toISOString()}]]),
  currency: 'EUR'
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movsDesc: new Map([[0, {date: new Date(2016, 10, 11).toISOString()}], [1, {date: new Date(2017, 7, 20).toISOString()}], [2, {date: new Date(2021, 1, 18).toISOString()}], [3, {date: new Date(2021, 1, 19).toISOString()}], [4, {date: new Date(2021, 1, 27).toISOString()}], [5, {date: new Date(2021, 2, 11).toISOString()}], [6, {date: new Date(2021, 2, 11).toISOString()}], [7, {date: new Date(2021, 2, 21).toISOString()}], [8, {date: new Date(2021, 2, 22).toISOString()}]]),
  currency: 'EUR'
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  movsDesc: new Map([[0, {date: new Date(2019, 10, 13).toISOString()}], [1, {date: new Date(2019, 11, 31).toISOString()}], [2, {date: new Date(2020, 2, 5).toISOString()}], [3, {date: new Date(2020, 4, 15).toISOString()}], [4, {date: new Date(2020, 7, 29).toISOString()}], [5, {date: new Date(2021, 1, 2).toISOString()}], [6, {date: new Date(2021, 2, 18).toISOString()}], [7, {date: new Date(2021, 2, 22).toISOString()}]]),
  currency: 'EUR'
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  movsDesc: new Map([[0, {date: new Date(2016, 10, 11).toISOString()}], [1, {date: new Date(2020, 5, 15).toISOString()}], [2, {date: new Date(2020, 5, 17).toISOString()}], [3, {date: new Date(2020, 11, 28).toISOString()}], [4, {date: new Date(2021, 2, 28).toISOString()}]]),
  currency: 'EUR'
};

const accounts = [account1, account2, account3, account4];