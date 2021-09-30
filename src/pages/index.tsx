import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

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

function handlePostFormat(postsResponse) {
  const posts = postsResponse.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    }
  }))
  return posts;
}

function handlePostDateFormat(postsResults) {
  const posts = postsResults.map(post => ({
    ...post,
    first_publication_date: dateFormat(post.first_publication_date)
  }))
  return posts;
}

export default function Home({ postsPagination }: HomeProps) {
  const parsedPosts = handlePostDateFormat(postsPagination.results);

  const [posts, setPosts] = useState<Post[]>(parsedPosts);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  async function handleNewPosts() {
    const response = await fetch(nextPage)
                            .then(response => response.json());

    const newPosts = handlePostDateFormat(handlePostFormat(response.results));
    setPosts([...posts, ...newPosts]);
    setNextPage(response.next_page);
  }

  return (
    <>
      <Head>
        <title>Home - Spacetraveling</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          { posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={commonStyles.postInfo}>
                  <time><FiCalendar />{post.first_publication_date}</time>
                  <span><FiUser />{post.data.author}</span>
                </div>
              </a>
            </Link>
          )) }
          { nextPage && <span onClick={handleNewPosts} className={styles.loadPosts} >Carregar mais posts</span>}
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

  const posts: Post[] = handlePostFormat(postsResponse.results);

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
