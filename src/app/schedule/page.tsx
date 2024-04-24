'use client';

import { useRouter } from 'next/navigation';
import { paths } from 'src/paths';

const Page = () => {
  const router = useRouter();

  router.push(paths.login);

  return null;
};

export default Page;
