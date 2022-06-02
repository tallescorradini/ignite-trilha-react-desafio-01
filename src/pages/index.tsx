import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';

import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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
    <>
      <Header />

      <main className="center inline-gutters-16 stack-64">
        <ul className="stack-48">
          {posts.map(post => (
            <li key={post.uid} className="stack-24">
              <div className="stack-8">
                <h2>
                  <Link href={`/post/${post.uid}`}>
                    <a className="link-as-text text-28">{post.data.title}</a>
                  </Link>
                </h2>
                <p className="text-18"> {post.data.subtitle}</p>
              </div>

              <dl className={styles.metadataStrip}>
                <dt className="visually-hidden">Publicado:</dt>
                <dd className={`text-14 ${styles.metadataContainer}`}>
                  <FiCalendar aria-hidden="true" size="20" />
                  {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                    locale: ptBR,
                  })}
                </dd>

                <dt className="visually-hidden">Autor:</dt>
                <dd className={`text-14 ${styles.metadataContainer}`}>
                  <FiUser aria-hidden="true" size="20" />
                  {post.data.author}
                </dd>
              </dl>
            </li>
          ))}
        </ul>

        {nextPage !== null ? (
          <button
            onClick={handleLoadMore}
            type="button"
            className="button-as-text text-18 text-semibold text-pink-6"
          >
            Carregar mais posts
          </button>
        ) : null}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');

  return {
    props: { postsPagination: postsResponse },
  };
};
