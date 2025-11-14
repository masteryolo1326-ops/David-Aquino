import React from 'react';
import type { Language, Slate } from './types.ts';

export const LANGUAGES: Language[] = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'jp', name: '日本語' },
];

export const SLATES_DATA: Slate[] = [
  {
    id: 1,
    name: 'Innovate & Elevate',
    president: 'Alex Johnson',
    vicePresident: 'Maria Garcia',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=480&h=320&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Future Forward',
    president: 'James Smith',
    vicePresident: 'Priya Patel',
    imageUrl: 'https://images.unsplash.com/photo-1528795259121-4a8397b9c127?q=80&w=480&h=320&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Unity & Progress',
    president: 'Chloe Williams',
    vicePresident: 'Kenji Tanaka',
    imageUrl: 'https://images.unsplash.com/photo-1579965342575-154a4a4f88cb?q=80&w=480&h=320&auto=format&fit=crop',
  },
    {
    id: 4,
    name: 'Visionary Leaders',
    president: 'David Chen',
    vicePresident: 'Sophia Rodriguez',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d387a17f67?q=80&w=480&h=320&auto=format&fit=crop',
  },
];

// Icon Components
export const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 3A1.5 1.5 0 0 0 3 4.5v15A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5V4.5A1.5 1.5 0 0 0 19.5 3h-15ZM8 9.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H8.75A.75.75 0 0 1 8 9.75Z" clipRule="evenodd" />
    </svg>
);

