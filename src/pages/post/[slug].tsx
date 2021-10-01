import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';
import Prismic from "@prismicio/client";

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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

export default function Post() {
  return (
    <>
      <div className={styles.imgContainer}>
        <img src="/banner.png" alt="banner" />
      </div>
      <div className={`${commonStyles.container} ${styles.post}`}>
        <h1>Criando um app CRA do zero</h1>

        {/* TODO: Turn this into a component */}
        <div className={commonStyles.postInfo}>
          <time><FiCalendar />12/12/12</time>
          <span><FiUser />Elma Maria</span>
          <span><FiClock />4 min</span>
        </div>

        <main>
          <h2>Proin et varius</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Nullam dolor sapien, vulputate eu diam at, condimentum hendrerit tellus.
            Nam facilisis sodales felis, pharetra pharetra lectus auctor sed.
            Ut venenatis mauris vel libero pretium, et pretium ligula faucibus. 
            Morbi nibh felis, elementum a posuere et, vulputate et erat. 
            Nam venenatis.
          </p>

          <h2>Cras laoreet mi</h2>
          <p>
            Nulla auctor sit amet quam vitae commodo. Sed risus justo, vulputate quis neque eget, dictum sodales sem. In eget felis finibus, mattis magna a, efficitur ex. Curabitur vitae justo consequat sapien gravida auctor a non risus. Sed malesuada mauris nec orci congue, interdum efficitur urna dignissim. Vivamus cursus elit sem, vel facilisis nulla pretium consectetur. Nunc congue.
            Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aliquam consectetur massa nec metus condimentum, sed tincidunt enim tincidunt. Vestibulum fringilla risus sit amet massa suscipit eleifend. Duis eget metus cursus, suscipit ante ac, iaculis est. 
            Donec accumsan enim sit amet lorem placerat, eu dapibus ex porta. Etiam a est in leo pulvinar auctor. 
            Praesent sed vestibulum elit, consectetur egestas libero.
          </p>
        </main>
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
