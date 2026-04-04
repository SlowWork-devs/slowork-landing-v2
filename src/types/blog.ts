export interface BlogCategory {
  id: number;
  name_es: string;
  name_en: string;
  creation_date: string;
}

export interface BlogPost {
  id: number;
  title_es: string;
  title_en: string;
  content_es: string;
  content_en: string;
  image_url: string;
  /** Slug canónico en BD; si viene vacío, el cliente usa `id` en la URL. */
  slug?: string | null;
  excerpt_es?: string | null;
  excerpt_en?: string | null;
  keywords?: string[] | null;
  category_id: number;
  category?: BlogCategory;
  creation_date: string;
  /** Fecha editorial; si falta, la UI usa `creation_date`. */
  date_published?: string | null;
}

export interface BlogResponse {
  items: BlogPost[];
  pageInfo: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    paginationSize: number;
  };
}
