import type { AboutPageContent } from '../models/about';
import type { SupportedLang } from './seo';

const es: AboutPageContent = {
  helmet: {
    title: 'Sobre Nosotros - Slowork',
    description:
      'Descubre la misión y visión detrás de Slowork, una plataforma que conecta trabajadores remotos con espacios de coworking y coliving eco-conscientes. Únete a nosotros para construir una comunidad de trabajo remoto sostenible.',
  },
  title: 'Sobre nosotros',
  taglineWords: ['Trabaja.', 'Viaja.', 'Conecta.', 'Repite.'],
  leadIn: 'En Slowork, no solo estamos construyendo una plataforma — estamos liderando un movimiento.',
  paragraph1:
    'Creemos que el trabajo remoto no debería significar aislamiento o viajes apresurados. Debería tratarse de conexiones significativas, lugares inspiradores y un estilo de vida que equilibre trabajo, aventura y sostenibilidad.',
  paragraph2:
    'Por eso hemos creado una red global de alojamientos seleccionados, comunidades vibrantes y ecosistemas de apoyo — diseñados para trabajadores remotos, emprendedores y creativos que buscan algo más que un lugar donde quedarse.',
  paragraph3:
    'En Slowork, no solo encuentras un escritorio — encuentras una comunidad. No solo visitas un destino — te conviertes en parte de un movimiento sostenible que respeta las culturas y los entornos locales.',
  paragraph4:
    'Ya sea que viajes solo, seas una familia en busca de estabilidad, o un equipo en un retiro remoto, Slowork te conecta con espacios que reflejan tus valores, objetivos y estilo de vida.',
  paragraph5: 'Tu trabajo debería impulsar tu libertad — no limitarla.',
  paragraph6: 'Bienvenido al futuro del trabajo remoto',
  quote: 'Construido por quienes se atreven a hacer las cosas de manera diferente',
  imageAlt: 'Equipo y espíritu Slowork',
};

const en: AboutPageContent = {
  helmet: {
    title: 'About Us - Slowork',
    description:
      'Discover the mission and vision behind Slowork, a platform connecting remote workers with eco-conscious coworking and coliving spaces. Join us in building a sustainable remote work community.',
  },
  title: 'About us',
  taglineWords: ['Work.', 'Travel.', 'Connect.', 'Repeat.'],
  leadIn: 'At Slowork, we’re not just building a platform — we’re leading a movement.',
  paragraph1:
    'We believe remote work shouldn’t mean isolation or rushed travel. It should be about meaningful connections, inspiring places, and a lifestyle that balances work, adventure, and sustainability.',
  paragraph2:
    'That’s why we’ve built a global network of handpicked accommodations, vibrant communities, and supportive ecosystems — designed for remote workers, entrepreneurs, and creatives who crave more than just a place to stay.',
  paragraph3:
    'At Slowork, you don’t just find a desk — you find a community. You don’t just visit a destination — you become part of a sustainable movement that honors local cultures and environments.',
  paragraph4:
    'Whether you’re a solo traveler, a family searching for stability, or a team on a remote retreat, Slowork connects you to spaces that reflect your values, goals, and lifestyle.',
  paragraph5: 'Your work should fuel your freedom — not limit it.',
  paragraph6: 'Welcome to the future of remote work',
  quote: 'Built by those who dare to do things differently',
  imageAlt: 'The Slowork team and spirit',
};

export function getAboutContent(lang: SupportedLang): AboutPageContent {
  return lang === 'es' ? es : en;
}
