module PaginationHelper
  def rel_attribute(page)
    return 'next' if page.next?

    'prev' if page.prev?
  end
end
