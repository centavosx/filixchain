'use server';

import { Block as ApiBlock, BaseApi } from '@ph-blockchain/api';
import { AppHash } from '@ph-blockchain/hash';
import { redirect } from 'next/navigation';

export const redirectToPage = async (normalizedValue: string) => {
  const isHash = new RegExp(AppHash.HASH_REGEX).test(normalizedValue);
  if (isHash) {
    if (normalizedValue.length === 40) {
      redirect(`/account/${normalizedValue}`);
    }

    if (normalizedValue.length === 64) {
      let height: number | undefined;

      try {
        BaseApi.init('http://localhost:3002/api');
        const block = (await ApiBlock.getBlockByHash(normalizedValue))?.data;
        height = block.height;
      } catch (e) {
        console.log(e);
      }

      if (height !== undefined) {
        redirect(`/block/${height}`);
      }

      redirect(`/transaction/${normalizedValue}`);
    }
  }

  if (/^\d+$/g.test(normalizedValue)) {
    redirect(`/block/${normalizedValue}`);
  }
};
