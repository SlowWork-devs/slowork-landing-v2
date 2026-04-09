import type { ImageMetadata } from 'astro';

import carouselCommunity from '@/assets/images/carousel-community.webp';
import carouselHost from '@/assets/images/carousel-host.webp';
import carouselJungle from '@/assets/images/carousel-jungle.webp';
import globeTextureImg from '@/assets/images/globe-texture.webp';
import homeBgVideoPoster from '@/assets/images/home-bg-video-poster.webp';
import homeBgVideoUrl from '@/assets/images/home-bg-video.mp4?url';
import sloworkLogo from '@/assets/images/slowork-logo.png';
import logoCarousel from '@/assets/logo-carousel.webp';
import whoWorker1 from '@/assets/images/who-worker1.webp';
import whoWorker2 from '@/assets/images/who-worker2.webp';
import whoWorker3 from '@/assets/images/who-worker3.webp';
import whoWorker4 from '@/assets/images/who-worker4.webp';
import whoWorker5 from '@/assets/images/who-worker5.webp';
import whoWorker6 from '@/assets/images/who-worker6.webp';

import type { SupportedLang } from '@/lib/seo';

/** Vídeo local + poster y texturas de marca (sin CDN en runtime). */
export const HOME_MEDIA = {
  /** Metadatos para `<Image />` o `poster` vía `.src` */
  videoPoster: homeBgVideoPoster,
  videoSrc: homeBgVideoUrl,
  logo: sloworkLogo,
  /** Marca completa en hito central del journey (home). */
  logoCarousel,
  globeTexture: globeTextureImg,
} as const;

export type CarouselSlide = {
  src: ImageMetadata;
  alt: Record<SupportedLang, string>;
};

export const HOME_CAROUSEL: CarouselSlide[] = [
  {
    src: carouselJungle,
    alt: { en: 'Remote work in nature', es: 'Trabajo remoto en la naturaleza' },
  },
  {
    src: carouselHost,
    alt: { en: 'Slowork host location', es: 'Ubicación Slowork Host' },
  },
  {
    src: carouselCommunity,
    alt: { en: 'Slowork host community', es: 'Comunidad Slowork Host' },
  },
];

export type HomeFeature = {
  icon: string;
  title: Record<SupportedLang, string>;
  description: Record<SupportedLang, string>;
};

export const HOME_FEATURES: HomeFeature[] = [
  {
    icon: 'leaf',
    title: { en: 'Work from nature', es: 'Trabaja desde la naturaleza' },
    description: {
      en: 'Set up your office in the jungle, by the sea or in the mountains.',
      es: 'Instala tu oficina en la jungla, junto al mar o en las montañas.',
    },
  },
  {
    icon: 'heart',
    title: { en: 'Live well', es: 'Vive bien' },
    description: {
      en: 'Prioritize your wellbeing with yoga, good food, and balance.',
      es: 'Prioriza tu bienestar con yoga, buena comida y equilibrio.',
    },
  },
  {
    icon: 'users',
    title: { en: 'Connect deeply', es: 'Conecta profundamente' },
    description: {
      en: 'Meet real people, join local circles, build authentic friendships.',
      es: 'Conoce gente real, únete a círculos locales, crea amistades auténticas.',
    },
  },
  {
    icon: 'home',
    title: { en: 'Stay consciously', es: 'Vive conscientemente' },
    description: {
      en: 'Discover handpicked coliving & coworking spaces curated for nomads.',
      es: 'Descubre espacios de coliving y coworking seleccionados para nómadas.',
    },
  },
  {
    icon: 'route',
    title: { en: 'Plan your next route', es: 'Planifica tu próxima ruta' },
    description: {
      en: 'Organize your travel journey in one place and track your slow travels.',
      es: 'Organiza tu viaje en un solo lugar y lleva un seguimiento de tus viajes lentos.',
    },
  },
  {
    icon: 'globe',
    title: { en: 'Share your path', es: 'Comparte tu camino' },
    description: {
      en: 'Post your route and connect with others on the same trail.',
      es: 'Publica tu ruta y conéctate con otros en la misma travesía.',
    },
  },
  {
    icon: 'camera',
    title: { en: 'Create and share content', es: 'Crea y comparte contenido' },
    description: {
      en: 'Post your stories, reels or blogs and earn credits for your stays.',
      es: 'Publica tus historias, reels o blogs y gana créditos para tus estancias.',
    },
  },
  {
    icon: 'briefcase',
    title: { en: 'Show your projects', es: 'Muestra tus proyectos' },
    description: {
      en: "Publish what you're working on and find collaborators in the community.",
      es: 'Publica en qué estás trabajando y encuentra colaboradores en la comunidad.',
    },
  },
  {
    icon: 'compass',
    title: { en: 'Connect with local people', es: 'Conéctate con la gente local' },
    description: {
      en:
        'Meet the hosts and changemakers shaping each community. Slowork connects you directly with local partners, so you integrate with the territory, not just pass through.',
      es:
        'Conoce a los anfitriones y agentes de cambio de cada comunidad. Slowork te conecta directamente con socios locales, para que te integres con el territorio, no solo pases por él.',
    },
  },
];

