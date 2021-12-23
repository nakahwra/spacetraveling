import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';
import Prismic from "@prismicio/client";

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { dateFormat } from '../../utils/helpers';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  
  return (
    <>
      <div className={styles.imgContainer}>
        <img src={post.data.banner.url} alt="banner" />
      </div>
      <div className={`${commonStyles.container} ${styles.post}`}>
        { router.isFallback ? (
          <h1>Carregando...</h1>
        ) : (
          <h1>{ post.data.title }</h1>
        )}

        {/* TODO: Turn this into a component */}
        <div className={commonStyles.postInfo}>
          <time><FiCalendar />{ dateFormat(post.first_publication_date) }</time>
          <span><FiUser />{ post.data.author }</span>
          <span><FiClock />4 min</span>
        </div>
        {post.data.content.map(section => {
          return (
            <section key={section.heading}>
              <h2>{ section.heading }</h2>
              <div dangerouslySetInnerHTML={{ 
                __html: RichText.asHtml(section.body)
              }}></div>
            </section>
          )
        })}
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ]);
  
  const paths = postsResponse.results.map(post => ({
    params: { slug: post.uid }
  }))

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: [
        ...response.data.content
      ]
    }
  }

  return {
    props: {
      post,
    }
  }
};
