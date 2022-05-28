import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { results, next_page } = postsPagination;

  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  async function handleLoadMore(): Promise<void> {
    const response = await fetch(nextPage, {
      method: 'GET',
    });
    const { results: fetchedPosts, next_page: fetchedNextPage } =
      await response.json();

    setPosts(prevState => [...prevState, ...fetchedPosts]);
    setNextPage(fetchedNextPage);
  }

  return (
    <div>
      <ul>
        {posts.map(post => (
          <li key={post.uid}>
            <h2>
              <Link href={`/post/${post.uid}`}>
                <a>{post.data.title}</a>
              </Link>
            </h2>
            <p>{post.data.subtitle}</p>
            <p>{post.data.author}</p>
            <p>
              {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                locale: ptBR,
              })}
            </p>
          </li>
        ))}
      </ul>

      {nextPage !== null ? (
        <button type="button" onClick={handleLoadMore}>
          Carregar mais posts
        </button>
      ) : null}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 1 });

  return {
    props: { postsPagination: postsResponse },
  };
};
