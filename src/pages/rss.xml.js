import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/consts';

export async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			// `post.id` es el id interno de Astro Content Collections (ej: "en/archivo.md").
			// La URL pública real del artículo es "/{lang}/blog/{slug}/".
			link: (() => {
				const language = post.data.language ?? post.id.split('/')[0] ?? 'es';
				const slug = post.id.split('/').pop()?.replace(/\.(md|mdx)$/, '') ?? '';
				return `/${language}/blog/${slug}/`;
			})(),
		})),
	});
}