export type JourneyStep =
  | {
      id: string;
      kind: 'split';
      side: 'left' | 'right';
      icon: string;
      iconWrapClass: string;
      title: Record<SupportedLang, string>;
      description: Record<SupportedLang, string>;
      delayClass?: string;
    }
  | {
      id: string;
      kind: 'center';
      icon: 'logo';
      iconWrapClass: string;
      title: Record<SupportedLang, string>;
      description: Record<SupportedLang, string>;
      delayClass?: string;
    };

export const HOME_JOURNEY: JourneyStep[] = [
  {
    id: 'step1',
    kind: 'split',
    side: 'left',
    icon: 'search',
    iconWrapClass: 'bg-light-green text-primary',
    title: { en: 'Find your next destination', es: 'Encuentra tu próximo destino' },
    description: {
      en: 'Search and discover eco-conscious coliving & coworking spaces designed for remote workers.',
      es: 'Explora espacios de coliving y coworking sostenibles, diseñados para trabajadores remotos.',
    },
  },
  {
    id: 'step2',
    kind: 'split',
    side: 'right',
    icon: 'bed',
    iconWrapClass: 'bg-soft-blue text-primary',
    title: { en: 'Book your stay & connect', es: 'Reserva tu espacio y conéctate' },
    description: {
      en: 'Reserve your space, get to know your Slowork hosts and meet other nomads before you arrive.',
      es: 'Elige tu estancia, conoce a tus anfitriones Slowork y empieza a conectar con otros nómadas antes de llegar.',
    },
    delayClass: 'delay-[200ms]',
  },
  {
    id: 'step3',
    kind: 'split',
    side: 'left',
    icon: 'users',
    iconWrapClass: 'bg-secondary text-primary',
    title: {
      en: 'Meet other Sloworkers & collaborators',
      es: 'Conoce a otros Sloworkers y colaboradores',
    },
    description: {
      en: 'Join a like-minded community. Find clients, propose projects, and grow through real collaboration.',
      es: 'Únete a una comunidad con tus mismos valores. Encuentra clientes, ofrece proyectos y crece a través de colaboraciones reales.',
    },
    delayClass: 'delay-[300ms]',
  },
  {
    id: 'step4',
    kind: 'split',
    side: 'right',
    icon: 'spa',
    iconWrapClass: 'bg-gradient-to-br from-primary to-soft-blue text-secondary',
    title: { en: 'Join local experiences & wellness', es: 'Participa en experiencias locales y bienestar' },
    description: {
      en: 'Participate in events, retreats, workshops and moments of presence with local communities.',
      es: 'Únete a eventos, retiros, talleres y momentos de conexión con las comunidades locales.',
    },
    delayClass: 'delay-[300ms]',
  },
  {
    id: 'step5',
    kind: 'center',
    icon: 'logo',
    iconWrapClass: 'bg-linear-to-b from-primary to-soft-blue text-secondary',
    title: { en: 'Track your journey & earn credits', es: 'Registra tu viaje y gana créditos' },
    description: {
      en: 'Log your trips and activities, and earn Slowork credits for future stays by sharing content about your experience.',
      es: 'Guarda tus rutas y actividades, y obtén créditos Slowork para futuras estancias compartiendo contenido sobre tu experiencia.',
    },
    delayClass: 'delay-[300ms]',
  },
];

