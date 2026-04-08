import { marked } from 'marked';
import type { Tokens } from 'marked';
import type { BlogPost, BlogResponse } from '@/types/blog';

export type ApiLang = 'es' | 'en';

/**
 * Misma lógica de escape que `marked` para cuerpos de fence (`Renderer.code` + `escaped: false`).
 * Evitamos depender de APIs internas del paquete.
 */
const escapeHtmlForCodeBlock = (html: string): string => {
  if (!/[&<>"']/.test(html)) return html;
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/** Cuerpo del fence: una newline final, como hace marked por defecto. */
const normalizedFenceBody = (text: string): string => `${text.replace(/\n$/, '')}\n`;

/**
 * HTML semántico sin clases de presentación: el tema `prose` controla estilos.
 * Por defecto marked añade `class="language-*"` en `<pre><code>`; lo omitimos.
 */
marked.use({
  renderer: {
    code({ text, escaped }: Tokens.Code): string {
      const body = normalizedFenceBody(text);
      const inner = escaped ? body : escapeHtmlForCodeBlock(body);
      return `<pre><code>${inner}</code></pre>\n`;
    },
  },
});

/**
 * Builds the GraphQL HTTP URL from `SLOWORK_API_URL`.
 * Accepts either the API root (no path) or a URL that already ends with `/graphql`.
 */
export const buildGraphqlEndpoint = (rawBase: string): string => {
  const trimmed = rawBase.trim().replace(/\/+$/, '');
  if (/\/graphql$/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}/graphql`;
};

const resolveSloworkGraphqlUrl = (): string => {
  const baseUrl = import.meta.env.SLOWORK_API_URL as string | undefined;
  if (!baseUrl?.trim()) {
    throw new Error('SLOWORK_API_URL is not configured');
  }
  return buildGraphqlEndpoint(baseUrl);
};

/** Markdown → HTML sin clases en elementos de flujo; solo etiquetas semánticas. */
const markdownToHtml = (raw: string | null | undefined): string => {
  const t = (raw ?? '').trim();
  if (!t) return '';
  return marked.parse(t, { async: false }) as string;
};

export type LocalizedBlogPost = Omit<
  BlogPost,
  'title_es' | 'title_en' | 'content_es' | 'content_en' | 'excerpt_es' | 'excerpt_en' | 'slug'
> & {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
};

const resolveSlug = (post: BlogPost): string => {
  const fromDb = post.slug?.trim();
  return fromDb && fromDb.length > 0 ? fromDb : String(post.id);
};

const localizeBlogPost = (post: BlogPost, lang: ApiLang): LocalizedBlogPost => {
  const excerptMd =
    lang === 'es' ? (post.excerpt_es?.trim() ?? '') : (post.excerpt_en?.trim() ?? '');
  const contentMd = lang === 'es' ? post.content_es : post.content_en;

  return {
    id: post.id,
    slug: resolveSlug(post),
    title: lang === 'es' ? post.title_es : post.title_en,
    content: markdownToHtml(contentMd),
    excerpt: markdownToHtml(excerptMd),
    keywords: post.keywords ?? [],
    image_url: post.image_url,
    category_id: post.category_id ?? 0,
    category: post.category,
    creation_date: post.creation_date,
    date_published: post.date_published ?? null,
  };
};

const fetchGraphQL = async <T>(query: string, variables = {}): Promise<T> => {
  const graphqlUrl = resolveSloworkGraphqlUrl();

  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const bodyText = await res.text();
  let payload: { data?: T; errors?: Array<{ message?: string }> };
  try {
    payload = JSON.parse(bodyText) as { data?: T; errors?: Array<{ message?: string }> };
  } catch {
    throw new Error(
      `GraphQL response is not valid JSON (url: ${graphqlUrl}, http: ${res.status}, preview: ${bodyText.slice(0, 240)})`,
    );
  }

  const { data, errors } = payload;

  if (!res.ok) {
    const detail = errors?.[0]?.message ?? bodyText.slice(0, 500);
    throw new Error(`GraphQL HTTP ${res.status} at ${graphqlUrl}: ${detail}`);
  }

  if (errors?.length) {
    const first = errors[0]?.message ?? 'Unknown GraphQL error';
    console.error('[GraphQL Error]:', errors, { url: graphqlUrl });
    throw new Error(`GraphQL error at ${graphqlUrl}: ${first}`);
  }

  if (data === undefined || data === null) {
    throw new Error(`GraphQL response missing data (url: ${graphqlUrl})`);
  }

  return data;
};

const BLOG_FIELDS = `
  id
  slug
  title_es
  title_en
  content_es
  content_en
  excerpt_es
  excerpt_en
  keywords
  image_url
  category_id
  creation_date
  date_published
  category {
    id
    name_es
    name_en
    creation_date
  }
`;

const GET_BLOGS_QUERY = `
  query GetBlogs($currentPage: Int, $paginationSize: Int) {
    getBlogs(currentPage: $currentPage, paginationSize: $paginationSize) {
      items {
        ${BLOG_FIELDS}
      }
      pageInfo {
        totalItems
        totalPages
        currentPage
        paginationSize
      }
    }
  }
`;

const GET_BLOG_BY_ID_QUERY = `
  query GetBlog($id: Int!) {
    getBlog(id: $id) {
      ${BLOG_FIELDS}
    }
  }
`;

const GET_BLOG_BY_SLUG_QUERY = `
  query GetBlogBySlug($slug: String!) {
    getBlogBySlug(slug: $slug) {
      ${BLOG_FIELDS}
    }
  }
`;

export async function getBlogs(params: { page: number; limit: number; lang?: ApiLang }) {
  const data = await fetchGraphQL<{ getBlogs: BlogResponse | null | undefined }>(GET_BLOGS_QUERY, {
    currentPage: params.page,
    paginationSize: params.limit,
  });

  if (!data.getBlogs) {
    throw new Error(
      `GraphQL getBlogs returned empty (url: ${resolveSloworkGraphqlUrl()})`,
    );
  }

  const lang = params.lang === 'es' ? 'es' : 'en';
  return {
    pageInfo: data.getBlogs.pageInfo,
    items: data.getBlogs.items.map((post) => localizeBlogPost(post, lang)),
  };
}

export async function getBlogById(params: { id: number; lang?: ApiLang }) {
  const data = await fetchGraphQL<{ getBlog: BlogPost | null | undefined }>(GET_BLOG_BY_ID_QUERY, {
    id: params.id,
  });

  if (!data.getBlog) {
    throw new Error(
      `GraphQL getBlog returned empty for id=${params.id} (url: ${resolveSloworkGraphqlUrl()})`,
    );
  }

  const lang = params.lang === 'es' ? 'es' : 'en';
  return localizeBlogPost(data.getBlog, lang);
}

export async function getBlogBySlug(params: { slug: string; lang?: ApiLang }) {
  const data = await fetchGraphQL<{ getBlogBySlug: BlogPost | null | undefined }>(
    GET_BLOG_BY_SLUG_QUERY,
    {
      slug: params.slug,
    },
  );

  if (!data.getBlogBySlug) {
    throw new Error(
      `GraphQL getBlogBySlug returned empty for slug=${params.slug} (url: ${resolveSloworkGraphqlUrl()})`,
    );
  }

  const lang = params.lang === 'es' ? 'es' : 'en';
  return localizeBlogPost(data.getBlogBySlug, lang);
}
