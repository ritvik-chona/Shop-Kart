const SearchBar = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categories,
}) => {
  return (
    <div className="filters">
      <input
        className="search-input"
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products..."
      />

      <select
        className="filter-select"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="">Newest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
};

export default SearchBar;
