import { cn } from '@/lib/utils';
import { createElement, forwardRef, HTMLAttributes } from 'react';

const textClass = {
  h1: cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'),
  h2: cn(
    'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
  ),
  h3: cn('scroll-m-20 text-2xl font-semibold tracking-tight'),
  h4: cn('scroll-m-20 text-xl font-semibold tracking-tight'),
  p: cn('leading-7'),
  code: cn(
    'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
  ),
  blockquote: cn('mt-6 border-l-2 pl-6 italic'),
  lead: cn('text-xl text-muted-foreground'),
  large: cn('text-lg font-semibold'),
  small: cn('text-sm font-medium leading-none'),
  muted: cn('text-sm text-muted-foreground'),
} as const;

const textEls = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p: 'p',
  blockquote: 'blockquote',
  code: 'code',
  lead: 'p',
  large: 'span',
  small: 'small',
  muted: 'p',
} as const;

export type TypographyProps = {
  as?: keyof typeof textEls;
} & HTMLAttributes<HTMLElement>;

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ as = 'p', className, ...rest }, ref) => {
    return createElement(textEls[as], {
      ref,
      ...rest,
      className: cn(textClass[as], 'break-all', className),
    });
  },
);

Typography.displayName = 'Typography';
