import { marked } from 'marked';
import type { BlogPost, BlogResponse } from '@/types/blog';

export type ApiLang = 'es' | 'en';

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
  const baseUrl = import.meta.env.SLOWORK_API_URL as string | undefined;
  if (!baseUrl) throw new Error('SLOWORK_API_URL is not configured');

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  const { data, errors } = (await res.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };

  if (errors) {
    console.error('[GraphQL Error]:', errors);
    throw new Error(errors[0]?.message || 'Error en la consulta GraphQL');
  }

  if (!data) {
    throw new Error('Respuesta GraphQL sin datos');
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
  const data = await fetchGraphQL<{ getBlogs: BlogResponse }>(GET_BLOGS_QUERY, {
    currentPage: params.page,
    paginationSize: params.limit,
  });

  const lang = params.lang === 'es' ? 'es' : 'en';
  return {
    pageInfo: data.getBlogs.pageInfo,
    items: data.getBlogs.items.map((post) => localizeBlogPost(post, lang)),
  };
}

export async function getBlogById(params: { id: number; lang?: ApiLang }) {
  const data = await fetchGraphQL<{ getBlog: BlogPost }>(GET_BLOG_BY_ID_QUERY, {
    id: params.id,
  });

  const lang = params.lang === 'es' ? 'es' : 'en';
  return localizeBlogPost(data.getBlog, lang);
}

export async function getBlogBySlug(params: { slug: string; lang?: ApiLang }) {
  const data = await fetchGraphQL<{ getBlogBySlug: BlogPost }>(GET_BLOG_BY_SLUG_QUERY, {
    slug: params.slug,
  });

  const lang = params.lang === 'es' ? 'es' : 'en';
  return localizeBlogPost(data.getBlogBySlug, lang);
}