export type WhoCard = {
  id: string;
  src: ImageMetadata;
  alt: Record<SupportedLang, string>;
  title: Record<SupportedLang, string>;
  description: Record<SupportedLang, string>;
  side: 'left' | 'right';
  delayClass?: string;
};

export const HOME_WHO_CARDS: WhoCard[] = [
  {
    id: 'who1',
    src: whoWorker1,
    alt: { en: 'Mindful seeker', es: 'Buscador consciente' },
    title: { en: 'The Mindful Seeker', es: 'El Buscador Consciente' },
    description: {
      en: 'Looking for more than Wi-Fi. Seeking inner peace, outer beauty, and slow connection.',
      es: 'Buscas un estilo de vida equilibrado, donde el trabajo y la naturaleza se complementen.',
    },
    side: 'left',
  },
  {
    id: 'who2',
    src: whoWorker2,
    alt: { en: 'Digital nomad', es: 'Nómada digital' },
    title: { en: 'The Digital Nomad', es: 'El Nómada Digital' },
    description: {
      en: 'Starting my remote journey. Craving clarity, community and adventure.',
      es: 'Comenzando mi viaje remoto. En busca de claridad, comunidad y aventura.',
    },
    side: 'right',
    delayClass: 'delay-[200ms]',
  },
  {
    id: 'who3',
    src: whoWorker3,
    alt: { en: 'Freedom adventurer', es: 'Aventurero libre' },
    title: { en: 'The Free Adventurer', es: 'El Aventurero Libre' },
    description: {
      en: 'My office has no walls. I follow the waves, the Wi-Fi, and what feels right.',
      es: 'Mi oficina no tiene paredes. Sigo las olas, el Wi-Fi y lo que me hace sentir bien.',
    },
    side: 'left',
    delayClass: 'delay-[200ms]',
  },
  {
    id: 'who4',
    src: whoWorker4,
    alt: { en: 'Remote architect', es: 'Arquitecto remoto' },
    title: { en: 'The Remote Architect', es: 'El Arquitecto Remoto' },
    description: {
      en: 'Building something that matters, while living how I want. Focused, free, connected.',
      es: 'Construyo algo que importa, mientras vivo a mi manera. Enfocado, libre y conectado.',
    },
    side: 'right',
    delayClass: 'delay-[200ms]',
  },
  {
    id: 'who5',
    src: whoWorker5,
    alt: { en: 'Lifelong learner', es: 'Eterno aprendiz' },
    title: { en: 'The Lifelong Learner', es: 'El eterno aprendiz' },
    description: {
      en: 'Always growing. Learning from the world, from people, from the silence.',
      es: 'Siempre creciendo. Aprendiendo del mundo, de las personas y del silencio.',
    },
    side: 'left',
    delayClass: 'delay-[200ms]',
  },
  {
    id: 'who6',
    src: whoWorker6,
    alt: { en: 'Slow traveller', es: 'Viajero slow' },
    title: { en: 'The Slow Traveller', es: 'El Viajero Slow' },
    description: {
      en: "I don't count countries. I collect moments, connections and stories.",
      es: 'No cuento países. Colecciono momentos, conexiones e historias.',
    },
    side: 'right',
    delayClass: 'delay-[300ms]',
  },
];

