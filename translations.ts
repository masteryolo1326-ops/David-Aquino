export const translations = {
  en: {
    // General
    login: 'Login',
    signUp: 'Sign Up',
    logout: 'Logout',
    emailPlaceholder: 'Email Address',
    passwordPlaceholder: 'Password',

    // Left Sidebar
    votingSys: 'VotingSys',
    vote: 'Vote',
    profile: 'Profile',
    home: 'Home',
    votingTicket: 'Voting Ticket',

    // Right Sidebar
    language: 'LANGUAGE',

    // Landing Page
    shapeTomorrow: 'Shape Tomorrow.',
    voteToday: 'Vote Today.',
    landingSubtext: 'Your voice matters. Participate in the student elections and choose the leaders who will represent you.',
    getStarted: 'Get Started',
    featureSecureTitle: 'Secure & Private',
    featureSecureText: 'Your vote is anonymous and protected with the latest security standards.',
    featureModernTitle: 'Modern Interface',
    featureModernText: 'Enjoy a seamless and intuitive voting experience on any device.',
    featureMultiTitle: 'Multilingual',
    featureMultiText: 'Cast your vote in the language you are most comfortable with.',

    // Sign Up Page
    createAccount: 'Create Account',
    fullNamePlaceholder: 'Full Name',
    confirmPasswordPlaceholder: 'Confirm Password',
    alreadyHaveAccount: 'Already have an account?',
    signUpSubtext: 'Create your account to participate in the election.',

    // Login Page
    welcomeBack: 'Welcome Back',
    dontHaveAccount: "Don't have an account?",
    loginSubtext: 'Log in to your account to cast your vote.',

    // Voting Page
    castYourVote: 'Cast Your Vote',
    votingSubtext: 'Choose the slate that you believe will best lead our student body.',
    thankYouForVoting: 'Thank you for voting! Your choice has been recorded.',
    votingHeaderSubtext: 'Review the slates and make your choice. You can only vote once.',
    noVoteCastYet: 'You have not cast your vote yet. Go to the voting page to make your choice.',

    // Slate Card
    president: 'President',
    vicePresident: 'Vice President',
    voteForThisSlate: 'VOTE',
    voted: 'VOTED',

    // Modal
    registrationSuccessful: 'Registration Successful!',
    checkInbox: 'Please check your inbox for a confirmation email to activate your account.',
    proceedToLogin: 'Proceed to Login',
    confirmYourVote: 'Confirm Your Vote',
    youAreVotingFor: 'You are about to cast your vote for the following slate. This action is final.',
    cancel: 'Cancel',
    confirmVoteButton: 'Confirm Vote',

    // Progress
    step1: 'Step 1 of 3',
    step2: 'Step 2 of 3',
    step3: 'Step 3 of 3',
    complete: 'Complete',

    // Voting Ticket
    votingTicketTitle: 'Voting Receipt',
    slateVotedFor: 'Slate Voted For',
    transactionId: 'Transaction ID',
    timestamp: 'Timestamp',
    status: 'Status',
    verifiedStatus: 'Verified',
    downloadTicket: 'Download Ticket',
    voteConfirmed: 'Vote Confirmed!',
  },
  es: {
    // General
    login: 'Iniciar Sesión',
    signUp: 'Registrarse',
    logout: 'Cerrar Sesión',
    emailPlaceholder: 'Correo Electrónico',
    passwordPlaceholder: 'Contraseña',

    // Left Sidebar
    votingSys: 'SistemaVoto',
    vote: 'Votar',
    profile: 'Perfil',
    home: 'Inicio',
    votingTicket: 'Comprobante',

    // Right Sidebar
    language: 'IDIOMA',

    // Landing Page
    shapeTomorrow: 'Dale Forma al Mañana.',
    voteToday: 'Vota Hoy.',
    landingSubtext: 'Tu voz importa. Participa en las elecciones estudiantiles y elige a los líderes que te representarán.',
    getStarted: 'Empezar',
    featureSecureTitle: 'Seguro y Privado',
    featureSecureText: 'Tu voto es anónimo y está protegido con los últimos estándares de seguridad.',
    featureModernTitle: 'Interfaz Moderna',
    featureModernText: 'Disfruta de una experiencia de votación fluida e intuitiva en cualquier dispositivo.',
    featureMultiTitle: 'Multilingüe',
    featureMultiText: 'Emite tu voto en el idioma con el que te sientas más cómodo.',

    // Sign Up Page
    createAccount: 'Crear Cuenta',
    fullNamePlaceholder: 'Nombre Completo',
    confirmPasswordPlaceholder: 'Confirmar Contraseña',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    signUpSubtext: 'Crea tu cuenta para participar en la elección.',

    // Login Page
    welcomeBack: 'Bienvenido de Nuevo',
    dontHaveAccount: '¿No tienes una cuenta?',
    loginSubtext: 'Inicia sesión en tu cuenta para emitir tu voto.',

    // Voting Page
    castYourVote: 'Emite tu Voto',
    votingSubtext: 'Elige la lista que crees que liderará mejor nuestro cuerpo estudiantil.',
    thankYouForVoting: '¡Gracias por votar! Tu elección ha sido registrada.',
    votingHeaderSubtext: 'Revisa las listas y haz tu elección. Solo puedes votar una vez.',
    noVoteCastYet: 'Aún no has emitido tu voto. Ve a la página de votación para hacer tu elección.',

    // Slate Card
    president: 'Presidente',
    vicePresident: 'Vicepresidente',
    voteForThisSlate: 'VOTAR',
    voted: 'VOTADO',

    // Modal
    registrationSuccessful: '¡Registro Exitoso!',
    checkInbox: 'Por favor, revisa tu bandeja de entrada para un correo de confirmación para activar tu cuenta.',
    proceedToLogin: 'Proceder a Iniciar Sesión',
    confirmYourVote: 'Confirmar Voto',
    youAreVotingFor: 'Estás a punto de emitir tu voto por la siguiente lista. Esta acción es final.',
    cancel: 'Cancelar',
    confirmVoteButton: 'Confirmar Voto',

    // Progress
    step1: 'Paso 1 de 3',
    step2: 'Paso 2 de 3',
    step3: 'Paso 3 de 3',
    complete: 'Completado',

    // Voting Ticket
    votingTicketTitle: 'Comprobante de Votación',
    slateVotedFor: 'Lista Votada',
    transactionId: 'ID de Transacción',
    timestamp: 'Fecha y Hora',
    status: 'Estado',
    verifiedStatus: 'Verificado',
    downloadTicket: 'Descargar Comprobante',
    voteConfirmed: '¡Voto Confirmado!',
  },
};

export type TranslationKey = keyof typeof translations.en;