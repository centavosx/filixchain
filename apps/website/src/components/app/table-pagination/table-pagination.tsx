import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useAppSearchParams } from '@/hooks/use-app-search-params';

import { Fragment, ReactNode, useMemo } from 'react';

export type TablePaginationProps = {
  currentPage: number;
  maxPage: number;
};
export const TablePagination = ({
  currentPage,
  maxPage,
}: TablePaginationProps) => {
  const { updateAndGetString } = useAppSearchParams<{ page: number }>();

  const pages = useMemo(() => {
    let start = currentPage - 2;

    if (currentPage >= maxPage - 1) {
      start = maxPage - 4;
    }

    if (start < 1) {
      start = 1;
    }

    const pages: ReactNode[] = [];

    while (pages.length <= 4 && start <= maxPage) {
      pages.push(
        <PaginationItem key={start}>
          <PaginationLink
            href={updateAndGetString({
              page: start,
            })}
            isActive={start === currentPage}
          >
            {start}
          </PaginationLink>
        </PaginationItem>,
      );
      start++;
    }

    return pages;
  }, [currentPage, maxPage, updateAndGetString]);

  return (
    <Pagination className="p-4 justify-end">
      <PaginationContent>
        {currentPage > 1 && (
          <Fragment>
            <PaginationItem>
              <PaginationFirst
                href={updateAndGetString({
                  page: 1,
                })}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                href={updateAndGetString({
                  page: currentPage - 1,
                })}
              />
            </PaginationItem>
          </Fragment>
        )}

        {currentPage > 5 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {pages}
        {maxPage > 5 && currentPage <= maxPage - 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {currentPage < maxPage && (
          <Fragment>
            <PaginationItem>
              <PaginationNext
                href={updateAndGetString({
                  page: currentPage + 1,
                })}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLast
                href={updateAndGetString({
                  page: maxPage,
                })}
              />
            </PaginationItem>
          </Fragment>
        )}
      </PaginationContent>
    </Pagination>
  );
};
