/** Contenido marketing de la página About Us (ES/EN). */
export type AboutHelmet = {
  readonly title: string;
  readonly description: string;
};

export type AboutPageContent = {
  readonly helmet: AboutHelmet;
  /** Título principal (H1). */
  readonly title: string;
  /** Palabras destacadas bajo el título (ej. Work. Travel. Connect.). */
  readonly taglineWords: readonly string[];
  readonly leadIn: string;
  readonly paragraph1: string;
  readonly paragraph2: string;
  readonly paragraph3: string;
  readonly paragraph4: string;
  readonly paragraph5: string;
  readonly paragraph6: string;
  readonly quote: string;
  /** Texto alternativo de la imagen hero de la sección. */
  readonly imageAlt: string;
};
