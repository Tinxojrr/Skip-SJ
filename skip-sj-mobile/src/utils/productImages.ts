// Mapeo curado de imágenes de alta fidelidad para cada producto del catálogo de Duoc UC San Joaquín.
// Garantiza que cada plato muestre exactamente su comida real (ej: Empanada de Pino muestra empanada al horno,
// Choclos muestra granos de maíz, Completos muestra hot dog con aderezos, Salchipapas muestra papas con salchicha).

const KNOWN_PRODUCT_IMAGES: Record<string, string> = {
  // Castaño - Empanadas y Bollería
  "Empanada de Pino de Horno": "https://images.unsplash.com/photo-1608039783021-6116a558f0c5?q=80&w=1200",
  "Empanada Napolitana": "https://images.unsplash.com/photo-1521732670659-b8c918da61dc?q=80&w=1200",
  "Chaparrita Salchicha Queso": "https://images.unsplash.com/photo-1783196736270-4902f85f06f7?q=80&w=1200",
  "Muffin de Arándanos": "https://images.unsplash.com/photo-1722251172903-cc8774501df7?q=80&w=1200",
  "Porción Torta Milhojas": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=1200",
  "Sándwich Miga Jamón Queso": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1200",
  "Café Latte Mediano": "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1200",

  // Achoclonado - Choclos y Snacks
  "Choclo Mediano Tradicional": "https://images.unsplash.com/photo-1635843107983-264f83647ba3?q=80&w=1200",
  "Choclo Grande Premium Carne": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=1200",
  "Choclo Vegetariano Champiñón": "https://images.unsplash.com/photo-1641914086759-6f76fae98cd9?q=80&w=1200",
  "Porción de Nachos con Queso": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=1200",
  "Coca-Cola Zero Lata 350ml": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1200",

  // Comedor - Almuerzos y Menús
  "Menú Junaeb: Lasaña Boloñesa": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=1200",
  "Menú Junaeb: Pollo con Arroz": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200",
  "Ensalada César con Pollo": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=1200",
  "Leche Asada Casera": "https://images.unsplash.com/photo-1718939043329-b956bee61dbb?q=80&w=1200",

  // Paradiso - Cafetería y Comidas
  "Promo 2x1 Café Americano": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200",
  "Sándwich Barros Luco": "https://images.unsplash.com/photo-1619860860774-1e2e17343432?q=80&w=1200",
  "Pizza Pepperoni Individual": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200",
  "RedBull Energy Drink 250ml": "https://images.unsplash.com/photo-1632763358154-6780449d2313?q=80&w=1200",

  // Local -1 - Frituras y Platos Típicos
  "Sopaipilla Sola": "https://images.unsplash.com/photo-1769030470963-f821c4c1ab76?q=80&w=1200",
  "Promo 3 Sopaipillas con Palta": "https://images.unsplash.com/photo-1769030470963-f821c4c1ab76?q=80&w=1200",
  "Completo Italiano": "https://images.unsplash.com/photo-1515875976234-9d59c3ef288d?q=80&w=1200",
  "Hamburguesa Casera Completa": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200",
  "Salchipapas Grandes": "https://images.unsplash.com/photo-1615535248348-0457731f2dc2?q=80&w=1200"
};

// URLs antiguas que se detectaron con contenido no correspondiente (ej: papas fritas asignadas a empanadas)
const MISMATCHED_URLS = new Set([
  "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=2000", // Papas fritas puestas en empanadas
  "https://images.unsplash.com/photo-1574783756547-258b3c720fe9?q=80&w=2000", // Sartén con huevos puesto en choclo
  "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?q=80&w=2000", // Carne cruda puesta en choclo
  "https://images.unsplash.com/photo-1627308595229-7830f5c92f83?q=80&w=2000", // 404
  "https://images.unsplash.com/photo-1557925923-33b251d5b9d2?q=80&w=2000", // 404
  "https://images.unsplash.com/photo-1590218731173-05b10eefbda1?q=80&w=2000", // 404
  "https://images.unsplash.com/photo-1513104890f38-7c7f476f4c71?q=80&w=2000", // 404
  "https://images.unsplash.com/photo-1626074964464-967a57a5cda6?q=80&w=2000", // 404
  "https://images.unsplash.com/photo-1599599811450-2c5940ebbdf0?q=80&w=2000", // 404
  "https://images.unsplash.com/photo-1625937751876-4515cd8e78bf?q=80&w=2000"  // 404
]);

/**
 * Resuelve la imagen adecuada para un producto garantizando concordancia visual directa.
 */
export function getProductImage(product?: { nombre_producto?: string; imagen_url?: string | null } | null): string | null {
  if (!product) return null;

  const name = product.nombre_producto || "";
  
  // 1. Si el producto tiene una imagen conocida curada para su nombre exacto
  if (name && KNOWN_PRODUCT_IMAGES[name]) {
    // Si la imagen que viene de base de datos no existe o es una de las URLs erróneas conocidas, usar la curada
    if (!product.imagen_url || MISMATCHED_URLS.has(product.imagen_url)) {
      return KNOWN_PRODUCT_IMAGES[name];
    }
  }

  // 2. Si no es una URL errónea y existe, usar la de base de datos
  if (product.imagen_url && !MISMATCHED_URLS.has(product.imagen_url)) {
    return product.imagen_url;
  }

  // 3. Fallback por nombre parcial
  if (name) {
    const lower = name.toLowerCase();
    if (lower.includes('empanada')) return KNOWN_PRODUCT_IMAGES["Empanada de Pino de Horno"];
    if (lower.includes('choclo')) return KNOWN_PRODUCT_IMAGES["Choclo Mediano Tradicional"];
    if (lower.includes('completo')) return KNOWN_PRODUCT_IMAGES["Completo Italiano"];
    if (lower.includes('chaparrita')) return KNOWN_PRODUCT_IMAGES["Chaparrita Salchicha Queso"];
    if (lower.includes('sopaipilla')) return KNOWN_PRODUCT_IMAGES["Sopaipilla Sola"];
    if (lower.includes('salchipapa')) return KNOWN_PRODUCT_IMAGES["Salchipapas Grandes"];
    if (lower.includes('pizza')) return KNOWN_PRODUCT_IMAGES["Pizza Pepperoni Individual"];
    if (lower.includes('muffin')) return KNOWN_PRODUCT_IMAGES["Muffin de Arándanos"];
    if (lower.includes('leche asada') || lower.includes('flan')) return KNOWN_PRODUCT_IMAGES["Leche Asada Casera"];
    if (lower.includes('redbull') || lower.includes('energética')) return KNOWN_PRODUCT_IMAGES["RedBull Energy Drink 250ml"];
    if (lower.includes('hamburguesa')) return KNOWN_PRODUCT_IMAGES["Hamburguesa Casera Completa"];
    if (lower.includes('café') || lower.includes('latte')) return KNOWN_PRODUCT_IMAGES["Café Latte Mediano"];
    if (lower.includes('lasaña') || lower.includes('lasagna')) return KNOWN_PRODUCT_IMAGES["Menú Junaeb: Lasaña Boloñesa"];
    if (lower.includes('pollo')) return KNOWN_PRODUCT_IMAGES["Menú Junaeb: Pollo con Arroz"];
    if (lower.includes('ensalada')) return KNOWN_PRODUCT_IMAGES["Ensalada César con Pollo"];
  }

  return product.imagen_url || null;
}