export type GlobeCard = {
  title: Record<SupportedLang, string>;
  description: Record<SupportedLang, string>;
};

export const HOME_GLOBE_CARDS: GlobeCard[] = [
  {
    title: { en: 'Live with locals', es: 'Host' },
    description: { en: 'More than 500 hosts around the world', es: 'Más de 500 hosts en el mundo' },
  },
  {
    title: { en: 'Cowork', es: 'Cowork' },
    description: { en: 'More than 60 coworking spaces', es: 'Más de 60 espacios de coworking' },
  },
  {
    title: { en: 'Create', es: 'Crear' },
    description: { en: 'More than 40 content creators', es: 'Más de 40 creadores de contenido' },
  },
  {
    title: { en: 'Community', es: 'Comunidad' },
    description: { en: 'Find your tribe', es: 'Encuentra tu tribu' },
  },
];

/** Rotating hero word + phrase — Solo inglés para coherencia global. */
const HOME_HERO_ROTATOR_COMBINATIONS: Array<{ first: string; phrase: string }> = [
  { first: 'how',   phrase: 'you balance work and life' },
  { first: 'where', phrase: 'you find your focus' },
  { first: 'why',   phrase: 'you choose freedom' },
  { first: 'who',   phrase: 'you share the journey with' },
];

export function heroCombinations(_lang: SupportedLang) {
  // Ignoramos el idioma y devolvemos siempre las combinaciones en inglés
  return HOME_HERO_ROTATOR_COMBINATIONS;
}

export function homeHeroCopy(lang: SupportedLang) {
  return {
    // Ajustamos la estructura para que lea: "It's time to redefine [first]"
    line1: "It's time to redefine",
    line1b: '', 
    combinations: HOME_HERO_ROTATOR_COMBINATIONS,
    desc1: lang === 'es'
        ? 'Trabajar viajando no es prisa ni agotamiento.'
        : 'Remote work is not about hustle or burnout.',
    desc2: lang === 'es'
        ? 'Es equilibrio, naturaleza, conexión y libertad.'
        : 'It’s about balance, nature, connection, and freedom.',
    italic: lang === 'es' ? 'Acceso anticipado y recompensas' : 'Get early access and exclusive benefits',
    ctaWaitlist: lang === 'es' ? 'Únete a la waitlist' : 'Join the waitlist',
    ctaBlog: lang === 'es' ? 'Explorar el blog' : 'Explore the blog',
  };
}

export function homeValueCopy(lang: SupportedLang) {
  return {
    title: lang === 'es' ? 'Trabaja diferente. Vive libre.' : 'Work differently. Live freely.',
    subtitle: lang === 'es' ? 'Slowork no es solo una app, es un movimiento.' : "Slowork is not just an app. It's a movement.",
    cardLead1: lang === 'es' ? 'Estamos' : "We're",
    cardLead2: lang === 'es' ? 'construyendo el futuro' : 'building the future',
    cardLead3: lang === 'es' ? ' del trabajo remoto' : ' of remote work',
    phrase1:
      lang === 'es'
        ? 'Donde la productividad se encuentra con la naturaleza, la conexión real y un estilo de vida consciente.'
        : 'The one that blends productivity with nature, deep human connection, and conscious living.',
    phrase2a:
      lang === 'es' ? 'Del corazón de la naturaleza al ritmo del océano, ' : 'From coliving in the jungle to coworking by the ocean, ',
    phrase2b:
      lang === 'es'
        ? 'Slowork te conecta con lugares, personas y propósitos.'
        : 'Slowork connects you with places, people, and purpose.',
  };
}

export function homeFeaturesTitle(lang: SupportedLang) {
  return lang === 'es'
    ? { a: 'Todo lo necesario ', b: 'para vivir y trabajar ', c: 'en equilibrio' }
    : { a: 'Everything you need for ', b: 'conscious ', c: ' remote work' };
}

