# Products API

The Products API lets you browse your store's catalog — listing products, filtering by category or tag, searching, and reading product details. It is publicly accessible and does not require authentication.

## useProducts Hook

```tsx
import { useProducts } from '@cocartheadless/react-native-sdk';

// All products (default)
const { products, loading, error, refresh } = useProducts();

// Filter by category
const { products } = useProducts({ category: 'electronics' });

// Filter by tag
const { products } = useProducts({ tag: 'sale' });

// Custom filters (cheapest first: CoCart rejects plain 'price', use price_asc or price_desc)
const { products } = useProducts({
  filters: {
    per_page: '24',
    orderby: 'price_asc',
    min_price: '10',
    max_price: '100',
  },
});

// Disable auto-fetch (manual control)
const { products, refresh } = useProducts({ autoFetch: false });
// Call refresh() whenever you want to fetch
```

### useProducts Options

| Option | Type | Description |
|--------|------|-------------|
| `category` | `string` | Filter by category slug — calls `products().byCategory()` |
| `tag` | `string` | Filter by tag slug — calls `products().byTag()` |
| `filters` | `Record<string, string>` | Additional query params passed to `products().all()` |
| `autoFetch` | `boolean` | Auto-fetch on mount (default: `true`) |

> **Note:** `category` takes priority over `tag`, and both take priority over `filters`.

### Example: Product Listing Screen

```tsx
import React from 'react';
import { FlatList, View, Text, Image, Button, ActivityIndicator } from 'react-native';
import { useProducts, useCartMutations } from '@cocartheadless/react-native-sdk';

export function ProductListScreen() {
  const { products, loading, error, refresh } = useProducts({
    filters: { per_page: '12', orderby: 'popularity', order: 'desc' },
  });
  const { addItem } = useCartMutations();

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Failed to load products: {error.message}</Text>;

  // The list is under `products`, with the page count alongside
  const items = products?.get<any[]>('products', []) ?? [];

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      onRefresh={refresh}
      refreshing={loading}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          <Text>{item.prices.price}</Text>{/* minor units, e.g. '1800' */}
          <Button title="Add to Cart" onPress={() => addItem(item.id, 1)} />
        </View>
      )}
    />
  );
}
```

## Direct Client Access

For operations not covered by the hook (single product, variations, etc.), use `useCoCart()`:

```tsx
import { useCoCart } from '@cocartheadless/react-native-sdk';

function ProductDetailScreen({ productId }: { productId: number }) {
  const client = useCoCart();
  const [product, setProduct] = React.useState<any>(null);

  React.useEffect(() => {
    client.products().find(productId).then(response => {
      setProduct(response.toObject());
    });
  }, [productId]);

  // ...
}
```

### Common Methods

```tsx
const products = client.products();

// List all products
await products.all({ per_page: '20', page: '1' });

// Single product by ID
await products.find(123);

// Single product by slug
await products.findBySlug('blue-hoodie');

// Search
await products.search('wireless headphones');

// Featured
await products.featured();

// On sale
await products.onSale();

// By price range
await products.byPriceRange(10, 50);   // $10–$50
await products.byPriceRange(null, 25); // under $25
await products.byPriceRange(100);      // over $100

// By stock status
await products.byStockStatus('instock');

// Paginated
await products.paginate(1, 20); // page 1, 20 per page

// Sorted (CoCart rejects plain 'price': use 'price_asc' or 'price_desc')
await products.sortBy('price_asc');
await products.sortBy('date', 'desc');
await products.sortBy('popularity', 'desc');
```

### Variations

```tsx
// All variations for product 123
await products.variations(123);

// Specific variation
await products.variation(123, 456);
```

### Categories & Tags

```tsx
await products.categories();
await products.category(15);

await products.tags();
await products.tag(8);
```

`category()` and `tag()` take an ID; use `byCategory()` or `byTag()` with a slug to list their products.

### Reviews

```tsx
await products.reviews();
await products.productReviews(123);
await products.myReviews(); // the authenticated customer's reviews (CoCart Starter)

await products.createReview({
  product_id: 123,
  review: 'Warm and well made.',
  rating: 5,
  reviewer: 'Jane', // guests
  reviewer_email: 'jane@example.com',
});
```

### Shipping Rates for a Product

> Requires CoCart Plus.

Shipping rates for a product before it's added to the cart. Pass a variation ID, or the parent with the variation's attributes:

```tsx
const rates = await products.shippingRates(154, { quantity: 2 });
const rates = await products.shippingRates(134, {
  variation: { attribute_pa_color: 'blue' },
});
```

The request is sent without the cart key (the route prices a simulated cart and refuses one).

## Query Parameters Reference

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `per_page` | int | Items per page (default: 10, max: 100) |
| `search` | string | Search term |
| `category` | string | Filter by category slug |
| `tag` | string | Filter by tag slug |
| `featured` | bool | Show only featured products |
| `on_sale` | bool | Show only products on sale |
| `min_price` | string | Minimum price |
| `max_price` | string | Maximum price |
| `stock_status` | string | `instock`, `outofstock`, `onbackorder` |
| `orderby` | string | `date`, `id`, `menu_order`, `include`, `title`, `slug`, `name`, `alphabetical`, `reverse_alpha`, `popularity`, `sales`, `rating`, `review_count`, `by_stock`, `on_sale_first`, `featured_first`, `price_asc`, `price_desc`; `relevance` and `rand` need CoCart Starter. CoCart rejects `price` |
| `order` | string | `asc`, `desc` |

## Working with Product Responses

```tsx
const response = await client.products().find(123);

// Dot-notation access
response.get('name');
response.get('prices.price');       // minor units, e.g. '1800'
response.get('categories.0.name');
response.get('images.0.src.medium'); // `src` holds one URL per image size

// Full object
const product = response.toObject() as any;
console.log(product.name);
console.log(product.short_description);
```

### Pagination

```tsx
const response = await client.products().all({ per_page: '20' });

response.getTotalResults(); // total products across all pages
response.getTotalPages();   // total number of pages
```

See [Error Handling](error-handling.md) for handling API errors.
