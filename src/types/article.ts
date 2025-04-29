export type ArticleCategory = 
  | 'gods-myths-afterlife'
  | 'pharaohs'
  | 'everyday-life'
  | 'engineering-marvels'
  | 'hieroglyphs-art-innovation';

export interface ArticleImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface ArticleSection {
  title: string;
  content: string;
  images?: ArticleImage[];
}

export interface ArticleReference {
  author?: string;
  title: string;
  publicationYear?: string;
  url?: string;
  type: 'book' | 'article' | 'website' | 'journal';
}

export interface ArticleAuthor {
  name: string;
  title: string;
  bio: string;
  image?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  date: string;
  readTime: number;
  excerpt: string;
  mainImage: ArticleImage;
  additionalImages?: ArticleImage[];
  sections: ArticleSection[];
  author: ArticleAuthor;
  references?: ArticleReference[];
  relatedArticles?: string[]; // Array of article IDs
  tableOfContents?: string[];
}

export interface TableOfContents {
  title: string;
  slug: string;
  items?: TableOfContents[];
}