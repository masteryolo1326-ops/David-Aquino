
export enum Page {
  Landing = 'LANDING',
  SignUp = 'SIGNUP',
  Login = 'LOGIN',
  Voting = 'VOTING',
  VotingTicket = 'VOTING_TICKET',
}

export interface Slate {
  id: number;
  name: string;
  president: string;
  vicePresident: string;
  imageUrl: string;
}

export interface Language {
  code: string;
  name: string;
}