export function homeGlobeCopy(lang: SupportedLang) {
  return {
    title: lang === 'es' ? 'Este es el mundo que estamos creando' : 'This is the world we’re building',
    subtitle: lang === 'es' ? '¿Quieres ser parte de esto?' : 'Want to be part of it?',
    asideTitle: lang === 'es' ? 'Explora destinos' : 'Explore destinations',
    asideBody:
      lang === 'es'
        ? 'Una red global de lugares y personas alineadas con una vida remota sostenible.'
        : 'A global network of places and people aligned with sustainable remote living.',
  };
}

/** ES: "Tu viaje Slowork" with accent on second part; EN: "Your " + "Slowork Journey" */
export function homeJourneyTitleParts(lang: SupportedLang) {
  if (lang === 'es') {
    return { before: 'Tu ', highlight: 'viaje', after: '' };
  }
  return { before: 'Your ', highlight: 'Journey', after: '' };
}

export function homeWhoTitleParts(lang: SupportedLang) {
  return lang === 'es'
    ? { before: '¿Esto ', highlight: 'es para ti?', after: '' }
    : { before: 'Is this ', highlight: 'for you?', after: '' };
}

export function homeFinalCtaCopy(lang: SupportedLang) {
  return {
    title: lang === 'es' ? 'Ya eres un sloworker' : "You're one of us",
    subtitle: lang === 'es' ? 'Únete a la lista de espera hoy' : 'Get on the Waitlist today',
    waitlist: lang === 'es' ? 'Unirme a la waitlist' : 'Join the waitlist',
  };
}

/** Sección contacto home — copy para plantilla; sin email público en markup. */
export function homeContactCopy(lang: SupportedLang) {
  if (lang === 'es') {
    return {
      eyebrow: 'Contacto',
      title: 'Hablemos',
      subtitle: 'Estamos aquí para ayudarte',
      intro:
        'Escríbenos para colaboraciones, prensa o cualquier duda sobre la comunidad Slowork.',
      formTitle: 'Envíanos un mensaje',
      name: 'Nombre',
      emailField: 'Email',
      subject: 'Asunto',
      message: 'Mensaje',
      honeypotLabel: 'No rellenar',
      button: 'Enviar mensaje',
      successFeedback: 'Mensaje enviado con éxito.',
      errorGeneric: 'No se pudo enviar. Inténtalo de nuevo.',
    };
  }
  return {
    eyebrow: 'Contact',
    title: "Let's talk",
    subtitle: "We're here to help",
    intro: '',
    formTitle: 'Send us a message',
    name: 'Name',
    emailField: 'Email',
    subject: 'Subject',
    message: 'Message',
    honeypotLabel: 'Leave blank',
    button: 'Send message',
    successFeedback: 'Message sent successfully.',
    errorGeneric: 'Could not send. Please try again.',
  };
}