export const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
        <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.69-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.06 1.06l8.69-8.69Z" />
        <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 1-.75-.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
    </svg>
);
export const UserPlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
        <path d="M6.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM3.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM19.75 7.5a.75.75 0 0 0-1.5 0v2.25H16a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H22a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
    </svg>
);
export const LoginIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
        <path d="M15.75 8.25a.75.75 0 0 1 .75.75V15a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Z" />
        <path d="M4.5 3.75A1.75 1.75 0 0 0 2.75 5.5v13A1.75 1.75 0 0 0 4.5 20.25h8.375a.75.75 0 0 1 0-1.5H4.5a.25.25 0 0 1-.25-.25V5.5a.25.25 0 0 1 .25-.25h8.375a.75.75 0 0 1 0-1.5H4.5Z" />
        <path fillRule="evenodd" d="M19.03 11.47a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H11.25a.75.75 0 0 1 0-1.5h5.44l-3.22-3.22a.75.75 0 0 1 1.06-1.06l4.5 4.5Z" clipRule="evenodd" />
    </svg>
);
export const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
        <path d="M8.25 8.25a.75.75 0 0 0-1.5 0V15a.75.75 0 0 0 1.5 0V8.25Z" />
        <path d="M19.5 3.75A1.75 1.75 0 0 1 21.25 5.5v13a1.75 1.75 0 0 1-1.75 1.75h-8.375a.75.75 0 0 0 0 1.5h8.375A3.25 3.25 0 0 0 22.75 18.5v-13A3.25 3.25 0 0 0 19.5 2.25h-8.375a.75.75 0 0 0 0 1.5H19.5Z" />
        <path fillRule="evenodd" d="M4.97 11.47a.75.75 0 0 0 0 1.06l4.5 4.5a.75.75 0 0 0 1.06-1.06L7.31 12.75H12.75a.75.75 0 0 0 0-1.5H7.31l3.22-3.22a.75.75 0 0 0-1.06-1.06l-4.5 4.5Z" clipRule="evenodd" />
    </svg>
);
export const VoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
      <path fillRule="evenodd" d="M4.5 3.001a.75.75 0 0 0-1.06 1.06L7.25 7.872l-3.32 3.32a.75.75 0 1 0 1.06 1.06l3.32-3.32 1.47 1.47a.75.75 0 1 0 1.06-1.06l-1.47-1.47 3.32-3.32a.75.75 0 1 0-1.06-1.06L8.31 6.812 4.5 3.001ZM15 3.751a2.25 2.25 0 0 0-2.25 2.25v12a2.25 2.25 0 0 0 2.25 2.25h6a2.25 2.25 0 0 0 2.25-2.25v-12a2.25 2.25 0 0 0-2.25-2.25h-6Z" clipRule="evenodd" />
    </svg>
);
export const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.101a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.682 18.682 0 0 1 12 22.5a18.682 18.682 0 0 1-7.812-1.704.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
);
export const TicketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
        <path fillRule="evenodd" d="M1.5 6.75A2.25 2.25 0 0 1 3.75 4.5h16.5a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 20.25 19.5H3.75A2.25 2.25 0 0 1 1.5 17.25V6.75Zm6.063 4.063a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z" clipRule="evenodd" />
    </svg>
);
export const LanguageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M12.75 15.667h.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h.75ZM15 15.667h.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h.75ZM12 3C7.031 3 3 7.031 3 12s4.031 9 9 9 9-4.031 9-9-4.031-9-9-9ZM7.568 17.086a7.5 7.5 0 0 1 0-10.172l.636.636a6 6 0 0 0 0 8.9l-.636.636ZM9.404 18.15a7.514 7.514 0 0 1-1.202-1.202l.636-.636a6.01 6.01 0 0 0 .96.96l-.394.394v-.016Zm3.178.256c-.318 0-.63.02-1.002.046a.75.75 0 0 0-.585 1.075 7.478 7.478 0 0 1 4.545-4.545.75.75 0 0 0-1.075-.585 6.011 6.011 0 0 0-1.883 4.01ZM16.32 17.69a7.514 7.514 0 0 1-1.202 1.202l-.636-.636a6.01 6.01 0 0 0 .96-.96l.394.394-.016.004Zm1.258-2.092a6.027 6.027 0 0 0-4.01-1.883.75.75 0 0 0-.585 1.075 7.478 7.478 0 0 1 4.545-4.545.75.75 0 0 0-1.075-.585A7.5 7.5 0 0 1 8.309 8.31l.636-.636a6 6 0 0 0 8.9 0l.636.636a7.5 7.5 0 0 1-1.202 10.172l-.636-.636a6 6 0 0 0 0-8.9l-.394-.394Z" />
    </svg>
);
export const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-16 h-16" fill="currentColor">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.105 3.105-1.591-1.59a.75.75 0 0 0-1.06 1.061l2.121 2.12a.75.75 0 0 0 1.06 0l3.636-3.638Z" clipRule="evenodd" />
    </svg>
);
export const FormUserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 9a7 7 0 1 1 14 0H3Z" clipRule="evenodd" />
    </svg>
);
export const EnvelopeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
);
export const LockClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
);
export const UserCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
    </svg>
);
export const LandingSecureIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-blue-400" fill="currentColor">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
    </svg>
);
export const LandingModernIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-blue-400" fill="currentColor">
        <path fillRule="evenodd" d="M6.75 1.5A2.25 2.25 0 0 0 4.5 3.75v16.5A2.25 2.25 0 0 0 6.75 22.5h10.5A2.25 2.25 0 0 0 19.5 20.25V3.75A2.25 2.25 0 0 0 17.25 1.5H6.75ZM8.25 4.5a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H8.25a.75.75 0 0 1-.75-.75V5.25a.75.75 0 0 1 .75-.75h.008ZM10.5 4.5a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75V5.25a.75.75 0 0 1 .75-.75h.008ZM12.75 4.5a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75V5.25a.75.75 0 0 1 .75-.75h.008ZM8.25 18a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H8.25a.75.75 0 0 1-.75-.75v-.008a.75.75 0 0 1 .75-.75h.008ZM10.5 18a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008a.75.75 0 0 1 .75-.75h.008ZM12.75 18a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008a.75.75 0 0 1 .75-.75h.008ZM15 18a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008a.75.75 0 0 1 .75-.75h.008Z" clipRule="evenodd" />
    </svg>
);
export const LandingMultiLingualIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-blue-400" fill="currentColor">
        <path fillRule="evenodd" d="M11.91 1.74a.75.75 0 0 1 .75.75v.512c1.334.09 2.58.53 3.666 1.256a.75.75 0 0 1-.74 1.282A13.43 13.43 0 0 0 12 5.176a13.43 13.43 0 0 0-3.585.364.75.75 0 0 1-.74-1.282A14.93 14.93 0 0 1 11.25 3.002V2.49a.75.75 0 0 1 .66-.75Zm1.165 17.525a.75.75 0 0 1-1.013.823 14.93 14.93 0 0 1-2.905-.634.75.75 0 0 1 .613-1.353 13.43 13.43 0 0 0 2.585.57.75.75 0 0 1 .72.594ZM12 22.5a10.5 10.5 0 1 0 0-21 10.5 10.5 0 0 0 0 21Zm-3.111-5.326a.75.75 0 0 1 .425-1.343 13.52 13.52 0 0 0 5.372 0 .75.75 0 0 1 .425 1.343 15.02 15.02 0 0 1-6.222 0Z" clipRule="evenodd" />
    </svg>
);
export const ShieldCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-5 h-5 mr-1" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
);
export const DocumentArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-5 h-5 mr-2" fill="currentColor">
        <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
        <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
);