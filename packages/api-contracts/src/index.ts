import { initContract } from '@ts-rest/core';
import { chatContract } from './chat-contract.js';

const c = initContract();

export const contract = c.router({
  chat: chatContract,
});