/** Textos del formulario waitlist (alineados a la landing React histórica). */
export function waitlistFormCopy(lang: SupportedLang) {
  if (lang === 'es') {
    return {
      titlePart1: 'Únete a la',
      titleHighlight1: 'revolución del nomadismo digital',
      titlePart2: 'y el',
      titleHighlight2: 'emprendimiento',
      titleEnd: 'sostenible',
      waitingList: 'LISTA DE ESPERA',
      formTitle: 'Registro',
      sectionPersonal: 'Información personal',
      sectionSocial: 'Redes sociales',
      sectionPreferences: 'Preferencias y comunidad',
      firstName: 'Nombre',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      preferredContact: '¿Desde qué posición nos contactas?',
      communityInterest: '¿Qué te gustaría ver en la comunidad?',
      phFirstName: 'Escribe tu nombre',
      phEmail: 'Escribe tu correo electrónico',
      phInstagram: '@usuario',
      phLinkedin: 'Perfil de LinkedIn',
      phCommunity: 'Me encantaría conectar con profesionales afines.',
      selectDefault: 'Selecciona una opción',
      optSloworker: 'Sloworker',
      optHost: 'Host',
      optBusiness: 'Empresa',
      termsBefore: 'Acepto los ',
      termsLink: 'Términos y Condiciones',
      termsAfter: ' y doy mi consentimiento para recibir contenido promocional de Slowork.',
      termsDialogClose: 'Cerrar',
      termsDialogOpenFullPage: 'Abrir en página completa (nueva pestaña)',
      button: 'Enviar',
      sending: 'Anotando...',
      success: '¡Gracias por apuntarte!',
      error: 'Hubo un error',
      sendFailed: 'Error al enviar, inténtalo de nuevo',
      successInsideBefore: '¡Ya estás dentro,',
      successInsideAfter: '!',
      successCardSub: 'Te escribiremos pronto con novedades.',
      closeSuccess: 'Cerrar',
      backHome: 'Volver a la Home',
      validation: {
        emailRequired: 'El correo es obligatorio',
        emailInvalid: 'Introduce un correo válido',
        firstNameRequired: 'El nombre es obligatorio',
        phoneRequired: 'El teléfono es obligatorio',
        phoneInvalid: 'Usa formato internacional E.164 (ej. +34600000000)',
        instagramInvalid: 'Usuario de Instagram no válido',
        linkedinInvalid: 'Introduce una URL válida (https://…)',
        preferredContactRequired: 'Selecciona una opción',
        communityRequired: 'Cuéntanos qué te interesa',
        termsRequired: 'Debes aceptar los términos',
      },
    };
  }
  return {
    titlePart1: 'Join the',
    titleHighlight1: 'Digital Nomad',
    titlePart2: 'and',
    titleHighlight2: 'Entrepreneurship',
    titleEnd: 'Revolution!',
    waitingList: 'WAITLIST',
    formTitle: 'Register',
    sectionPersonal: 'Personal details',
    sectionSocial: 'Social profiles',
    sectionPreferences: 'Preferences & community',
    firstName: 'First Name',
    email: 'Email',
    phone: 'Phone',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    preferredContact: 'From which position are you contacting us?',
    communityInterest: 'What would you like to see in the community?',
    phFirstName: 'Enter your name',
    phEmail: 'Enter your email',
    phInstagram: '@username',
    phLinkedin: 'LinkedIn Profile',
    phCommunity: 'I’d love to connect with like-minded professionals.',
    selectDefault: 'Select an option',
    optSloworker: 'Sloworker',
    optHost: 'Host',
    optBusiness: 'Business',
    termsBefore: 'I agree to the ',
    termsLink: 'Terms and Conditions',
    termsAfter: ' and consent to receive promotional content from Slowork.',
    termsDialogClose: 'Close',
    termsDialogOpenFullPage: 'Open full page (new tab)',
    button: 'Submit',
    sending: 'Signing you up...',
    success: 'Thanks for signing up!',
    error: 'Something went wrong',
    sendFailed: 'Could not send. Please try again.',
    successInsideBefore: "You're in,",
    successInsideAfter: '!',
    successCardSub: "We'll be in touch soon.",
    closeSuccess: 'Close',
    backHome: 'Back to Home',
    validation: {
      emailRequired: 'Email is required',
      emailInvalid: 'Enter a valid email',
      firstNameRequired: 'First name is required',
      phoneRequired: 'Phone is required',
      phoneInvalid: 'Use international E.164 format (e.g. +34600000000)',
      instagramInvalid: 'Invalid Instagram handle',
      linkedinInvalid: 'Enter a valid URL (https://…)',
      preferredContactRequired: 'Please select an option',
      communityRequired: 'Tell us what you’re looking for',
      termsRequired: 'You must accept the terms',
    },
  };
}
