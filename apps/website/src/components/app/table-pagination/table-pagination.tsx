import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ReactNode, useMemo } from 'react';

export type TablePaginationProps = {
  currentPage: number;
  maxPage: number;
};
export const TablePagination = ({
  currentPage,
  maxPage,
}: TablePaginationProps) => {
  const pages = useMemo(() => {
    let start = currentPage - 1;

    if (currentPage === maxPage) {
      start = currentPage - 2;
    }

    if (start < 1) {
      start = 1;
    }

    const pages: ReactNode[] = [];

    while (pages.length < 3 && start <= maxPage) {
      pages.push(
        <PaginationItem key={start}>
          <PaginationLink
            href={`?page=${start}`}
            isActive={start === currentPage}
          >
            {start}
          </PaginationLink>
        </PaginationItem>,
      );
      start++;
    }

    return pages;
  }, [currentPage, maxPage]);

  return (
    <Pagination className="p-4 justify-end">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={`?page=${currentPage - 1}`} />
          </PaginationItem>
        )}

        {currentPage > 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {pages}
        {maxPage > 3 && currentPage <= maxPage - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {currentPage < maxPage && (
          <PaginationItem>
            <PaginationNext href={`?page=${currentPage + 1}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
