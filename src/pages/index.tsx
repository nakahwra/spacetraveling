import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';
import Prismic from "@prismicio/client";

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { dateFormat } from '../utils/helpers';

import { FiCalendar, FiUser } from 'react-icons/fi'

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

export default function Home({ postsPagination }: HomeProps) {
  const parsedPosts = postsPagination.results.map(post => ({
    ...post,
    first_publication_date: dateFormat(post.first_publication_date)
  }))

  const [posts, setPosts] = useState<Post[]>(parsedPosts);

  return (
    <>
      <Head>
        <title>Home - Spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          { posts.map(post => (
            <a href="" key={post.uid}>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div>
                <time><FiCalendar className={styles.icons} />{post.first_publication_date}</time>
                <span><FiUser className={styles.icons} />{post.data.author}</span>
              </div>
            </a>
          )) }
          <span className={styles.loadPosts} >Carregar mais posts</span>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'
  ), {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 1,
  });

  const posts: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination,
    }
  };
};
