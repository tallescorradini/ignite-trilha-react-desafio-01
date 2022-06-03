import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        type: string;
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

function countWords(text: string): number {
  return text.split(' ').length;
}

function extractBodyText(body: { type: string; text: string }[]): string {
  return body.reduce(
    (acc, content) => acc + content.text.replace('\n', ' '),
    ''
  );
}

function extractContextText(
  content: {
    heading: string;
    body?: { type: string; text: string }[];
  }[]
): string {
  return content.reduce((acc, { heading, body }) => {
    const bodyText = extractBodyText(body);

    return `${acc}${heading} ${bodyText}`;
  }, '');
}

function getEstimatedReadingTime(
  content: {
    heading: string;
    body?: { type: string; text: string }[];
  }[]
): string {
  const totalWords = countWords(extractContextText(content));
  const AVERAGE_READING_SPEED_PER_MINUTE = 200;
  const estimatedReadingTime = Math.ceil(
    totalWords / AVERAGE_READING_SPEED_PER_MINUTE
  );

  return `${estimatedReadingTime} min`;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />

      <main className="stack-80 inline-gutters-16 bottom-gutter-80">
        <div className={styles.banner}>
          <Image
            alt=""
            src={post.data.banner.url}
            layout="fill"
            objectFit="cover"
          />
        </div>

        <article className="center stack-64">
          <div className="stack-24">
            <h1 className="text-48">{post.data.title}</h1>
            <dl className={styles.metadataStrip}>
              <dt className="visually-hidden">Publicado em:</dt>
              <dd className={`text-14 ${styles.metadataContainer}`}>
                <FiCalendar aria-hidden="true" size="20" />
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </dd>

              <dt className="visually-hidden">Autor(a):</dt>
              <dd className={`text-14 ${styles.metadataContainer}`}>
                <FiUser aria-hidden="true" size="20" />
                {post.data.author}
              </dd>

              <dt className="visually-hidden">Tempo de leitura:</dt>
              <dd className={`text-14 ${styles.metadataContainer}`}>
                <FiClock aria-hidden="true" size="20" />
                {getEstimatedReadingTime(post.data.content)}
              </dd>
            </dl>
          </div>

          <div className={styles.postContent}>
            {post.data.content.map(element => (
              <div key={element.heading}>
                <h2 className={`text-36 ${styles.contentHeading}`}>
                  {element.heading}
                </h2>
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(element.body),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { first_publication_date, data, uid } = await prismic.getByUID(
    'posts',
    params.slug as string
  );

  return {
    props: {
      post: {
        data: {
          author: data.author,
          banner: {
            url: data.banner.url,
          },
          content: data.content,
          subtitle: data.subtitle,
          title: data.title,
        },
        first_publication_date,
        uid,
      },
    },
  };
};
